import { json } from '@sveltejs/kit';
import { sendGuestInvitation } from '$lib/server/email';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	// Récupère l'email depuis les query params
	const testEmail = url.searchParams.get('email') || 'test@example.com';
	const guestName = url.searchParams.get('name') || 'Test Guest';
	const inviterName = url.searchParams.get('inviter') || 'Vincent';

	console.log(`🧪 Test email envoi à ${testEmail}`);

	try {
		const result = await sendGuestInvitation(testEmail, guestName, inviterName);

		return json({
			success: result.success,
			message: result.success
				? `✅ Email envoyé avec succès à ${testEmail}`
				: `❌ Échec de l'envoi`,
			details: result,
			params: {
				to: testEmail,
				guestName,
				inviterName
			}
		});
	} catch (error) {
		console.error('❌ Erreur lors du test:', error);
		return json(
			{
				success: false,
				message: '❌ Erreur lors du test',
				error: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
