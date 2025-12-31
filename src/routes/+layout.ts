import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '$lib/types/supabase';
import type { LayoutLoad } from './$types';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	/**
	 * Declare a dependency so the layout can be invalidated, for example, on
	 * session refresh.
	 */
	depends('supabase:auth');

	const supabase = createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		}
	});

	return {
		supabase,
		session: data.session,
		user: data.user,
		guest: data.guest,
		userRole: data.guest?.role,
		theme: data.theme
	};
};
