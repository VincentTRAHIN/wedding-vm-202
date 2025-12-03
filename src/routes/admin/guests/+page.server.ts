import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { z } from 'zod';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { data: guests, error } = await (supabase as any)
		.from('guests')
		.select('*, managed_by:guests!managed_by_id(full_name)')
		.order('full_name', { ascending: true, nullsFirst: false });

	if (error) {
		console.error('Error fetching guests:', error);
	}

	return {
		guests: guests ?? []
	};
};

const addGuestSchema = z.object({
	email: z.string().email().optional().or(z.literal('')),
	full_name: z.string().min(1, 'Le nom est requis'),
	is_child: z.literal('on').optional()
});

const editGuestSchema = addGuestSchema.extend({
	id: z.string().uuid()
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

		const { email, full_name, is_child } = result.data;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const insertData: any = {
			full_name,
			expected_count: 1,
			role: 'guest',
			managed_by_id: null,
			is_child: is_child === 'on'
		};

		if (email) {
			insertData.email = email.toLowerCase();
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabase as any).from('guests').insert(insertData);

		if (error) {
			console.error('Add Guest Error:', error);
			if (error.code === '23505') {
				return fail(400, { message: 'Cet email est déjà invité.' });
			}
			return fail(500, { message: "Erreur lors de l'ajout." });
		}

		return { success: true };
	},

	edit: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);

		const result = editGuestSchema.safeParse(rawData);

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors
			});
		}

		const { id, email, full_name, is_child } = result.data;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updateData: any = {
			full_name,
			email: email ? email.toLowerCase() : null,
			is_child: is_child === 'on'
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { error } = await (supabase as any).from('guests').update(updateData).eq('id', id);

		if (error) {
			console.error('Edit Guest Error:', error);
			if (error.code === '23505') {
				return fail(400, { message: 'Cet email est déjà utilisé.' });
			}
			return fail(500, { message: 'Erreur lors de la modification.' });
		}

		return { success: true };
	}
};
