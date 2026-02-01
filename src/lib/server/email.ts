import { Resend } from 'resend';
import { render } from 'svelte/server';
import { RESEND_API_KEY, SENDER_EMAIL, ADMIN_EMAILS } from '$env/static/private';
import RsvpConfirmation from '$lib/emails/RsvpConfirmation.svelte';
import GuestInvitation from '$lib/emails/GuestInvitation.svelte';
import AdminNewRsvp from '$lib/emails/AdminNewRsvp.svelte';

if (!RESEND_API_KEY) {
	if (process.env.NODE_ENV === 'development') {
		console.warn('⚠️ RESEND_API_KEY is not set in environment variables.');
	}
}

export const resend = new Resend(RESEND_API_KEY);
export const senderEmail = SENDER_EMAIL || 'onboarding@resend.dev';

// Vérifier que le sender email est correct
if (!SENDER_EMAIL || SENDER_EMAIL === 'onboarding@resend.dev') {
	console.error('❌ SENDER_EMAIL is not properly configured! Using fallback:', senderEmail);
	console.error('   Please set SENDER_EMAIL in your environment variables.');
}

// Log config only in development
if (process.env.NODE_ENV === 'development') {
	console.log('📧 Email Config:', {
		hasApiKey: !!RESEND_API_KEY,
		sender: senderEmail,
		adminEmails: ADMIN_EMAILS
	});
}

export async function sendRsvpConfirmation(
	to: string,
	guestName: string,
	guests: {
		full_name: string;
		rsvp_status: string;
		present_saturday?: boolean | null;
		present_sunday?: boolean | null;
	}[],
	invitationType: string = 'complet'
) {
	if (!RESEND_API_KEY) {
		throw new Error('Email service not configured');
	}
	try {
		const { body: html } = render(RsvpConfirmation, {
			props: {
				guestName,
				guests,
				invitationType
			}
		});

		const data = await resend.emails.send({
			from: senderEmail,
			to,
			subject: 'Confirmation de ta réponse - Mariage V&M',
			html
		});
		if (process.env.NODE_ENV === 'development') {
			console.log('✅ RSVP Confirmation sent to:', to);
		}
		return { success: true, data };
	} catch (e) {
		console.error('❌ Error sending RSVP confirmation email:', e);
		return { success: false, error: e };
	}
}

export async function sendGuestInvitation(to: string, guestName: string, inviterName: string, invitationType: string = 'complet') {
	if (!RESEND_API_KEY) {
		console.error('❌ RESEND_API_KEY is not configured!');
		throw new Error('Email service not configured');
	}

	console.log(`📨 Preparing to send invitation email...`);
	console.log(`   To: ${to}`);
	console.log(`   Guest: ${guestName}`);
	console.log(`   From: ${inviterName}`);
	console.log(`   📧 Using sender: ${senderEmail}`);

	try {
		const { body: html } = render(GuestInvitation, {
			props: {
				guestName,
				inviterName,
				email: to,
				invitationType
			}
		});

		console.log(`📤 Sending email via Resend...`);
		const data = await resend.emails.send({
			from: senderEmail,
			to,
			subject: 'Tu es invité·e au mariage de Vincent & Mélanie ! 💍',
			html
		});

		console.log(`✅ Resend response:`, data);

		if (process.env.NODE_ENV === 'development') {
			console.log('✅ Guest Invitation sent to:', to);
		}
		return { success: true, data };
	} catch (e) {
		console.error('❌ Error sending guest invitation email:', e);
		console.error('❌ Error details:', e instanceof Error ? e.message : String(e));
		return { success: false, error: e };
	}
}

export async function sendAdminAlert(
	mainGuestName: string,
	status: string,
	present_saturday: boolean | null,
	present_sunday: boolean | null,
	guests: {
		full_name: string;
		rsvp_status: string;
		present_saturday?: boolean | null;
		present_sunday?: boolean | null;
	}[],
	invitationType: string = 'complet'
) {
	if (!ADMIN_EMAILS) {
		if (process.env.NODE_ENV === 'development') {
			console.warn('⚠️ No ADMIN_EMAILS configured, skipping alert.');
		}
		return { success: false, error: 'No admin emails configured' };
	}

	if (!RESEND_API_KEY) {
		throw new Error('Email service not configured');
	}

	const admins = ADMIN_EMAILS.split(',').map((e) => e.trim());

	try {
		const { body: html } = render(AdminNewRsvp, {
			props: {
				mainGuestName,
				status,
				present_saturday,
				present_sunday,
				guests,
				invitationType
			}
		});

		const data = await resend.emails.send({
			from: senderEmail,
			to: admins,
			subject: `Nouveau RSVP : ${mainGuestName} (${status === 'present' ? 'Présent' : 'Absent'})`,
			html
		});
		if (process.env.NODE_ENV === 'development') {
			console.log('✅ Admin Alert sent');
		}
		return { success: true, data };
	} catch (e) {
		console.error('❌ Error sending admin alert email:', e);
		return { success: false, error: e };
	}
}

