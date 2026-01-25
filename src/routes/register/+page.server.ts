import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/types/supabase';
import { createClient } from '@supabase/supabase-js';
import { emailSchema, passwordSchema, checkRateLimit } from '$lib/server/validation';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	// Si l'utilisateur est déjà connecté, on le redirige vers l'accueil
	if (session) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions: Actions = {
	login_google: async ({ locals: { supabase }, url }) => {
		// Force production URL if we are in production
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

		if (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Google Auth Error:', error);
			}
			return fail(500, { message: 'Une erreur est survenue.' });
		}

		throw redirect(303, data.url);
	},

	register: async ({ request, getClientAddress }) => {
		// Rate limiting protection
		const clientIp = getClientAddress();
		const { allowed } = checkRateLimit(`register:${clientIp}`, 10, 3600000); // 10 par heure
		
		if (!allowed) {
			return fail(429, {
				error: "Trop de tentatives d'inscription. Réessayez plus tard."
			});
		}

		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		// Validation des champs
		if (!email || !password || !confirmPassword) {
			return fail(400, { error: 'Tous les champs sont requis.' });
		}

		// Vérification que les mots de passe correspondent
		if (password !== confirmPassword) {
			return fail(400, { error: 'Les mots de passe ne correspondent pas.' });
		}

		// Validation email
		const emailValidation = emailSchema.safeParse(email);
		if (!emailValidation.success) {
			return fail(400, { error: 'Email invalide.' });
		}

		// Validation mot de passe
		const passwordValidation = passwordSchema.safeParse(password);
		if (!passwordValidation.success) {
			return fail(400, {
				error: 'Mot de passe invalide. Il doit contenir au moins 8 caractères avec 1 chiffre.'
			});
		}

		// Initialize Admin Client
		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// 1. Créer l'utilisateur Auth (Auto-confirmé)
		const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
			email: emailValidation.data,
			password,
			email_confirm: true
		});

		if (authError) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Auth Error:', authError);
			}

			// Message d'erreur plus explicite
			if (authError.message?.includes('already')) {
				return fail(400, { error: 'Cet email est déjà utilisé. Essaie de te connecter.' });
			}

			return fail(500, {
				error: 'Erreur lors de la création du compte.'
			});
		}

		if (!authData.user) {
			return fail(500, { error: "Erreur inattendue lors de l'inscription." });
		}

		// 2. Rediriger tous les nouveaux comptes vers claim-profile
		// L'utilisateur doit choisir son profil manuellement
		throw redirect(303, '/claim-profile');
	}
};
