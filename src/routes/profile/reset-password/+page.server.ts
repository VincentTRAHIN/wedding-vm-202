import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { passwordSchema } from '$lib/server/validation';

function mapPasswordUpdateError(message: string): { status: number; error: string } {
	const normalized = message.toLowerCase();

	if (normalized.includes('different from the old password')) {
		return {
			status: 400,
			error: 'Le nouveau mot de passe doit être différent de l’ancien.'
		};
	}

	if (
		normalized.includes('invalid') &&
		(normalized.includes('token') || normalized.includes('link') || normalized.includes('expired'))
	) {
		return {
			status: 401,
			error:
				'Le lien de réinitialisation est invalide ou expiré. Merci de relancer la procédure de mot de passe oublié.'
		};
	}

	if (normalized.includes('rate limit') || normalized.includes('too many')) {
		return {
			status: 429,
			error: 'Trop de tentatives. Réessaie dans quelques minutes.'
		};
	}

	// Fallback: message générique (on évite d’exposer un message technique brut)
	return {
		status: 500,
		error: 'Une erreur est survenue lors de la mise à jour du mot de passe.'
	};
}

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
			const mapped = mapPasswordUpdateError(error.message);
			return fail(mapped.status, { error: mapped.error });
		}

		// Redirection vers le dashboard avec un message de succès
		throw redirect(303, '/dashboard?password_updated=true');
	}
};
