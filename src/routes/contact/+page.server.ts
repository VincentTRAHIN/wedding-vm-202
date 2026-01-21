import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { resend, senderEmail } from '$lib/server/email';
import { z } from 'zod';

const contactSchema = z.object({
	name: z.string().min(1, 'Le nom est requis'),
	email: z.string().email('Email invalide'),
	subject: z.string().min(1, 'Le sujet est requis'),
	message: z.string().min(10, 'Le message doit contenir au moins 10 caractères')
});

export const load: PageServerLoad = async ({ locals: { user } }) => {
	if (!user) throw redirect(303, '/login');

	return {};
};

export const actions: Actions = {
	send: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Unauthorized' });

		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const result = contactSchema.safeParse(data);
		if (!result.success) {
			return fail(400, {
				message: 'Formulaire invalide',
				errors: result.error.flatten().fieldErrors
			});
		}

		const { name, email, subject, message } = result.data;

		// Get guest info
		const { data: guest } = await supabase
			.from('guests')
			.select('full_name')
			.eq('auth_id', user.id)
			.single();

		// Send email to couple
		try {
			await resend.emails.send({
				from: senderEmail,
				to: 'july18.melanie@vincent-trahin.dev',
				subject: `[Contact Mariage] ${subject}`,
				html: `
					<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #5E7E66;">Nouveau message de contact</h2>
						<p><strong>De :</strong> ${name} (${email})</p>
						<p><strong>Invité :</strong> ${guest?.full_name || 'Invité inconnu'}</p>
						<p><strong>Sujet :</strong> ${subject}</p>
						<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
						<div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
							<p style="margin: 0; white-space: pre-wrap;">${message}</p>
						</div>
						<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
						<p style="color: #666; font-size: 12px;">
							Pour répondre, envoie un email directement à <a href="mailto:${email}">${email}</a>
						</p>
					</div>
				`
			});

			return { success: true };
		} catch (error) {
			console.error('Error sending contact email:', error);
			return fail(500, { message: "Erreur lors de l'envoi du message" });
		}
	}
};
