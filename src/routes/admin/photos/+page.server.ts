import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: photos, error } = await (supabase as any)
		.from('photos')
		.select('*, guests(full_name)')
		.eq('status', 'pending')
		.order('created_at', { ascending: true });

	if (error) {
		console.error('Error fetching pending photos:', error);
	}

	return {
		photos: photos ?? []
	};
};

export const actions: Actions = {
	moderate: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const photo_id = formData.get('photo_id') as string;
		const action = formData.get('action') as string;

		if (!photo_id || !['approve', 'reject'].includes(action)) {
			return fail(400, { message: 'Invalid request' });
		}

		const status = action === 'approve' ? 'approved' : 'rejected';

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabase as any).from('photos').update({ status }).eq('id', photo_id);

		if (error) {
			console.error('Moderation Error:', error);
			return fail(500, { message: 'Failed to update photo status.' });
		}

		return { success: true };
	}
};
