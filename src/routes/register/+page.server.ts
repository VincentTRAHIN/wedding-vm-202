import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { WEDDING_ACCESS_CODE, SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '$lib/types/supabase';
import { createClient } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ locals: { session } }) => {
	// Si l'utilisateur est déjà connecté, on le redirige vers l'accueil
	if (session) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions: Actions = {
	verify_code: async ({ request }) => {
		const formData = await request.formData();
		const code = formData.get('code') as string;

		if (code !== WEDDING_ACCESS_CODE) {
			return fail(403, { error: 'Code invité incorrect.', codeValid: false });
		}

		return { codeValid: true };
	},

	login_google: async ({ locals: { supabase }, url }) => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${url.origin}/auth/callback`
			}
		});

		if (error) {
			console.error('Google Auth Error:', error);
			return fail(500, { message: 'Something went wrong.' });
		}

		throw redirect(303, data.url);
	},

	register: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const code = formData.get('code') as string;
		const fullName = formData.get('fullName') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		// Double check code server-side
		if (code !== WEDDING_ACCESS_CODE) {
			return fail(403, { error: 'Code invité incorrect.' });
		}

		if (!email || !password || !fullName) {
			return fail(400, { error: 'Tous les champs sont requis.' });
		}

		// Initialize Admin Client
		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// 1. Create Auth User (Auto-confirmed)
		const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { full_name: fullName }
		});

		if (authError) {
			console.error('Auth Error:', authError);
			return fail(500, {
				error: 'Erreur lors de la création du compte. (Email invalide ou déjà utilisé)'
			});
		}

		if (!authData.user) {
			return fail(500, { error: "Erreur inattendue lors de l'inscription." });
		}

		// 2. Check if email exists in guests table (Admin pre-seed)
		const { data: existingGuest } = await (supabaseAdmin as any)
			.from('guests')
			.select('id')
			.eq('email', email)
			.single();

		if (existingGuest) {
			// Link existing guest (Admin) to new Auth ID
			const { error: updateError } = await (supabaseAdmin as any)
				.from('guests')
				.update({
					auth_id: authData.user.id,
					full_name: fullName
				})
				.eq('id', existingGuest.id);

			if (updateError) {
				console.error('Link Error:', updateError);
				// Note: Auth user is created but guest link failed.
				// User can still login but might need manual fix or retry logic.
			}
		} else {
			// Create new guest entry
			const newGuest: Database['public']['Tables']['guests']['Insert'] = {
				email: email,
				auth_id: authData.user.id,
				full_name: fullName,
				role: 'guest',
				rsvp_status: 'pending',
				adults_count: 1,
				children_count: 0,
				expected_count: 1
			};

			const { error: insertError } = await (supabaseAdmin as any).from('guests').insert(newGuest);

			if (insertError) {
				console.error('Guest Insert Error:', insertError);
				return fail(500, { error: 'Erreur lors de la création du profil invité.' });
			}
		}

		throw redirect(303, '/');
	}
};
