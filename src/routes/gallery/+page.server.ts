import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types/supabase';
import {
	validateImageFile,
	photoCaptionSchema,
	commentContentSchema
} from '$lib/server/validation';

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
	const { data: photosData, error } = await (supabaseAdmin as any)
		.from('photos')
		.select(
			`
			*,
			guests(full_name),
			photo_likes(count),
			photo_comments(count)
		`
		)
		.order('created_at', { ascending: false });

	if (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('❌ Error fetching photos:', error);
		}
	}

	// Fetch user's likes to determine is_liked_by_user
	const { data: userLikes } = await supabaseAdmin
		.from('photo_likes')
		.select('photo_id')
		.eq('user_id', user.id);

	const userLikedPhotoIds = new Set(userLikes?.map((l) => l.photo_id));

	const photos =
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		photosData?.map((photo: any) => ({
			...photo,
			likes_count: photo.photo_likes[0]?.count ?? 0,
			comments_count: photo.photo_comments[0]?.count ?? 0,
			is_liked_by_user: userLikedPhotoIds.has(photo.id)
		})) ?? [];

	return {
		photos,
		userRole
	};
};

export const actions: Actions = {
	upload: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const files = formData.getAll('photos[]') as File[];
		const caption = formData.get('caption') as string;

		// Validate number of files
		const MAX_FILES = 10;
		if (files.length === 0) {
			return fail(400, { message: 'Aucune photo sélectionnée' });
		}
		if (files.length > MAX_FILES) {
			return fail(400, { message: `Maximum ${MAX_FILES} photos à la fois` });
		}

		// Validate each file
		for (const file of files) {
			const fileValidation = validateImageFile(file);
			if (!fileValidation.valid) {
				return fail(400, { message: fileValidation.error });
			}
		}

		// Validate caption if provided
		if (caption && caption.trim()) {
			const captionValidation = photoCaptionSchema.safeParse(caption);
			if (!captionValidation.success) {
				return fail(400, { message: 'Légende invalide' });
			}
		}

		// Get guest ID
		const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: guest } = await (supabaseAdmin as any)
			.from('guests')
			.select('id')
			.eq('auth_id', user.id)
			.single();

		if (!guest) return fail(403, { message: 'Guest profile not found' });

		// Upload each file
		const uploadResults = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const fileExt = file.name.split('.').pop();
			const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;

			// 1. Upload to Storage
			const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);

			if (uploadError) {
				console.error('Upload Error:', uploadError);
				// Clean up previously uploaded files
				for (const result of uploadResults) {
					await supabase.storage.from('photos').remove([result.fileName]);
				}
				return fail(500, { message: `Failed to upload image ${i + 1}` });
			}

			// 2. Insert into DB
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { error: dbError } = await (supabaseAdmin as any).from('photos').insert({
				storage_path: fileName,
				guest_id: guest.id,
				owner_id: user.id,
				status: 'approved',
				caption: caption && caption.trim() ? caption : null
			});

			if (dbError) {
				if (process.env.NODE_ENV === 'development') {
					console.error('❌ DB Insert Error:', dbError);
				}
				// Clean up storage
				await supabase.storage.from('photos').remove([fileName]);
				for (const result of uploadResults) {
					await supabase.storage.from('photos').remove([result.fileName]);
				}
				return fail(500, { message: `Failed to save photo ${i + 1} metadata` });
			}

			uploadResults.push({ fileName });
		}

		return { success: true, count: files.length };
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
			if (process.env.NODE_ENV === 'development') {
				console.error('❌ Storage Delete Error:', storageError);
			}
			// Continue to delete DB record even if storage fails (orphan file is better than broken UI)
		}

		// 3. Delete from DB
		const { error: dbError } = await supabaseAdmin.from('photos').delete().eq('id', photoId);

		if (dbError) {
			if (process.env.NODE_ENV === 'development') {
				console.error('❌ DB Delete Error:', dbError);
			}
			return fail(500, { message: 'Failed to delete photo' });
		}

		return { success: true };
	},

	toggleLike: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });
		const formData = await request.formData();
		const photoId = formData.get('photoId') as string;

		if (!photoId) return fail(400, { message: 'Missing photo ID' });

		// Check if liked
		const { data: existing } = await supabase
			.from('photo_likes')
			.select('user_id')
			.eq('user_id', user.id)
			.eq('photo_id', photoId)
			.single();

		if (existing) {
			const { error } = await supabase
				.from('photo_likes')
				.delete()
				.eq('user_id', user.id)
				.eq('photo_id', photoId);
			if (error) return fail(500, { message: 'Failed to unlike' });
		} else {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { error } = await (supabase as any)
				.from('photo_likes')
				.insert({ user_id: user.id, photo_id: photoId });
			if (error) return fail(500, { message: 'Failed to like' });
		}

		return { success: true };
	},

	addComment: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });
		const formData = await request.formData();
		const photoId = formData.get('photoId') as string;
		const content = formData.get('content') as string;

		if (!photoId) return fail(400, { message: 'Missing photo ID' });

		// Validate content
		const validation = commentContentSchema.safeParse(content);
		if (!validation.success) {
			return fail(400, { message: 'Commentaire invalide' });
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabase as any)
			.from('photo_comments')
			.insert({ user_id: user.id, photo_id: photoId, content: validation.data });

		if (error) return fail(500, { message: 'Failed to comment' });

		return { success: true };
	},

	deleteComment: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });
		const formData = await request.formData();
		const commentId = formData.get('commentId') as string;

		if (!commentId) return fail(400, { message: 'Missing comment ID' });

		// Check if user is owner or admin
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: comment, error: fetchError } = await (supabase as any)
			.from('photo_comments')
			.select('user_id')
			.eq('id', commentId)
			.single();

		if (fetchError || !comment) return fail(404, { message: 'Comment not found' });

		// Check if user is admin via database
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: guest } = await (supabase as any)
			.from('guests')
			.select('role')
			.eq('auth_id', user.id)
			.single();

		const isAdmin = guest?.role === 'admin';
		if (comment.user_id !== user.id && !isAdmin) {
			return fail(403, { message: 'Forbidden' });
		}

		const { error } = await supabase.from('photo_comments').delete().eq('id', commentId);

		if (error) return fail(500, { message: 'Failed to delete comment' });

		return { success: true };
	}
};
