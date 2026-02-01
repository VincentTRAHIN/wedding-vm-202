<script lang="ts">
	export let guestName: string;
	export let inviterName: string;
	export let email: string;
	export let invitationType: string = 'complet';

	const isComplet = invitationType === 'complet';
</script>

<div style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #FAF9F6;">
	<div
		style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border: 1px solid #e5e5e5; overflow: hidden;"
	>
		<div style="background-color: #5E7E66; padding: 32px; text-align: center; color: #ffffff;">
			<div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">💍 Mariage de</div>
			<div style="font-size: 28px; font-weight: bold; margin: 0;">Mélanie & Vincent</div>
			<div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">
				✨ Ton accès à l'espace invité
			</div>
		</div>

		<div style="padding: 40px 32px; color: #1a1a1a; line-height: 1.6;">
			<p style="font-size: 18px; margin-bottom: 24px; color: #1a1a1a;">👋 Coucou {guestName},</p>

			<p style="margin-bottom: 24px; color: #4b5563;">
				<strong>{inviterName}</strong> vient de confirmer ta présence {#if isComplet}à notre mariage{:else}à notre cérémonie et vin d'honneur{/if} ! 🎉🥳
			</p>

			<p style="margin-bottom: 24px; color: #4b5563;">
				Ton RSVP a déjà été rempli. Tu peux maintenant te connecter à notre espace invité pour
				découvrir tous les détails {#if isComplet}du mariage{:else}de la cérémonie{/if}, la galerie photos 📸, le programme 🗓️, et bien plus
				encore !
			</p>

			<div style="text-align: center; margin: 32px 0;">
				<a
					href="https://july18.melanie.vincent-trahin.dev/login?email={encodeURIComponent(email)}"
					style="display: inline-block; background-color: #5E7E66; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;"
				>
					🔓 Accéder à mon Espace Invité
				</a>
				<p style="font-size: 13px; color: #6b7280; margin-top: 12px;">
					Si le bouton ne fonctionne pas, copie/colle le lien dans ton navigateur.
				</p>
			</div>

			<div
				style="background-color: #f3f4f6; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 24px 0;"
			>
				<div style="font-weight: 600; margin-bottom: 12px; color: #1a1a1a;">
					📧 Pour te connecter :
				</div>
				<div style="background-color: #ffffff; padding: 12px; border-radius: 6px; margin: 12px 0;">
					<span style="color: #6b7280;">Email :</span>
					<strong>{email}</strong>
				</div>
				<p style="font-size: 13px; color: #6b7280; margin: 8px 0;">
					💡 Tu peux créer un compte avec cet email ou te connecter via Google.
				</p>
			</div>

			<p style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 24px;">
				💕 On a trop hâte de te voir !
			</p>
		</div>

		<div
			style="text-align: center; padding: 24px; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e5e5;"
		>
			💍 Mariage Mélanie & Vincent • 18 juillet 2026
		</div>
	</div>
</div>
