import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { emailSchema } from '$lib/server/validation';

export const actions: Actions = {
	default: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email');

		const result = emailSchema.safeParse(email);
		if (!result.success) {
			return fail(400, { error: 'Adresse email invalide.' });
		}

		const { error } = await supabase.auth.resetPasswordForEmail(result.data, {
			redirectTo: `${url.origin}/auth/callback?next=/profile/reset-password`
		});

		if (error) {
			console.error('Password reset error:', error.message);
			// Ne pas révéler si l'email existe ou non pour des raisons de sécurité
		}

		// Toujours afficher un message de succès pour éviter l'énumération d'emails
		return { success: true };
	}
};
