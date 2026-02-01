import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (!user) throw redirect(303, '/login');

	const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	// Check if already linked
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: existingGuest } = await (supabaseAdmin as any)
		.from('guests')
		.select('id')
		.eq('auth_id', user.id)
		.limit(1)
		.maybeSingle();

	if (existingGuest) {
		throw redirect(303, '/');
	}

	// Fetch unclaimed guests (including managed ones — they can claim their own account)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: unclaimedGuests } = await (supabaseAdmin as any)
		.from('guests')
		.select('id, full_name, managed_by_id')
		.is('auth_id', null)
		.order('full_name');

	// Resolve manager names for managed guests
	const managedByIds = [...new Set((unclaimedGuests || []).filter((g: { managed_by_id: string | null }) => g.managed_by_id).map((g: { managed_by_id: string }) => g.managed_by_id))];
	let managerNames: Record<string, string> = {};

	if (managedByIds.length > 0) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: managers } = await (supabaseAdmin as any)
			.from('guests')
			.select('id, full_name')
			.in('id', managedByIds);

		if (managers) {
			managerNames = Object.fromEntries(managers.map((m: { id: string; full_name: string }) => [m.id, m.full_name]));
		}
	}

	return {
		unclaimedGuests: (unclaimedGuests || []).map((g: { id: string; full_name: string; managed_by_id: string | null }) => ({
			...g,
			managerName: g.managed_by_id ? managerNames[g.managed_by_id] || null : null
		}))
	};
};

export const actions: Actions = {
	claim: async ({ request, locals: { user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const guestId = formData.get('guestId') as string;

		if (!guestId) return fail(400, { message: 'Veuillez sélectionner un invité.' });

		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// Verify guest is still unclaimed
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: guest } = await (supabaseAdmin as any)
			.from('guests')
			.select('auth_id, managed_by_id')
			.eq('id', guestId)
			.single();

		if (!guest) return fail(404, { message: 'Invité introuvable.' });
		if (guest.auth_id) return fail(400, { message: 'Cet invité a déjà été réclamé.' });

		// Link — keep managed_by_id intact for managed guests
		console.log('Claiming guest:', guestId, guest.managed_by_id ? '(managed)' : '(standalone)');
		console.log('User email:', user.email);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabaseAdmin as any)
			.from('guests')
			.update({
				auth_id: user.id,
				email: user.email?.toLowerCase()
			})
			.eq('id', guestId);

		if (error) {
			console.error('Error linking guest:', error);
			return fail(500, { message: 'Erreur lors de la liaison.' });
		}

		throw redirect(303, '/rsvp');
	},

	cancel: async ({ locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// Delete the auth user account
		const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

		if (error) {
			console.error('Error deleting user:', error);
			return fail(500, { message: 'Erreur lors de la suppression du compte.' });
		}

		// Sign out from current session
		await supabase.auth.signOut();

		throw redirect(303, '/login?cancelled=true');
	}
};
