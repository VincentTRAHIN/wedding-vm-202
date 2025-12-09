import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { user } }) => {
	if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

	const photoId = url.searchParams.get('photoId');
	if (!photoId) return json({ error: 'Missing photoId' }, { status: 400 });

	const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	// 1. Fetch comments
	const { data: comments, error: commentsError } = await supabaseAdmin
		.from('photo_comments')
		.select('*')
		.eq('photo_id', photoId)
		.order('created_at', { ascending: true });

	if (commentsError) {
		return json({ error: commentsError.message }, { status: 500 });
	}

	if (!comments || comments.length === 0) {
		return json([]);
	}

	// 2. Fetch guests details
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const userIds = [...new Set(comments.map((c: any) => c.user_id))];

	const { data: guests, error: guestsError } = await supabaseAdmin
		.from('guests')
		.select('auth_id, full_name, avatar_url')
		.in('auth_id', userIds);

	if (guestsError) {
		return json({ error: guestsError.message }, { status: 500 });
	}

	// 3. Merge
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const guestsMap = new Map(guests?.map((g: any) => [g.auth_id, g]));

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const enrichedComments = comments.map((c: any) => ({
		...c,
		guest: guestsMap.get(c.user_id)
	}));

	return json(enrichedComments);
};
