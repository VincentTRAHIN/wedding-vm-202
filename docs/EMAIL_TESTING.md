# 📧 Guide de Test - Envoi d'Emails aux Invités Ajoutés

## Contexte

Quand un invité ajoute un autre invité (managed guest) via le formulaire RSVP et fournit une adresse email, un email d'invitation doit être envoyé automatiquement à cet invité.

## Fonctionnement

### 1. Email envoyé dans `addManagedGuest` (nouveau invité)

Quand un invité ajoute un invité via RSVP :

- ✅ Email envoyé si : adulte + email fourni
- ❌ Pas d'email si : enfant (`is_child = true`) ou pas d'email (`no_email = true`)

### 2. Email envoyé dans `update` (invités existants)

Quand un invité met à jour son RSVP avec des invités secondaires :

- ✅ Email envoyé si : `rsvp_status = 'present'` + email fourni + pas encore envoyé (`invitation_sent = false`)

## Configuration Requise

### Variables d'environnement (.env)

```bash
# Clé API Resend (obligatoire)
RESEND_API_KEY=re_xxxxxxxxx

# Email expéditeur
SENDER_EMAIL=noreply@tondomaine.com

# Emails des administrateurs (pour notifications)
ADMIN_EMAILS=toi@example.com,autre@example.com
```

### Obtenir une clé Resend

1. Va sur [resend.com](https://resend.com)
2. Crée un compte / connecte-toi
3. Va dans **API Keys**
4. Crée une nouvelle clé API
5. Copie la clé et mets-la dans `.env`

## Test en Local

### 1. Configure tes variables d'environnement

```bash
# Copie le fichier example
cp .env.example .env

# Édite .env et ajoute ta vraie clé Resend
RESEND_API_KEY=re_ta_vraie_cle
SENDER_EMAIL=noreply@tondomaine.com
```

### 2. Lance le serveur de dev

```bash
npm run dev
```

### 3. Teste l'ajout d'un invité avec email

#### Scénario A : Via l'interface RSVP

1. Connecte-toi avec un compte invité
2. Va sur `/rsvp`
3. Clique sur "Ajouter un invité"
4. Remplis le formulaire :
   - Sélectionne un invité non lié
   - Entre une adresse email de test (utilise ton email perso)
   - **Ne coche PAS** "Cet invité est un enfant"
   - **Ne coche PAS** "Pas d'adresse email"
5. Valide

#### Logs attendus dans la console

```
📧 Sending invitation email to test@example.com (Jean Dupont) from Vincent Trahin
✅ Guest Invitation sent to: test@example.com
✅ Invitation email sent successfully to test@example.com
```

### 4. Vérifie ta boîte mail

- Tu devrais recevoir un email avec :
  - Sujet : "Tu es invité·e au mariage de Vincent & Mélanie ! 💍"
  - Message : "[inviterName] vient de confirmer ta présence à notre mariage ! 🎉"
  - Bouton : "Accéder à l'Espace Invité"

## Débogage

### L'email n'est pas envoyé ?

#### 1. Vérifie les logs dans la console

```bash
# Si tu vois ce message :
⚠️ RESEND_API_KEY is not set in environment variables.
# → Ta clé API n'est pas configurée

# Si tu vois :
ℹ️ Skipping email for child: Jean Dupont
# → L'invité est marqué comme enfant

# Si tu vois :
ℹ️ Skipping email - no email provided for: Jean Dupont
# → Pas d'email fourni
```

#### 2. Teste manuellement la fonction email

Crée un fichier de test : `src/routes/test-email/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import { sendGuestInvitation } from '$lib/server/email';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const result = await sendGuestInvitation('ton-email@example.com', 'Test Guest', 'Vincent');

	return json(result);
};
```

Puis visite : `http://localhost:5173/test-email`

#### 3. Vérifie Resend Dashboard

- Va sur [resend.com/emails](https://resend.com/emails)
- Tu devrais voir l'historique des emails envoyés
- Si l'email apparaît mais n'arrive pas, vérifie les spams

### Erreurs courantes

#### "Email service not configured"

→ `RESEND_API_KEY` manquante dans `.env`

#### "Domain not verified"

→ Sur Resend, tu dois vérifier ton domaine ou utiliser le domaine de test `onboarding@resend.dev`

#### L'email part mais n'arrive pas

→ Vérifie tes spams / vérifie le domaine expéditeur sur Resend

## Template de l'Email

Le template se trouve dans : `/src/lib/emails/GuestInvitation.svelte`

### Contenu actuel

- **En-tête** : "Mariage de Mélanie & Vincent"
- **Message** : "[inviterName] vient de confirmer ta présence"
- **Explication** : "Ton RSVP a déjà été rempli par [inviterName]"
- **CTA** : Bouton "Accéder à l'Espace Invité"
- **Instructions** : Comment se connecter avec l'email

## Production

### Variables d'environnement Vercel

1. Va dans ton projet Vercel
2. Settings > Environment Variables
3. Ajoute :
   ```
   RESEND_API_KEY=re_ta_cle_production
   SENDER_EMAIL=noreply@tondomaine.com
   ADMIN_EMAILS=toi@example.com
   ```

### Domaine vérifié

Pour envoyer depuis ton propre domaine (ex: `noreply@melanie-vincent-mariage.com`) :

1. Dans Resend > Domains
2. Ajoute ton domaine
3. Configure les DNS (SPF, DKIM, DMARC)
4. Attends la vérification

### Test de production

Utilise l'URL de test Resend si pas encore de domaine vérifié :

```bash
SENDER_EMAIL=onboarding@resend.dev
```
