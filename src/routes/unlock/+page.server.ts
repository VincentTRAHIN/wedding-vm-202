import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { WEDDING_ACCESS_CODE } from '$env/static/private';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const code = formData.get('code');

		if (!WEDDING_ACCESS_CODE) {
			console.error('WEDDING_ACCESS_CODE is not set');
			return fail(500, { error: 'Configuration error' });
		}

		if (code !== WEDDING_ACCESS_CODE) {
			return fail(400, { error: 'Code incorrect' });
		}

		cookies.set('wedding_pass', 'true', {
			path: '/',
			httpOnly: true,
			secure: true,
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		throw redirect(303, '/');
	}
};
