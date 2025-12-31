import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';

const baseRoomSchema = z.object({
	name: z.string().trim().min(1, 'Le nom est requis.').max(120),
	capacity: z.preprocess((v) => Number(v), z.number().int().min(1).max(50)).default(2)
});

const assignGuestSchema = z.object({
	room_id: z.string().uuid(),
	guest_id: z.string().uuid()
});

const unassignGuestSchema = z.object({
	guest_id: z.string().uuid()
});

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: rooms, error } = await supabase.from('rooms').select('*').order('name');
	const { data: guests, error: guestsError } = await supabase
		.from('guests')
		.select('id, full_name, room_id')
		.order('full_name');

	if (error) {
		console.error('Error fetching rooms:', error);
		return { rooms: [], guests: [] };
	}

	if (guestsError) {
		console.error('Error fetching guests:', guestsError);
		return { rooms: rooms ?? [], guests: [] };
	}

	return { rooms: rooms ?? [], guests: guests ?? [] };
};

export const actions: Actions = {
	add: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const raw = Object.fromEntries(formData);
		const parsed = baseRoomSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				message: 'Données invalides.',
				errors: parsed.error.flatten().fieldErrors
			});
		}

		const { name, capacity } = parsed.data;

		const { error } = await supabase.from('rooms').insert({
			name,
			capacity
		});

		if (error) {
			console.error('Add Room Error:', error);
			return fail(500, { message: "Erreur lors de l'ajout de la chambre." });
		}

		return { success: true };
	},
	update: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const raw = Object.fromEntries(formData);
		const id = String(formData.get('id') ?? '');
		if (!id) return fail(400, { message: 'ID requis.' });

		const parsed = baseRoomSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, {
				message: 'Données invalides.',
				errors: parsed.error.flatten().fieldErrors
			});
		}

		const { name, capacity } = parsed.data;

		const { error } = await supabase
			.from('rooms')
			.update({
				name,
				capacity
			})
			.eq('id', id);

		if (error) {
			console.error('Update Room Error:', error);
			return fail(500, { message: 'Erreur lors de la modification.' });
		}

		return { success: true };
	},
	delete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { message: 'ID requis.' });
		}

		const { error } = await supabase.from('rooms').delete().eq('id', id);

		if (error) {
			console.error('Delete Room Error:', error);
			return fail(500, { message: 'Erreur lors de la suppression.' });
		}

		return { success: true };
	},
	assignGuest: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const raw = {
			room_id: String(formData.get('room_id') ?? ''),
			guest_id: String(formData.get('guest_id') ?? '')
		};

		const parsed = assignGuestSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { message: 'Données invalides.' });
		}

		const { room_id, guest_id } = parsed.data;
		const { error, count } = await supabase
			.from('guests')
			.update({ room_id }, { count: 'exact' })
			.eq('id', guest_id);

		if (error) {
			console.error('Assign Guest Error:', error);
			return fail(500, { message: "Erreur lors de l'assignation." });
		}

		if (!count) {
			return fail(404, { message: 'Invité introuvable.' });
		}

		return { success: true };
	},
	unassignGuest: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const raw = {
			guest_id: String(formData.get('guest_id') ?? '')
		};

		const parsed = unassignGuestSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { message: 'Données invalides.' });
		}

		const { guest_id } = parsed.data;
		const { error, count } = await supabase
			.from('guests')
			.update({ room_id: null }, { count: 'exact' })
			.eq('id', guest_id);

		if (error) {
			console.error('Unassign Guest Error:', error);
			return fail(500, { message: 'Erreur lors du retrait.' });
		}

		if (!count) {
			return fail(404, { message: 'Invité introuvable.' });
		}

		return { success: true };
	}
};
