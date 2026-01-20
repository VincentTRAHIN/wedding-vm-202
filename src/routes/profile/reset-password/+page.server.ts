import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { passwordSchema } from '$lib/server/validation';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();

	console.log('🔐 Reset password page - Session check:', {
		hasSession: !!session,
		userId: session?.user?.id,
		email: session?.user?.email
	});

	// L'utilisateur doit être authentifié via le lien de reset
	if (!session) {
		console.log('❌ No session found, redirecting to /login');
		throw redirect(303, '/login');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { session } = await safeGetSession();

		if (!session) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		// Validation du mot de passe
		const passwordResult = passwordSchema.safeParse(password);
		if (!passwordResult.success) {
			return fail(400, {
				error: 'Mot de passe invalide. Il doit contenir au moins 8 caractères avec 1 chiffre.'
			});
		}

		// Vérification de la confirmation
		if (password !== confirmPassword) {
			return fail(400, { error: 'Les mots de passe ne correspondent pas.' });
		}

		const { error } = await supabase.auth.updateUser({
			password: passwordResult.data
		});

		if (error) {
			console.error('Password update error:', error.message);
			return fail(500, {
				error: 'Une erreur est survenue lors de la mise à jour du mot de passe.'
			});
		}

		// Redirection vers le profil avec un message de succès
		throw redirect(303, '/profile?password_updated=true');
	}
};
