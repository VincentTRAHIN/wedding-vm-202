import { env } from '$env/dynamic/public';

export async function sendInvitationEmail(
	email: string,
	guestName: string,
	inviterName: string,
	invitationCode: string
) {
	// TODO: Integrate with a real email service provider (e.g., Resend, SendGrid, AWS SES)
	// For now, we will log the email content to the console for development purposes.

	const siteUrl = env.PUBLIC_SITE_URL || 'http://localhost:5173';
	const subject = `Votre présence au mariage V&M est confirmée !`;
	const registerUrl = `${siteUrl}/register?code=${invitationCode}&email=${encodeURIComponent(email)}`;

	const text = `
Bonjour ${guestName},

${inviterName} a confirmé votre venue pour le mariage de Vincent & Marie.

Pour accéder aux photos et infos, connectez-vous sur le site avec ce code : ${invitationCode}
Ou utilisez le lien suivant :
${registerUrl}

À très vite !
Vincent & Marie
	`.trim();

	console.log('--- MOCK EMAIL SENDING ---');
	console.log(`To: ${email}`);
	console.log(`Subject: ${subject}`);
	console.log(`Body:\n${text}`);
	console.log('--------------------------');

	return { success: true };
}
