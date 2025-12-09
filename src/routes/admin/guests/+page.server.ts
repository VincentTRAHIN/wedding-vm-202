import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: guests, error } = await (supabase as any)
		.from('guests')
		.select('*')
		.order('full_name', { ascending: true, nullsFirst: false });

	if (error) {
		console.error('Error fetching guests:', error);
	}

	return {
		guests: guests ?? []
	};
};

const addGuestSchema = z.object({
	email: z.string().email(),
	full_name: z.string().optional(),
	expected_count: z.coerce.number().min(1).default(1)
});

export const actions: Actions = {
	add: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);

		const result = addGuestSchema.safeParse(rawData);

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors
			});
		}

		const { email, full_name, expected_count } = result.data;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabase as any).from('guests').insert({
			email: email.toLowerCase(),
			full_name,
			expected_count,
			role: 'guest'
		});

		if (error) {
			console.error('Add Guest Error:', error);
			if (error.code === '23505') {
				return fail(400, { message: 'Cet email est déjà invité.' });
			}
			return fail(500, { message: "Erreur lors de l'ajout." });
		}

		return { success: true };
	}
};
