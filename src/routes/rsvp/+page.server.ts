import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	if (!user) throw redirect(303, '/login');

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: guest, error } = await (supabase as any)
		.from('guests')
		.select('*')
		.eq('auth_id', user.id)
		.single();

	if (error) {
		console.error('Error fetching guest:', error);
		// Handle error appropriately, maybe redirect to error page
	}

	return {
		guest
	};
};

const rsvpSchema = z.object({
	rsvp_status: z.enum(['present', 'absent']),
	adults_count: z.coerce.number().min(1),
	children_count: z.coerce.number().min(0),
	dietary_restrictions: z.string().optional()
});

export const actions: Actions = {
	update: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);

		// If absent, force counts to 0/1 for validation but save appropriately
		if (rawData.rsvp_status === 'absent') {
			rawData.adults_count = '1'; // Dummy value to pass validation if needed, or adjust schema
			rawData.children_count = '0';
		}

		const result = rsvpSchema.safeParse(rawData);

		if (!result.success) {
			return fail(400, {
				data: rawData,
				errors: result.error.flatten().fieldErrors
			});
		}

		const { rsvp_status, adults_count, children_count, dietary_restrictions } = result.data;

		// Update guest
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabase as any)
			.from('guests')
			.update({
				rsvp_status,
				adults_count: rsvp_status === 'absent' ? 0 : adults_count,
				children_count: rsvp_status === 'absent' ? 0 : children_count,
				dietary_restrictions
			})
			.eq('auth_id', user.id);

		if (error) {
			console.error('RSVP Update Error:', error);
			return fail(500, { message: 'Failed to update RSVP.' });
		}

		return { success: true };
	}
};
