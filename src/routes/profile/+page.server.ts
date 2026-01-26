import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ locals }) => {
	// Cette fonction force le passage par le serveur
	// L'authentification est gérée par hooks.server.ts
	return {
		user: locals.user
	};
};
