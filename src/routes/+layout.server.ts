import type { LayoutServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
	const { session, user } = await safeGetSession();

	let userRole = null;
	if (user) {
		// Use Admin Client to bypass RLS recursion issues
		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		const { data: guest } = await supabaseAdmin
			.from('guests')
			.select('role')
			.eq('auth_id', user.id)
			.single();
		userRole = guest?.role;
	}

	return {
		session,
		userRole,
		cookies: cookies.getAll()
	};
};
