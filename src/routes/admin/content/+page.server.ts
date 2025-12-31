import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: content, error } = await supabase.from('site_content').select('*').order('key');

	if (error) {
		console.error('Error fetching content:', error);
		return { content: [] };
	}

	return { content };
};

export const actions: Actions = {
	update: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const key = formData.get('key') as string;
		const contentStr = formData.get('content') as string;

		if (!key || !contentStr) {
			return fail(400, { message: 'Clé et contenu requis.' });
		}

		let contentJson;
		try {
			contentJson = JSON.parse(contentStr);
		} catch {
			return fail(400, { message: 'JSON invalide.' });
		}

		const { error } = await supabase
			.from('site_content')
			.update({ content: contentJson })
			.eq('key', key);

		if (error) {
			console.error('Update Content Error:', error);
			return fail(500, { message: 'Erreur lors de la mise à jour.' });
		}

		return { success: true };
	}
};
