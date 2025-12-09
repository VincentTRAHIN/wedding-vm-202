import { Resend } from 'resend';
import { render } from 'svelte/server';
import { RESEND_API_KEY, SENDER_EMAIL, ADMIN_EMAILS } from '$env/static/private';
import RsvpConfirmation from '$lib/emails/RsvpConfirmation.svelte';
import GuestInvitation from '$lib/emails/GuestInvitation.svelte';
import AdminNewRsvp from '$lib/emails/AdminNewRsvp.svelte';

if (!RESEND_API_KEY) {
	console.warn('RESEND_API_KEY is not set in environment variables.');
}

export const resend = new Resend(RESEND_API_KEY);
export const senderEmail = SENDER_EMAIL || 'onboarding@resend.dev';

console.log('Email Config:', {
	hasApiKey: !!RESEND_API_KEY,
	sender: senderEmail,
	admins: ADMIN_EMAILS
});

export async function sendRsvpConfirmation(
	to: string,
	guestName: string,
	guests: { full_name: string; rsvp_status: string }[]
) {
	console.log(`Attempting to send RSVP Confirmation to ${to}`);
	try {
		const { html } = render(RsvpConfirmation, {
			props: {
				guestName,
				guests
			}
		});

		const data = await resend.emails.send({
			from: senderEmail,
			to,
			subject: 'Confirmation de votre réponse - Mariage V&M',
			html
		});
		console.log('RSVP Confirmation sent:', data);
	} catch (e) {
		console.error('Error sending RSVP confirmation email:', e);
	}
}

export async function sendGuestInvitation(
	to: string,
	guestName: string,
	inviterName: string,
	invitationCode?: string
) {
	console.log(`Attempting to send Guest Invitation to ${to}`);
	try {
		const { html } = render(GuestInvitation, {
			props: {
				guestName,
				inviterName,
				invitationCode,
				email: to
			}
		});

		const data = await resend.emails.send({
			from: senderEmail,
			to,
			subject: 'Vous êtes invité au mariage de Vincent & Mélanie !',
			html
		});
		console.log('Guest Invitation sent:', data);
	} catch (e) {
		console.error('Error sending guest invitation email:', e);
	}
}

export async function sendAdminAlert(
	mainGuestName: string,
	status: string,
	guests: { full_name: string; rsvp_status: string }[]
) {
	if (!ADMIN_EMAILS) {
		console.warn('No ADMIN_EMAILS configured, skipping alert.');
		return;
	}

	const admins = ADMIN_EMAILS.split(',').map((e) => e.trim());
	console.log(`Attempting to send Admin Alert to ${admins.join(', ')}`);

	try {
		const { html } = render(AdminNewRsvp, {
			props: {
				mainGuestName,
				status,
				guests
			}
		});

		const data = await resend.emails.send({
			from: senderEmail,
			to: admins,
			subject: `Nouveau RSVP : ${mainGuestName} (${status === 'present' ? 'Présent' : 'Absent'})`,
			html
		});
		console.log('Admin Alert sent:', data);
	} catch (e) {
		console.error('Error sending admin alert email:', e);
	}
}

// Deprecated placeholder, keeping for compatibility if used elsewhere temporarily
export async function sendInvitationEmail(
	email: string,
	guestName: string,
	inviterName: string,
	invitationCode: string
) {
	return sendGuestInvitation(email, guestName, inviterName, invitationCode);
}
