import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (!user) throw redirect(303, '/login');

	const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	// Fetch self
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: guest } = await (supabaseAdmin as any)
		.from('guests')
		.select('*')
		.eq('auth_id', user.id)
		.limit(1)
		.maybeSingle();

	if (!guest) {
		// If user is logged in but has no guest profile, redirect to claim
		throw redirect(303, '/claim-profile');
	}

	// Fetch managed guests
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: managedGuests } = await (supabaseAdmin as any)
		.from('guests')
		.select('*')
		.eq('managed_by_id', guest.id);

	// Fetch eligible guests for selector
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: eligibleGuests } = await (supabaseAdmin as any)
		.from('guests')
		.select('id, full_name')
		.is('auth_id', null)
		.is('managed_by_id', null)
		.neq('rsvp_status', 'present')
		.neq('id', guest.id)
		.order('full_name');

	return {
		guest,
		managedGuests: managedGuests || [],
		eligibleGuests: eligibleGuests || [],
		RSVP_DEADLINE: '2026-05-01'
	};
};

const rsvpSchema = z.object({
	rsvp_status: z.enum(['present', 'absent']),
	present_saturday: z.boolean().optional(),
	present_sunday: z.boolean().optional(),
	dietary_restrictions: z.string().optional(),
	message_for_couple: z.string().max(1000, 'Message trop long (1000 caractères max)').optional()
});

import { sendRsvpConfirmation, sendGuestInvitation, sendAdminAlert } from '$lib/server/email';

export const actions: Actions = {
	update: async ({ request, locals: { user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// Fetch self to get ID
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: currentUserGuest } = await (supabaseAdmin as any)
			.from('guests')
			.select('id')
			.eq('auth_id', user.id)
			.single();

		if (!currentUserGuest) return fail(400, { message: 'Guest profile not found' });

		// 1. Get all relevant guests (Self + Managed)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: guests } = await (supabaseAdmin as any)
			.from('guests')
			.select('id, auth_id, managed_by_id, full_name, email, invitation_code, invitation_sent')
			.or(`id.eq.${currentUserGuest.id},managed_by_id.eq.${currentUserGuest.id}`);

		if (!guests) return fail(500, { message: 'Error fetching guests' });

		const errors: Record<string, unknown> = {};
		let hasError = false;
		const updatedGuestsList: { full_name: string; rsvp_status: string }[] = [];
		let mainGuestStatus = 'pending';

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		for (const guest of guests as any[]) {
			const prefix = `guest_${guest.id}_`;
			const status = formData.get(`${prefix}rsvp_status`);

			// If no status provided for this guest, skip (maybe UI didn't render them or they are hidden)
			// But for "Group RSVP", we usually submit all.
			if (!status) continue;

			const rawData = {
				rsvp_status: status,
				present_saturday: formData.get(`${prefix}present_saturday`) === 'on',
				present_sunday: formData.get(`${prefix}present_sunday`) === 'on',
				dietary_restrictions: formData.get(`${prefix}dietary_restrictions`) || undefined,
				message_for_couple: formData.get(`${prefix}message_for_couple`) || undefined
			};

			const result = rsvpSchema.safeParse(rawData);

			if (!result.success) {
				errors[guest.id] = result.error.flatten().fieldErrors;
				hasError = true;
				continue;
			}

			const {
				rsvp_status,
				present_saturday,
				present_sunday,
				dietary_restrictions,
				message_for_couple
			} = result.data;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { error } = await (supabaseAdmin as any)
				.from('guests')
				.update({
					rsvp_status,
					present_saturday: rsvp_status === 'present' ? present_saturday : null,
					present_sunday: rsvp_status === 'present' ? present_sunday : null,
					dietary_restrictions,
					message_for_couple
				})
				.eq('id', guest.id);

			if (error) {
				console.error(`Error updating guest ${guest.id}:`, error);
				errors[guest.id] = { server: 'Update failed' };
				hasError = true;
			} else {
				// Track for emails
				updatedGuestsList.push({ full_name: guest.full_name, rsvp_status });

				if (guest.id === currentUserGuest.id) {
					mainGuestStatus = rsvp_status;
				}

				// Send Invitation to secondary guests if they are present, have email, and haven't received one yet
				if (
					rsvp_status === 'present' &&
					guest.email &&
					guest.id !== currentUserGuest.id &&
					guest.email !== user.email &&
					!guest.invitation_sent
				) {
					console.log(
						`📧 Sending invitation to secondary guest: ${guest.email} (${guest.full_name})`
					);

					// Mark as sent first to prevent duplicates
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					await (supabaseAdmin as any)
						.from('guests')
						.update({ invitation_sent: true })
						.eq('id', guest.id);

					// Fire and forget
					const emailResult = await sendGuestInvitation(
						guest.email,
						guest.full_name,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						(guests as any[]).find((g) => g.id === currentUserGuest.id)?.full_name || 'Un proche'
					);

					if (emailResult.success) {
						console.log(`✅ Invitation sent to ${guest.email}`);
					} else {
						console.error(`❌ Failed to send invitation to ${guest.email}:`, emailResult.error);
					}
				}
			}
		}

		if (hasError) {
			return fail(400, { errors, message: 'Some updates failed' });
		}

		// Send Confirmation to Main Guest
		if (user.email) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const mainGuestName = (guests as any[]).find((g) => g.id === currentUserGuest.id)?.full_name;
			await sendRsvpConfirmation(user.email, mainGuestName || 'Invité', updatedGuestsList);
		}

		// Send Admin Alert
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const mainGuestName = (guests as any[]).find((g) => g.id === currentUserGuest.id)?.full_name;
		await sendAdminAlert(mainGuestName || 'Inconnu', mainGuestStatus, updatedGuestsList);

		return { success: true };
	},

	addManagedGuest: async ({ request, locals: { user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);
		const isChild = rawData.is_child === 'on';
		const noEmail = rawData.no_email === 'on';

		// Email is optional for children or when explicitly marked as no-email
		const schema = z.object({
			guestId: z.string().uuid(),
			email:
				isChild || noEmail
					? z.string().email().optional().or(z.literal(''))
					: z.string().email('Email invalide'),
			is_child: z.literal('on').optional(),
			no_email: z.literal('on').optional()
		});

		const result = schema.safeParse(rawData);

		if (!result.success) {
			return fail(400, {
				message: 'Données invalides',
				errors: result.error.flatten().fieldErrors
			});
		}

		const { guestId, email } = result.data;

		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// Fetch self to get ID and Name
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: currentUserGuest } = await (supabaseAdmin as any)
			.from('guests')
			.select('id, full_name')
			.eq('auth_id', user.id)
			.limit(1)
			.maybeSingle();

		if (!currentUserGuest) return fail(400, { message: 'Guest profile not found' });

		// Generate Invitation Code
		const invitationCode = `GUEST-${Math.floor(1000 + Math.random() * 9000)}`;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updateData: any = {
			managed_by_id: currentUserGuest.id,
			is_child: isChild,
			rsvp_status: 'present', // Always present when added via this flow
			invitation_code: invitationCode
			// NOTE: invitation_sent will be set to true AFTER successful email send
		};

		if (email) {
			updateData.email = email.toLowerCase();
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: updatedGuest, error } = await (supabaseAdmin as any)
			.from('guests')
			.update(updateData)
			.eq('id', guestId)
			.is('managed_by_id', null)
			.is('auth_id', null)
			.select('full_name')
			.single();

		if (error) {
			console.error('Error adding managed guest:', error);
			if (error.code === '23505') {
				return fail(400, { message: 'Cet email est déjà utilisé.' });
			}
			return fail(500, { message: 'Failed to add guest' });
		}

		// Send invitation email only for adults with email
		if (!isChild && email && updatedGuest) {
			console.log(
				`📧 Sending invitation email to ${email} (${updatedGuest.full_name}) from ${currentUserGuest.full_name}`
			);

			try {
				const emailResult = await sendGuestInvitation(
					email,
					updatedGuest.full_name,
					currentUserGuest.full_name
				);

				if (emailResult.success) {
					console.log(`✅ Invitation email sent successfully to ${email}`);

					// Mark as sent only AFTER successful send
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					await (supabaseAdmin as any)
						.from('guests')
						.update({ invitation_sent: true })
						.eq('id', guestId);
				} else {
					console.error(`❌ Failed to send invitation email to ${email}:`, emailResult.error);
					// Don't fail the whole operation, just log the error
				}
			} catch (err) {
				console.error(`❌ Exception while sending email to ${email}:`, err);
				// Don't fail the whole operation
			}
		} else {
			if (isChild) {
				console.log(`ℹ️ Skipping email for child: ${updatedGuest?.full_name}`);
			} else if (!email) {
				console.log(`ℹ️ Skipping email - no email provided for: ${updatedGuest?.full_name}`);
			}
		}

		return { success: true };
	},

	removeManagedGuest: async ({ request, locals: { user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const guestId = formData.get('guestId') as string;

		if (!guestId) return fail(400, { message: 'Guest ID required' });

		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// Fetch self to get ID
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: currentUserGuest } = await (supabaseAdmin as any)
			.from('guests')
			.select('id')
			.eq('auth_id', user.id)
			.limit(1)
			.maybeSingle();

		if (!currentUserGuest) return fail(400, { message: 'Guest profile not found' });

		// Verify the guest is managed by the current user
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: guestToRemove } = await (supabaseAdmin as any)
			.from('guests')
			.select('id')
			.eq('id', guestId)
			.eq('managed_by_id', currentUserGuest.id)
			.single();

		if (!guestToRemove) {
			return fail(403, { message: 'You do not manage this guest' });
		}

		// Update the guest to remove management link
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabaseAdmin as any)
			.from('guests')
			.update({
				managed_by_id: null,
				rsvp_status: 'pending',
				is_child: false,
				invitation_code: null,
				email: null
			})
			.eq('id', guestId);

		if (error) {
			console.error('Error removing managed guest:', error);
			return fail(500, { message: 'Failed to remove guest' });
		}

		return { success: true };
	}
};
