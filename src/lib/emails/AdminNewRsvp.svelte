<script lang="ts">
	export let mainGuestName: string;
	export let status: string;
	export let guests: { full_name: string; rsvp_status: string }[] = [];
</script>

<div style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #FAF9F6;">
	<div
		style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border: 1px solid #e5e5e5; overflow: hidden;"
	>
		<div style="background-color: #5E7E66; padding: 32px; text-align: center; color: #ffffff;">
			<div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">💍 Mariage de</div>
			<div style="font-size: 28px; font-weight: bold; margin: 0;">Mélanie & Vincent</div>
			<div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">🔔 Notification Admin</div>
		</div>

		<div style="padding: 40px 32px; color: #1a1a1a; line-height: 1.6;">
			<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">📬 Nouveau RSVP reçu</h2>

			<div
				style="background-color: #f3f4f6; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 24px;"
			>
				<div style="font-size: 14px; color: #4b5563; margin-bottom: 8px;">👤 Réponse de</div>
				<div
					style="display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; padding: 12px; border-radius: 6px;"
				>
					<div style="font-size: 16px; font-weight: 600;">{mainGuestName}</div>
					{#if status === 'present'}
						<span
							style="display: inline-block; border-radius: 9999px; background-color: #d1fae5; padding: 4px 16px; font-size: 14px; font-weight: 600; color: #5E7E66;"
						>
							✅ PRÉSENT
						</span>
					{:else}
						<span
							style="display: inline-block; border-radius: 9999px; background-color: #fee2e2; padding: 4px 16px; font-size: 14px; font-weight: 600; color: #dc2626;"
						>
							❌ ABSENT
						</span>
					{/if}
				</div>
			</div>

			{#if guests.length > 0}
				<div style="margin-bottom: 24px;">
					<h3
						style="font-size: 14px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;"
					>
						👥 Accompagnants ({guests.length})
					</h3>
					<div
						style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px;"
					>
						{#each guests as guest, i (i)}
							<div
								style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; {i ===
								guests.length - 1
									? 'border-bottom: none;'
									: ''}"
							>
								<span style="font-weight: 500;">{guest.full_name}</span>
								<span
									style="font-weight: 600; color: {guest.rsvp_status === 'present'
										? '#5E7E66'
										: '#dc2626'};"
								>
									{guest.rsvp_status === 'present' ? '✅ Présent' : '❌ Absent'}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div style="text-align: center; margin-top: 32px;">
				<a
					href="https://july18.melanie.vincent-trahin.dev/admin/guests"
					style="display: inline-block; background-color: #5E7E66; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;"
				>
					📊 Ouvrir le Dashboard Admin
				</a>
				<p style="font-size: 13px; color: #6b7280; margin-top: 12px;">🔒 Lien réservé à l'administration</p>
			</div>
		</div>

		<div
			style="text-align: center; padding: 24px; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e5e5;"
		>
			💍 Mariage Mélanie & Vincent • 18 juillet 2026
		</div>
	</div>
</div>
