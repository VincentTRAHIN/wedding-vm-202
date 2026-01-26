<script lang="ts">
	export let guestName: string;
	export let guests: {
		full_name: string;
		rsvp_status: string;
		present_saturday?: boolean | null;
		present_sunday?: boolean | null;
	}[] = [];

	const hasPresent = guests.some((g) => g.rsvp_status === 'present');
</script>

<div style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #FAF9F6;">
	<div
		style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border: 1px solid #e5e5e5; overflow: hidden;"
	>
		<div style="background-color: #5E7E66; padding: 32px; text-align: center; color: #ffffff;">
			<div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">💍 Mariage de</div>
			<div style="font-size: 28px; font-weight: bold; margin: 0;">Mélanie & Vincent</div>
			<div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">✅ Confirmation de réponse</div>
		</div>

		<div style="padding: 40px 32px; color: #1a1a1a; line-height: 1.6;">
			<p style="font-size: 18px; margin-bottom: 24px; color: #1a1a1a;">
				✨ C'est noté, {guestName} !
			</p>

			<p style="margin-bottom: 24px; color: #4b5563;">
				Ta réponse est bien enregistrée. Merci pour ta confirmation ! 💌
			</p>

			<div
				style="background-color: #f3f4f6; border: 1px solid #e5e5e5; border-radius: 8px; padding: 24px; margin: 24px 0;"
			>
				<h2
					style="font-size: 18px; font-weight: 600; margin-bottom: 16px; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px;"
				>
					📋 Récapitulatif de ta réponse
				</h2>
				<div style="margin: 0; padding: 0;">
					{#each guests as guest, i (i)}
						<div
							style="background-color: #ffffff; padding: 12px 16px; border-radius: 6px; margin: 12px 0;"
						>
							<div
								style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;"
							>
								<span style="font-weight: 500;">{guest.full_name}</span>
								{#if guest.rsvp_status === 'present'}
									<span style="color: #5E7E66; font-weight: bold;">✅ Présent</span>
								{:else}
									<span style="color: #dc2626; font-weight: 600;">❌ Absent</span>
								{/if}
							</div>
							{#if guest.rsvp_status === 'present' && (guest.present_saturday || guest.present_sunday)}
								<div style="font-size: 12px; color: #6b7280; margin-left: 4px; margin-top: 4px;">
									{#if guest.present_saturday}✓ Samedi 18 juillet{/if}
									{#if guest.present_saturday && guest.present_sunday}
										•
									{/if}
									{#if guest.present_sunday}✓ Dimanche 19 juillet{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			{#if hasPresent}
				<div
					style="text-align: center; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-top: 24px;"
				>
					<p style="color: #374151; font-weight: 500; margin: 0 0 8px 0;">🎉 Quel bonheur !</p>
					<p style="color: #4b5563; font-size: 14px; margin: 0;">
						On a hâte de fêter ça avec toi le <strong>18 juillet 2026</strong> ! 💕
					</p>
				</div>
			{:else}
				<p style="text-align: center; color: #4b5563; font-size: 14px; margin-top: 32px;">
					💌 Merci encore pour ta réponse. On t'embrasse !
				</p>
			{/if}
		</div>

		<div
			style="text-align: center; padding: 24px; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e5e5;"
		>
			💍 Mariage Mélanie & Vincent • 18 juillet 2026
		</div>
	</div>
</div>
