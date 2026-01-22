import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import type { Database } from '$lib/types/supabase';
import { z } from 'zod';

type WeatherStatus =
	| {
			status: 'available';
			date: string;
			temp_min_c: number;
			temp_max_c: number;
			weather_code: number;
	  }
	| { status: 'error'; message: string };

type VenueCoords = { lat: number; lng: number };

const VENUE = {
	name: 'Château des Landes',
	address: 'Château des Landes, 49560 Cléré-sur-Layon, Maine-et-Loire'
} as const;

// Coordonnées GPS exactes du Château des Landes
const VENUE_COORDS: VenueCoords = { lat: 47.0919227, lng: -0.4502939 };

async function getWeatherNow(coords: VenueCoords): Promise<WeatherStatus> {
	const url = new URL('https://api.open-meteo.com/v1/forecast');
	url.searchParams.set('latitude', String(coords.lat));
	url.searchParams.set('longitude', String(coords.lng));
	url.searchParams.set('daily', 'weather_code,temperature_2m_min,temperature_2m_max');
	url.searchParams.set('timezone', 'Europe/Paris');

	try {
		const res = await fetch(url.toString(), {
			headers: {
				accept: 'application/json'
			}
		});

		if (!res.ok) {
			return { status: 'error', message: `Open-Meteo error (${res.status})` };
		}

		const json: unknown = await res.json();
		const schema = z.object({
			daily: z.object({
				time: z.array(z.string()),
				weather_code: z.array(z.number()),
				temperature_2m_min: z.array(z.number()),
				temperature_2m_max: z.array(z.number())
			})
		});

		const parsed = schema.safeParse(json);
		if (!parsed.success) {
			return { status: 'error', message: 'Invalid Open-Meteo response' };
		}

		const { time, weather_code, temperature_2m_min, temperature_2m_max } = parsed.data.daily;
		const idx = 0;
		if (!time[idx]) return { status: 'error', message: 'Forecast not available' };

		return {
			status: 'available',
			date: time[idx],
			temp_min_c: temperature_2m_min[idx],
			temp_max_c: temperature_2m_max[idx],
			weather_code: weather_code[idx]
		};
	} catch {
		return { status: 'error', message: 'Unable to fetch forecast' };
	}
}

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	if (!user) {
		throw redirect(303, '/login');
	}

	// 1. Fetch Guest Data
	const { data: guest, error: guestError } = await supabase
		.from('guests')
		.select('*')
		.eq('auth_id', user.id)
		.limit(1)
		.maybeSingle();

	if (guestError || !guest) {
		console.error('Error fetching guest:', guestError);
		throw redirect(303, '/');
	}

	let room: Database['public']['Tables']['rooms']['Row'] | null = null;
	if (guest.room_id) {
		const { data: roomData, error: roomError } = await supabase
			.from('rooms')
			.select('*')
			.eq('id', guest.room_id)
			.single();
		if (roomError) {
			console.error('Error fetching room:', roomError);
		} else {
			room = roomData;
		}
	}

	// 2. Fetch Content Blocks (site_content)
	const contentKeys = ['brunch_info'] as const;
	const { data: contents, error: contentError } = await supabase
		.from('site_content')
		.select('key, content')
		.in('key', [...contentKeys]);

	if (contentError) {
		console.error('Error fetching site content:', contentError);
	}

	const contentMap = new Map<
		string,
		Database['public']['Tables']['site_content']['Row']['content']
	>();
	for (const row of contents ?? []) {
		contentMap.set(row.key, row.content);
	}

	// 3. Fetch last song requests
	const { data: songRequests, error: songError } = await supabase
		.from('song_requests')
		.select('*')
		.eq('requested_by', user.id)
		.order('created_at', { ascending: false })
		.limit(25);

	if (songError) {
		console.error('Error fetching song requests:', songError);
	}

	// 4. Weather
	const weather = await getWeatherNow(VENUE_COORDS);

	return {
		guest: { ...guest, room },
		brunchInfo: contentMap.get('brunch_info') ?? null,
		songRequests: songRequests ?? [],
		weather,
		venue: {
			coords: VENUE_COORDS,
			name: VENUE.name,
			address: VENUE.address
		}
	};
};

const songRequestSchema = z.object({
	track_name: z.string().trim().min(1).max(120),
	artist: z.string().trim().max(120).optional()
});

const deleteSongRequestSchema = z.object({
	id: z.string().uuid()
});

export const actions: Actions = {
	createSongRequest: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const raw = {
			track_name: String(formData.get('track_name') ?? ''),
			artist: formData.get('artist') ? String(formData.get('artist')) : undefined
		};

		const parsed = songRequestSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { message: 'Invalid input', errors: parsed.error.flatten().fieldErrors });
		}

		const { track_name, artist } = parsed.data;
		const { error } = await supabase.from('song_requests').insert({
			track_name,
			artist: artist && artist.length > 0 ? artist : null,
			requested_by: user.id
		});

		if (error) {
			return fail(500, { message: 'Unable to save request' });
		}

		return { ok: true };
	},

	deleteSongRequest: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const raw = {
			id: String(formData.get('id') ?? '')
		};

		const parsed = deleteSongRequestSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { message: 'Invalid input' });
		}

		const { id } = parsed.data;
		const { error, count } = await supabase
			.from('song_requests')
			.delete({ count: 'exact' })
			.eq('id', id)
			.eq('requested_by', user.id);

		if (error) {
			return fail(500, { message: 'Unable to delete request' });
		}

		if (!count) {
			return fail(404, { message: 'Not found' });
		}

		return { ok: true };
	}
};
