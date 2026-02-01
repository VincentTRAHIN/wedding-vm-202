import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';

export const prerender = false;

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		return { invitationType: 'complet' };
	}

	const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: guest } = await (supabaseAdmin as any)
		.from('guests')
		.select('invitation_type')
		.eq('auth_id', user.id)
		.limit(1)
		.maybeSingle();

	return {
		invitationType: guest?.invitation_type || 'complet'
	};
};
