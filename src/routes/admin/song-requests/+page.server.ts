import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// 1) Fetch all song requests
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: requests, error } = await (supabase as any)
		.from('song_requests')
		.select('id, created_at, track_name, artist, requested_by')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching song requests:', error);
		return { requests: [] };
	}

	const authIds = Array.from(
		new Set((requests ?? []).map((r: { requested_by: string }) => r.requested_by).filter(Boolean))
	);

	let guestNameByAuthId = new Map<string, string>();
	if (authIds.length > 0) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: guests, error: guestsError } = await (supabase as any)
			.from('guests')
			.select('auth_id, full_name')
			.in('auth_id', authIds);

		if (guestsError) {
			console.error('Error fetching guests for song requests:', guestsError);
		} else {
			guestNameByAuthId = new Map(
				(guests ?? [])
					.filter((g: { auth_id: string | null; full_name: string | null }) => Boolean(g.auth_id))
					.map((g: { auth_id: string; full_name: string | null }) => [
						g.auth_id,
						g.full_name ?? '—'
					])
			);
		}
	}

	const enriched = (requests ?? []).map(
		(r: {
			id: string;
			created_at: string;
			track_name: string;
			artist: string | null;
			requested_by: string;
		}) => ({
			...r,
			requested_by_name: guestNameByAuthId.get(r.requested_by) ?? r.requested_by
		})
	);

	return {
		requests: enriched
	};
};
