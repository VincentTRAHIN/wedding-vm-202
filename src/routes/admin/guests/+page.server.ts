import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import { invitationTypeSchema } from '$lib/server/validation';

const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: guestsData, error } = await (supabase as any)
		.from('guests')
		.select('*')
		.order('full_name', { ascending: true, nullsFirst: false });

	if (error) {
		console.error('Error fetching guests:', error);
		return { guests: [], rooms: [] };
	}

	// Manually resolve managed_by relationship to avoid PostgREST recursion issues
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const guests = guestsData.map((guest: any) => {
		if (guest.managed_by_id) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const manager = guestsData.find((g: any) => g.id === guest.managed_by_id);
			return {
				...guest,
				managed_by: manager ? { full_name: manager.full_name } : null
			};
		}
		return { ...guest, managed_by: null };
	});

	const { data: rooms, error: roomsError } = await supabase
		.from('rooms')
		.select('id, name, capacity')
		.order('name');

	if (roomsError) {
		console.error('Error fetching rooms:', roomsError);
	}

	return {
		guests,
		rooms: rooms || []
	};
};

const addGuestSchema = z.object({
	email: z.string().email().optional().or(z.literal('')),
	full_name: z.string().min(1, 'Le nom est requis'),
	is_child: z.literal('on').optional(),
	invitation_type: invitationTypeSchema.default('complet')
});

const editGuestSchema = addGuestSchema.extend({
	id: z.string().uuid(),
	room_id: z.string().uuid().optional().or(z.literal(''))
});

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);

		const result = addGuestSchema.safeParse(rawData);

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors
			});
		}

		const { email, full_name, is_child, invitation_type } = result.data;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const insertData: any = {
			full_name,
			expected_count: 1,
			role: 'guest',
			managed_by_id: null,
			is_child: is_child === 'on',
			invitation_type
		};

		if (email) {
			insertData.email = email.toLowerCase();
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabaseAdmin as any).from('guests').insert(insertData);

		if (error) {
			console.error('Add Guest Error:', error);
			if (error.code === '23505') {
				return fail(400, { message: 'Cet email est déjà invité.' });
			}
			return fail(500, { message: "Erreur lors de l'ajout." });
		}

		return { success: true };
	},

	edit: async ({ request }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);

		const result = editGuestSchema.safeParse(rawData);

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors
			});
		}

		const { id, email, full_name, is_child, invitation_type, room_id } = result.data;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updateData: any = {
			full_name,
			email: email ? email.toLowerCase() : null,
			is_child: is_child === 'on',
			invitation_type,
			room_id: room_id || null
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabaseAdmin as any).from('guests').update(updateData).eq('id', id);

		if (error) {
			console.error('Edit Guest Error:', error);
			if (error.code === '23505') {
				return fail(400, { message: 'Cet email est déjà utilisé.' });
			}
			return fail(500, { message: 'Erreur lors de la modification.' });
		}

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id || typeof id !== 'string') {
			return fail(400, { message: 'ID invalide.' });
		}

		// 1. Fetch photos to delete from storage
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: photos } = await (supabaseAdmin as any)
			.from('photos')
			.select('storage_path')
			.eq('guest_id', id);

		if (photos && photos.length > 0) {
			const paths = photos.map((p: { storage_path: string }) => p.storage_path);
			const { error: storageError } = await supabaseAdmin.storage.from('photos').remove(paths);
			if (storageError) {
				console.error('Error deleting photos from storage:', storageError);
				// Continue anyway to delete from DB
			}

			// 2. Delete photo records (Manual cascade)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { error: photosDeleteError } = await (supabaseAdmin as any)
				.from('photos')
				.delete()
				.eq('guest_id', id);

			if (photosDeleteError) {
				console.error('Error deleting photo records:', photosDeleteError);
				return fail(500, { message: 'Erreur lors de la suppression des photos.' });
			}
		}

		// 3. Delete guest
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabaseAdmin as any).from('guests').delete().eq('id', id);

		if (error) {
			console.error('Delete Guest Error:', error);
			return fail(500, { message: 'Erreur lors de la suppression.' });
		}

		return { success: true };
	},

	bulkUpdateType: async ({ request }) => {
		const formData = await request.formData();
		const guestIds = formData.getAll('guest_ids') as string[];
		const invitationType = formData.get('invitation_type') as string;

		const schema = z.object({
			guest_ids: z.array(z.string().uuid()).min(1, 'Sélectionnez au moins un invité'),
			invitation_type: invitationTypeSchema
		});

		const result = schema.safeParse({ guest_ids: guestIds, invitation_type: invitationType });

		if (!result.success) {
			return fail(400, {
				message: 'Données invalides',
				errors: result.error.flatten().fieldErrors
			});
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabaseAdmin as any)
			.from('guests')
			.update({ invitation_type: result.data.invitation_type })
			.in('id', result.data.guest_ids);

		if (error) {
			console.error('Bulk Update Type Error:', error);
			return fail(500, { message: 'Erreur lors de la mise à jour groupée.' });
		}

		return { success: true, count: result.data.guest_ids.length };
	},

	unlinkAccount: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id || typeof id !== 'string') {
			return fail(400, { message: 'ID invalide.' });
		}

		// Verify guest has an auth_id
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: guest } = await (supabaseAdmin as any)
			.from('guests')
			.select('auth_id')
			.eq('id', id)
			.single();

		if (!guest || !guest.auth_id) {
			return fail(400, { message: "Cet invité n'a pas de compte lié." });
		}

		// Reset auth_id and RSVP
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabaseAdmin as any)
			.from('guests')
			.update({
				auth_id: null,
				rsvp_status: 'pending',
				present_saturday: null,
				present_sunday: null,
				dietary_restrictions: null,
				message_for_couple: null
			})
			.eq('id', id);

		if (error) {
			console.error('Unlink Account Error:', error);
			return fail(500, { message: 'Erreur lors de la déliaison du compte.' });
		}

		return { success: true };
	}
};
