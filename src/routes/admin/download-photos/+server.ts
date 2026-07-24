import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';
import { Readable } from 'node:stream';
import { createRequire } from 'node:module';

// archiver est un module CommonJS : createRequire évite les soucis d'interop ESM au build.
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiver = require('archiver') as typeof import('archiver');

// Accès protégé par authGuard (hooks.server.ts) : /admin/* est réservé aux admins.

/** Nettoie une chaîne pour en faire un nom de fichier sûr (sans accents ni caractères spéciaux). */
function sanitize(input: string): string {
	return input
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '') // retire les accents
		.replace(/[^a-zA-Z0-9 _-]/g, '') // garde lettres/chiffres/espaces/tirets
		.trim()
		.replace(/\s+/g, '-')
		.slice(0, 60);
}

export const GET: RequestHandler = async () => {
	// Service role : contourne les RLS et le bucket privé.
	const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: photos, error } = await (supabaseAdmin as any)
		.from('photos')
		.select('storage_path, caption, created_at, guests(full_name)')
		.order('created_at', { ascending: true });

	if (error || !photos) {
		return new Response('Erreur lors de la récupération des photos', { status: 500 });
	}
	if (photos.length === 0) {
		return new Response('Aucune photo à télécharger', { status: 404 });
	}

	const archive = archiver('zip', { zlib: { level: 5 } });
	archive.on('error', (err) => {
		console.error('❌ Archive error:', err);
	});

	const usedNames = new Set<string>();

	// Remplissage de l'archive en arrière-plan (streaming) : on renvoie la réponse
	// immédiatement pendant que les fichiers sont téléchargés puis ajoutés au zip.
	(async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		for (const photo of photos as any[]) {
			const { data: blob, error: dlError } = await supabaseAdmin.storage
				.from('photos')
				.download(photo.storage_path);

			if (dlError || !blob) {
				console.error(`⚠️ Skip ${photo.storage_path}:`, dlError?.message);
				continue;
			}

			const ext = photo.storage_path.split('.').pop() || 'jpg';
			const date = photo.created_at ? String(photo.created_at).slice(0, 10) : 'sans-date';
			const author = sanitize(photo.guests?.full_name || 'Invite') || 'Invite';
			const caption = photo.caption ? '_' + sanitize(photo.caption) : '';

			const base = `${date}_${author}${caption}`;
			let name = `${base}.${ext}`;
			let n = 2;
			while (usedNames.has(name)) {
				name = `${base}-${n}.${ext}`;
				n++;
			}
			usedNames.add(name);

			const buffer = Buffer.from(await blob.arrayBuffer());
			archive.append(buffer, { name });
		}

		archive.finalize();
	})();

	const stamp = new Date().toISOString().slice(0, 10);

	return new Response(Readable.toWeb(archive) as ReadableStream, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="galerie-mariage-${stamp}.zip"`,
			'Cache-Control': 'no-store'
		}
	});
};
