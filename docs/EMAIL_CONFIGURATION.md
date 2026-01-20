# Configuration des Templates Email Supabase

## 📧 Template Reset Password

### Comment configurer dans Supabase

1. **Aller dans Supabase Dashboard**
   - Project Settings → Authentication → Email Templates

2. **Sélectionner "Reset password"**

3. **Copier/coller le contenu du fichier** `docs/email-templates/reset-password.html`
   
   ⚠️ **IMPORTANT** : Le template utilise `{{ .ConfirmationURL }}` qui est automatiquement généré par Supabase avec tous les bons paramètres (type, token_hash, redirect_to). Ne pas modifier cette variable.

4. **Vérifier la configuration du Redirect URL dans Supabase**
   - Aller dans Project Settings → Authentication → URL Configuration
   - Dans "Redirect URLs", ajouter : `https://july18.melanie.vincent-trahin.dev/auth/callback`
   - Pour dev local : `http://localhost:5173/auth/callback`

4. **Configurer SMTP Custom (Important !)**
   - Aller dans Project Settings → Authentication → SMTP Settings
   - Activer "Enable Custom SMTP"
   - Renseigner :
     ```
     Sender Email: july18.melanie@vincent-trahin.dev
     Sender Name: Mariage Mélanie & Vincent 💍
     Host: smtp.resend.com
     Port: 465 (SSL) ou 587 (TLS)
     Username: resend
     Password: [Ta clé API Resend]
     ```

5. **Variables disponibles dans les templates Supabase :**
   - `{{ .ConfirmationURL }}` - Lien de confirmation
   - `{{ .Token }}` - Token de sécurité
   - `{{ .TokenHash }}` - Hash du token
   - `{{ .SiteURL }}` - URL de base du site
   - `{{ .Email }}` - Email du destinataire
   - `{{ .RedirectTo }}` - URL de redirection

## 🎨 Design des Emails

### Palette de couleurs

- **Vert principal** : `#5E7E66`
- **Fond** : `#FAF9F6` (beige très clair)
- **Texte** : `#1a1a1a`
- **Gris** : `#6b7280`
- **Bordures** : `#e5e5e5`

### Emojis utilisés

- 💍 Mariage
- 🎉 Célébration
- ✨ Magie
- 👋 Salutation
- 📧 Email
- ✅ Validation
- ❌ Refus
- 💕 Amour
- 🔒 Sécurité
- 🔓 Accès
- 📌 Important
- 💡 Info

### Structure commune

1. **Header** (vert #5E7E66)
   - Titre "Mariage de"
   - Noms "Mélanie & Vincent"
   - Sous-titre contextuel

2. **Corps** (fond blanc)
   - Message personnalisé
   - Bouton d'action principal
   - Informations complémentaires

3. **Footer** (optionnel)
   - Date du mariage
   - Informations de contact

## 📝 Templates d'application (SvelteKit)

Les templates suivants sont gérés par ton code SvelteKit et utilisent Resend :

### 1. GuestInvitation.svelte

**Fonction** : Email envoyé quand un invité est ajouté par un autre invité
**Trigger** : Action `addManagedGuest` dans `/rsvp`
**Props** :

- `guestName` : Nom de l'invité ajouté
- `inviterName` : Nom de la personne qui invite
- `email` : Email de l'invité

### 2. RsvpConfirmation.svelte

**Fonction** : Confirmation de RSVP pour l'invité principal
**Trigger** : Action `update` dans `/rsvp`
**Props** :

- `guestName` : Nom de l'invité principal
- `guests` : Liste des invités avec leur statut

### 3. AdminNewRsvp.svelte

**Fonction** : Notification admin pour nouveau RSVP
**Trigger** : Action `update` dans `/rsvp`
**Props** :

- `mainGuestName` : Nom de l'invité principal
- `status` : 'present' ou 'absent'
- `guests` : Liste des accompagnants

## 🔧 Configuration Resend dans .env

```env
RESEND_API_KEY=re_PTWHViDK_N6fCrM46E33FkohewiNpYMCj
SENDER_EMAIL=july18.melanie@vincent-trahin.dev
ADMIN_EMAILS=vincent.trahin@gmail.com,melanie.douge@gmail.com
```

## ✅ Checklist de configuration

- [ ] Template Reset Password copié dans Supabase
- [ ] SMTP Custom configuré avec Resend
- [ ] DNS vérifié (DKIM, SPF, DMARC) sur Porkbun
- [ ] Domaine `vincent-trahin.dev` vérifié dans Resend
- [ ] Email `july18.melanie@vincent-trahin.dev` vérifié
- [ ] Test d'envoi Reset Password fonctionnel
- [ ] Test d'envoi GuestInvitation fonctionnel
- [ ] Test d'envoi RsvpConfirmation fonctionnel
- [ ] Test d'envoi AdminNewRsvp fonctionnel

## 🧪 Tests

Pour tester les emails d'application :

```bash
# Accéder à la page de test
http://localhost:5173/test-email-send
```

Pour tester le Reset Password :

1. Aller sur `/forgot-password`
2. Entrer un email
3. Vérifier la réception
4. Cliquer sur le lien
5. Vérifier la redirection vers `/profile/reset-password`

## 📊 Monitoring

- **Resend Dashboard** : https://resend.com/emails
- **Supabase Logs** : Project → Logs → Auth Logs
- **Console logs** : Vérifier les logs serveur pour les erreurs d'envoi
