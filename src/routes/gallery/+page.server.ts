import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (!user) throw redirect(303, '/login');

	// Use Admin Client to bypass RLS recursion issues
	const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	// Fetch user role
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: guest } = await (supabaseAdmin as any)
		.from('guests')
		.select('role')
		.eq('auth_id', user.id)
		.single();

	const userRole = guest?.role;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: photos, error } = await (supabaseAdmin as any)
		.from('photos')
		.select('*, guests(full_name)')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching photos:', error);
	}

	return {
		photos: photos ?? [],
		userRole
	};
};

export const actions: Actions = {
	upload: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const file = formData.get('photo') as File;
		const caption = formData.get('caption') as string;

		if (!file || file.size === 0) {
			return fail(400, { message: 'No file uploaded' });
		}

		// 1. Upload to Storage (Standard Client - Storage Policies are fine)
		const fileExt = file.name.split('.').pop();
		const fileName = `${user.id}/${Date.now()}.${fileExt}`;

		const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);

		if (uploadError) {
			console.error('Upload Error:', uploadError);
			return fail(500, { message: 'Failed to upload image.' });
		}

		// 2. Insert into DB (Admin Client - Bypass RLS recursion)
		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: guest } = await (supabaseAdmin as any)
			.from('guests')
			.select('id')
			.eq('auth_id', user.id)
			.single();

		if (!guest) return fail(403, { message: 'Guest profile not found' });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error: dbError } = await (supabaseAdmin as any).from('photos').insert({
			storage_path: fileName,
			guest_id: guest.id,
			owner_id: user.id,
			status: 'pending',
			caption
		});

		if (dbError) {
			console.error('DB Insert Error:', dbError);
			return fail(500, { message: 'Failed to save photo metadata.' });
		}

		return { success: true };
	},

	delete: async ({ request, locals: { user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const photoId = formData.get('photoId') as string;

		if (!photoId) return fail(400, { message: 'Missing photo ID' });

		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// 1. Fetch photo to verify ownership
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: photo, error: fetchError } = await (supabaseAdmin as any)
			.from('photos')
			.select('owner_id, storage_path')
			.eq('id', photoId)
			.single();

		if (fetchError || !photo) {
			return fail(404, { message: 'Photo not found' });
		}

		// Check if user is admin
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: guest } = await (supabaseAdmin as any)
			.from('guests')
			.select('role')
			.eq('auth_id', user.id)
			.single();

		const isAdmin = guest?.role === 'admin';

		if (photo.owner_id !== user.id && !isAdmin) {
			return fail(403, { message: 'Forbidden' });
		}

		// 2. Delete from Storage
		const { error: storageError } = await supabaseAdmin.storage
			.from('photos')
			.remove([photo.storage_path]);

		if (storageError) {
			console.error('Storage Delete Error:', storageError);
			// Continue to delete DB record even if storage fails (orphan file is better than broken UI)
		}

		// 3. Delete from DB
		const { error: dbError } = await supabaseAdmin.from('photos').delete().eq('id', photoId);

		if (dbError) {
			console.error('DB Delete Error:', dbError);
			return fail(500, { message: 'Failed to delete photo' });
		}

		return { success: true };
	}
};
