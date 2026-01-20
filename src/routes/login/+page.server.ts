import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { emailSchema } from '$lib/server/validation';

export const actions: Actions = {
	login_google: async ({ locals: { supabase }, url }) => {
		// Force production URL if we are in production (to avoid localhost issues behind proxy)
		const origin =
			process.env.NODE_ENV === 'production'
				? 'https://july18.melanie.vincent-trahin.dev'
				: url.origin;

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${origin}/auth/callback`,
				queryParams: {
					prompt: 'select_account consent'
				}
			}
		});

		if (process.env.NODE_ENV !== 'production') {
			console.info('Google OAuth URL:', data?.url);
		}

		if (error) {
			console.error('Google Auth Error:', error);
			return fail(500, { message: 'Something went wrong.' });
		}

		throw redirect(303, data.url);
	},

	login_password: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { email, missing: true });
		}

		// Validate email format
		const emailValidation = emailSchema.safeParse(email);
		if (!emailValidation.success) {
			return fail(400, { message: 'Email invalide.' });
		}

		const { error } = await supabase.auth.signInWithPassword({
			email: emailValidation.data,
			password
		});

		if (error) {
			console.error('Login Error:', error);
			return fail(400, { message: 'Invalid credentials.' });
		}

		throw redirect(303, '/');
	}
};
