import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function safeRedirectTo(value: unknown): string {
	const raw = String(value ?? '/admin/guests');
	// Only allow internal admin paths.
	if (!raw.startsWith('/admin')) return '/admin/guests';
	if (raw.startsWith('//')) return '/admin/guests';
	return raw;
}

export const POST: RequestHandler = async ({ cookies, locals, request }) => {
	if (!locals.user) throw redirect(303, '/login');

	const form = await request.formData();
	const next = String(form.get('next') ?? 'default');
	const theme = next === 'bordeaux' ? 'bordeaux' : 'default';
	const redirectTo = safeRedirectTo(form.get('redirectTo'));

	cookies.set('theme', theme, {
		path: '/',
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	});

	throw redirect(303, redirectTo);
};
