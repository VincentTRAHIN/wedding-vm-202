import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';

	if (code) {
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error && data.session) {
			const session = data.session;
			const user = session.user;

			// Admin Client to bypass RLS
			const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

			// Check if guest exists
			const { data: existingGuest } = await supabaseAdmin
				.from('guests')
				.select('id, auth_id')
				.eq('email', user.email!)
				.single();

			if (existingGuest) {
				// Link if not linked
				if (!existingGuest.auth_id) {
					await supabaseAdmin
						.from('guests')
						.update({ auth_id: user.id })
						.eq('id', existingGuest.id);
				}
			} else {
				// Create new guest
				await supabaseAdmin.from('guests').insert({
					email: user.email!,
					auth_id: user.id,
					full_name: user.user_metadata.full_name || user.email,
					role: 'guest',
					rsvp_status: 'pending',
					adults_count: 1,
					children_count: 0,
					expected_count: 1
				});
			}

			throw redirect(303, next);
		}
	}

	// Return the user to an error page with instructions
	throw redirect(303, '/auth/auth-code-error');
};
