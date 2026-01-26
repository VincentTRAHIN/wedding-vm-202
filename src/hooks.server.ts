import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Database } from '$lib/types/supabase';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

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

	// 1. Routes Publiques Absolues (sans authentification)
	const publicRoutes = [
		'/login',
		'/auth/callback',
		'/logout',
		'/register',
		'/forgot-password',
		'/health',
		'/legal' // Mentions légales accessibles à tous
	];

	// Page d'accueil accessible à tous (connectés ou non)
	if (event.url.pathname === '/') {
		return resolve(event);
	}

	if (publicRoutes.some((route) => event.url.pathname.startsWith(route))) {
		return resolve(event);
	}

	// 2. Non Authentifié -> Redirection Login
	if (!session || !user) {
		throw redirect(303, '/login');
	}

	// 3. Protection Admin
	if (event.url.pathname.startsWith('/admin')) {
		const { data: guest } = await event.locals.supabase
			.from('guests')
			.select('role')
			.eq('auth_id', user.id)
			.maybeSingle();

		if (!guest || (guest as { role: string }).role !== 'admin') {
			throw redirect(303, '/');
		}
	}

	return resolve(event);
};

/**
 * Security Headers
 * Add security-related HTTP headers to all responses
 */
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Only add security headers in production
	if (process.env.NODE_ENV === 'production') {
		// Prevent clickjacking
		response.headers.set('X-Frame-Options', 'DENY');

		// Prevent MIME type sniffing
		response.headers.set('X-Content-Type-Options', 'nosniff');

		// Enable XSS protection (legacy browsers)
		response.headers.set('X-XSS-Protection', '1; mode=block');

		// Referrer policy
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

		// Permissions policy (limit browser features)
		response.headers.set(
			'Permissions-Policy',
			'camera=(), microphone=(), geolocation=(), interest-cohort=()'
		);

		// Content Security Policy
		const cspDirectives = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline needed for SvelteKit
			"style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
			"img-src 'self' data: https: blob:",
			"font-src 'self' data:",
			"connect-src 'self' https://*.supabase.co wss://*.supabase.co",
			"frame-src 'self' https://www.google.com", // Allow Google Maps iframe
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		];
		response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
	}

	return response;
};

export const handle = sequence(supabase, authGuard, securityHeaders);
