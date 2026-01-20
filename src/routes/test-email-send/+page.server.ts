import { sendGuestInvitation } from '$lib/server/email';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	console.log('\n\n🧪 ========== TEST EMAIL DIRECT ==========');
	console.log('Attempting to send test email to melanie.douge@gmail.com...\n');

	try {
		const result = await sendGuestInvitation(
			'melanie.douge@gmail.com',
			'Mélanie TRAHIN',
			'Vincent TRAHIN'
		);

		console.log('\n📊 Result:', JSON.stringify(result, null, 2));
		console.log('🧪 ========== END TEST ==========\n\n');

		return {
			result,
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		console.error('\n❌ Exception caught:', error);
		console.log('🧪 ========== END TEST (ERROR) ==========\n\n');

		return {
			result: {
				success: false,
				error: {
					message: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined
				}
			},
			timestamp: new Date().toISOString()
		};
	}
};
