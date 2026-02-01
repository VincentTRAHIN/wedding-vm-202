import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';
import { emailSchema, passwordSchema, checkRateLimit } from '$lib/server/validation';

export const prerender = false;

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (!user) throw redirect(303, '/login');

	const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: guest } = await (supabaseAdmin as any)
		.from('guests')
		.select('id, full_name, email')
		.eq('auth_id', user.id)
		.limit(1)
		.maybeSingle();

	if (!guest) throw redirect(303, '/claim-profile');

	// Detect auth provider
	const isOAuthOnly =
		user.app_metadata?.provider === 'google' &&
		(!user.app_metadata?.providers || !user.app_metadata.providers.includes('email'));

	return {
		guest,
		email: user.email || guest.email || '',
		isOAuthOnly
	};
};

export const actions: Actions = {
	updateEmail: async ({ request, locals: { user } }) => {
		if (!user) return fail(401, { message: 'Non autorisé' });

		const { allowed } = checkRateLimit('email-update', 5, 60000, user.id);
		if (!allowed) return fail(429, { message: 'Trop de tentatives. Réessaie dans une minute.' });

		const formData = await request.formData();
		const newEmail = formData.get('email') as string;

		const result = emailSchema.safeParse(newEmail);
		if (!result.success) {
			return fail(400, { emailError: 'Email invalide' });
		}

		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// Update auth.users email
		const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
			email: result.data
		});

		if (authError) {
			console.error('Email update auth error:', authError);
			if (authError.message?.includes('already')) {
				return fail(400, { emailError: 'Cet email est déjà utilisé.' });
			}
			return fail(500, { emailError: "Erreur lors de la mise à jour de l'email." });
		}

		// Update guests.email
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error: guestError } = await (supabaseAdmin as any)
			.from('guests')
			.update({ email: result.data })
			.eq('auth_id', user.id);

		if (guestError) {
			console.error('Email update guest error:', guestError);
			// Rollback auth email (best effort)
			await supabaseAdmin.auth.admin.updateUserById(user.id, { email: user.email! });
			return fail(500, { emailError: "Erreur lors de la mise à jour de l'email." });
		}

		return { emailSuccess: true };
	},

	updatePassword: async ({ request, locals: { user, supabase } }) => {
		if (!user) return fail(401, { message: 'Non autorisé' });

		const { allowed } = checkRateLimit('password-update', 5, 60000, user.id);
		if (!allowed) return fail(429, { message: 'Trop de tentatives. Réessaie dans une minute.' });

		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		// Validate new password
		const pwResult = passwordSchema.safeParse(newPassword);
		if (!pwResult.success) {
			return fail(400, { passwordError: 'Le mot de passe doit contenir au moins 8 caractères avec 1 chiffre.' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { passwordError: 'Les mots de passe ne correspondent pas.' });
		}

		// Verify current password by trying to sign in
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: user.email!,
			password: currentPassword
		});

		if (signInError) {
			return fail(400, { passwordError: "L'ancien mot de passe est incorrect." });
		}

		// Update password
		const { error } = await supabase.auth.updateUser({
			password: newPassword
		});

		if (error) {
			console.error('Password update error:', error);
			return fail(500, { passwordError: 'Erreur lors de la mise à jour du mot de passe.' });
		}

		return { passwordSuccess: true };
	},

	createPassword: async ({ request, locals: { user, supabase } }) => {
		if (!user) return fail(401, { message: 'Non autorisé' });

		const { allowed } = checkRateLimit('password-create', 5, 60000, user.id);
		if (!allowed) return fail(429, { message: 'Trop de tentatives. Réessaie dans une minute.' });

		const formData = await request.formData();
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		const pwResult = passwordSchema.safeParse(newPassword);
		if (!pwResult.success) {
			return fail(400, { passwordError: 'Le mot de passe doit contenir au moins 8 caractères avec 1 chiffre.' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { passwordError: 'Les mots de passe ne correspondent pas.' });
		}

		const { error } = await supabase.auth.updateUser({
			password: newPassword
		});

		if (error) {
			console.error('Password create error:', error);
			return fail(500, { passwordError: 'Erreur lors de la création du mot de passe.' });
		}

		return { passwordSuccess: true };
	}
};
