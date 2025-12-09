import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Database } from '$lib/types/supabase';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	/**
	 * Unlike `supabase.auth.getSession()`, which allows the user to be signed in
	 * via a cookie that is not secure, `safeGetSession` only returns the session
	 * if the user is signed in via a secure cookie.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			// JWT validation has failed
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// 1. Routes Publiques (Login, Auth callbacks, Logout, Register)
	// Register doit être public pour permettre l'inscription des nouveaux utilisateurs
	const publicRoutes = ['/login', '/auth/callback', '/logout', '/register'];
	if (publicRoutes.some((route) => event.url.pathname.startsWith(route))) {
		return resolve(event);
	}

	// 2. Non Authentifié -> Redirection Login
	if (!session || !user) {
		throw redirect(303, '/login');
	}

	// 3. Protection Admin
	if (event.url.pathname.startsWith('/admin')) {
		const { data: guest } = await (event.locals.supabase as any)
			.from('guests')
			.select('role')
			.eq('auth_id', user.id)
			.single();

		if (!guest || guest.role !== 'admin') {
			throw redirect(303, '/');
		}
	}

	return resolve(event);
};

export const handle = sequence(supabase, authGuard);
