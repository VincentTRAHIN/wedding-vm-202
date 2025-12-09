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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { data: existingGuest } = await (supabaseAdmin as any)
				.from('guests')
				.select('id, auth_id')
				.eq('email', user.email!.toLowerCase())
				.single();

			if (existingGuest) {
				// Link if not linked
				if (!existingGuest.auth_id) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					await (supabaseAdmin as any)
						.from('guests')
						.update({ auth_id: user.id })
						.eq('id', existingGuest.id);
				}
			}
			// Do NOT auto-create guests. Unlinked users will be redirected to /claim-profile by layout.server.ts

			throw redirect(303, next);
		}
	}

	// Return the user to an error page with instructions
	throw redirect(303, '/auth/auth-code-error');
};
