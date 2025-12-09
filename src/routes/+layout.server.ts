import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies, url }) => {
	const { session, user } = await safeGetSession();

	let guest = null;
	if (user) {
		// Use Admin Client to bypass RLS recursion issues
		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data } = await (supabaseAdmin as any)
			.from('guests')
			.select('*')
			.eq('auth_id', user.id)
			.single();

		guest = data;

		// Redirection logic for unlinked users
		if (!guest) {
			const allowedPaths = ['/claim-profile', '/logout', '/auth/callback'];
			if (!allowedPaths.some((path) => url.pathname.startsWith(path))) {
				throw redirect(303, '/claim-profile');
			}
		}
	}

	return {
		session,
		user,
		guest,
		cookies: cookies.getAll()
	};
};
