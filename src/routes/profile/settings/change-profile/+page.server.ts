import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';
import { z } from 'zod';

export const prerender = false;

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (!user) throw redirect(303, '/login');

	const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	// Fetch current guest
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: currentGuest } = await (supabaseAdmin as any)
		.from('guests')
		.select('id, full_name')
		.eq('auth_id', user.id)
		.limit(1)
		.maybeSingle();

	if (!currentGuest) throw redirect(303, '/claim-profile');

	// Fetch available profiles (unclaimed, not the current one)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: availableGuests } = await (supabaseAdmin as any)
		.from('guests')
		.select('id, full_name')
		.is('auth_id', null)
		.neq('id', currentGuest.id)
		.order('full_name');

	return {
		currentGuest,
		availableGuests: availableGuests || []
	};
};

export const actions: Actions = {
	changeProfile: async ({ request, locals: { user } }) => {
		if (!user) return fail(401, { message: 'Non autorisé' });

		const formData = await request.formData();
		const newGuestId = formData.get('newGuestId') as string;

		const schema = z.object({ newGuestId: z.string().uuid() });
		const result = schema.safeParse({ newGuestId });
		if (!result.success) return fail(400, { message: 'ID invalide.' });

		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// Fetch current guest
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: currentGuest } = await (supabaseAdmin as any)
			.from('guests')
			.select('id, managed_by_id')
			.eq('auth_id', user.id)
			.single();

		if (!currentGuest) return fail(400, { message: 'Profil actuel introuvable.' });

		// Verify new guest is available
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: newGuest } = await (supabaseAdmin as any)
			.from('guests')
			.select('id, auth_id')
			.eq('id', newGuestId)
			.single();

		if (!newGuest) return fail(404, { message: 'Profil introuvable.' });
		if (newGuest.auth_id) return fail(400, { message: 'Ce profil est déjà revendiqué.' });

		// Transfer managed guests from old to new profile
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await (supabaseAdmin as any)
			.from('guests')
			.update({ managed_by_id: newGuestId })
			.eq('managed_by_id', currentGuest.id);

		// Reset old profile: clear auth_id, reset RSVP
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await (supabaseAdmin as any)
			.from('guests')
			.update({
				auth_id: null,
				rsvp_status: 'pending',
				present_saturday: null,
				present_sunday: null,
				dietary_restrictions: null,
				message_for_couple: null
			})
			.eq('id', currentGuest.id);

		// Link new profile
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabaseAdmin as any)
			.from('guests')
			.update({
				auth_id: user.id,
				email: user.email?.toLowerCase()
			})
			.eq('id', newGuestId);

		if (error) {
			console.error('Change profile error:', error);
			return fail(500, { message: 'Erreur lors du changement de profil.' });
		}

		throw redirect(303, '/rsvp');
	}
};
