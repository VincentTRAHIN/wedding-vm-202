import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { supabase, user } }) => {
	if (!user) throw redirect(303, '/login');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: guest } = await (supabase as any)
		.from('guests')
		.select('role')
		.eq('auth_id', user.id)
		.single();

	if (guest?.role !== 'admin') {
		throw redirect(303, '/');
	}

	return {};
};
