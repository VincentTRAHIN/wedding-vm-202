# 🚀 Quick Start - Corrections de Sécurité

**Objectif**: Rendre l'application prête pour production en 30 minutes

---

## ⏱️ Timeline

| Tâche              | Durée  | Priorité    |
| ------------------ | ------ | ----------- |
| Régénérer les clés | 10 min | 🔴 CRITIQUE |
| Nettoyer Git       | 5 min  | 🔴 CRITIQUE |
| Rate limiting      | 10 min | ⚠️ HAUTE    |
| IDOR fix           | 3 min  | ⚠️ HAUTE    |
| Sanitization       | 5 min  | ⚠️ HAUTE    |

**Total**: ~30-35 minutes

---

## 🔴 Étape 1: Régénérer les Clés (10 min)

### 1.1 Supabase SERVICE_ROLE_KEY

```bash
# 1. Ouvrir Supabase Dashboard
open https://supabase.com/dashboard/project/lrrygafrwyxnzbwaxntn/settings/api

# 2. Dans la section "Project API keys", sous "service_role"
#    Cliquer sur l'icône "..." puis "Regenerate"

# 3. Copier la nouvelle clé et mettre à jour .env
# SERVICE_ROLE_KEY=nouvelle-clé-ici
```

### 1.2 Resend RESEND_API_KEY

```bash
# 1. Ouvrir Resend Dashboard
open https://resend.com/api-keys

# 2. Supprimer l'ancienne clé (re_PTWHViDK...)
# 3. Créer une nouvelle clé: "Create API Key"
# 4. Nom: "wedding-vm-prod"
# 5. Copier la clé (une seule fois !)

# 6. Mettre à jour .env
# RESEND_API_KEY=re_nouvelle-clé-ici
```

### 1.3 Générer CRON_SECRET

```bash
# Générer une clé aléatoire forte
openssl rand -base64 32

# Copier le résultat et mettre à jour .env
# CRON_SECRET=résultat-ici
```

### 1.4 Test

```bash
# Démarrer l'app
npm run dev

# Tester (dans un autre terminal)
curl "http://localhost:5173/api/keep-alive?key=VOTRE_NOUVEAU_CRON_SECRET"

# Devrait retourner: {"status":"alive",...}
```

---

## 🔴 Étape 2: Nettoyer Git (5 min)

### Option Simple (recommandée si repo privé)

```bash
# Retirer .env du tracking
git rm --cached .env

# Commit
git add .
git commit -m "security: remove .env from Git"

# Push
git push origin main
```

### Option Complète (si repo public ou partagé)

⚠️ **Attention**: Réécriture d'historique, coordonner avec l'équipe

```bash
# Supprimer .env de tout l'historique
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (avertir l'équipe avant !)
git push origin --force --all
git push origin --force --tags

# Nettoyer localement
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## ⚠️ Étape 3: Rate Limiting (10 min)

### 3.1 Login

Fichier: `src/routes/login/+page.server.ts`

```typescript
// Ajouter en haut du fichier
import { checkRateLimit } from '$lib/server/validation';

// Dans l'action login_password
export const actions: Actions = {
  login_password: async ({ request, locals, getClientAddress }) => {
    // ✅ NOUVEAU: Rate limiting
    const clientIp = getClientAddress();
    const { allowed } = checkRateLimit(`login:${clientIp}`, 5, 60000);

    if (!allowed) {
      return fail(429, {
        message: 'Trop de tentatives. Réessayez dans 1 minute.'
      });
    }

    // ... reste du code existant (ne rien modifier)
```

### 3.2 Register

Fichier: `src/routes/register/+page.server.ts`

```typescript
import { checkRateLimit } from '$lib/server/validation';

export const actions: Actions = {
  register: async ({ request, getClientAddress }) => {
    const clientIp = getClientAddress();
    const { allowed } = checkRateLimit(`register:${clientIp}`, 3, 3600000);

    if (!allowed) {
      return fail(429, { message: 'Trop de tentatives. Réessayez plus tard.' });
    }

    // ... reste du code existant
```

### 3.3 RSVP

Fichier: `src/routes/rsvp/+page.server.ts`

```typescript
import { checkRateLimit } from '$lib/server/validation';

export const actions: Actions = {
  update: async ({ request, locals: { user } }) => {
    if (!user) return fail(401);

    const { allowed } = checkRateLimit(`rsvp:${user.id}`, 10, 60000);
    if (!allowed) {
      return fail(429, { message: 'Trop de mises à jour. Attendez un peu.' });
    }

    // ... reste du code existant
```

### 3.4 Upload

Fichier: `src/routes/gallery/+page.server.ts`

```typescript
import { checkRateLimit } from '$lib/server/validation';

export const actions: Actions = {
  upload: async ({ request, locals: { user } }) => {
    if (!user) return fail(401);

    const { allowed } = checkRateLimit(`upload:${user.id}`, 20, 3600000);
    if (!allowed) {
      return fail(429, { message: 'Limite d\'upload atteinte. Réessayez dans 1h.' });
    }

    // ... reste du code existant
```

---

## ⚠️ Étape 4: Fix IDOR (3 min)

Fichier: `src/routes/rsvp/+page.server.ts`

Dans l'action `addManagedGuest`, ajouter la vérification après la récupération du `currentUserGuest` :

```typescript
addManagedGuest: async ({ request, locals: { user } }) => {
  // ... code existant jusqu'à currentUserGuest ...

  // ✅ NOUVEAU: Vérifier que l'invité cible est disponible
  const { data: targetGuest } = await supabaseAdmin
    .from('guests')
    .select('managed_by_id, auth_id')
    .eq('id', guestId)
    .single();

  if (!targetGuest) {
    return fail(404, { message: 'Invité introuvable.' });
  }

  if (targetGuest.managed_by_id || targetGuest.auth_id) {
    return fail(400, {
      message: 'Cet invité est déjà lié à un compte ou géré par quelqu\'un.'
    });
  }

  // ... continuer avec le reste du code existant (assignation)
```

---

## ⚠️ Étape 5: Sanitization (5 min)

### 5.1 RSVP

Fichier: `src/routes/rsvp/+page.server.ts`

```typescript
// Ajouter en haut
import { sanitizeHtml } from '$lib/server/validation';

// Dans la boucle de traitement des guests (action update)
const rawData = {
	rsvp_status: status,
	present_saturday: formData.get(`${prefix}present_saturday`) === 'on',
	present_sunday: formData.get(`${prefix}present_sunday`) === 'on',
	dietary_restrictions: formData.get(`${prefix}dietary_restrictions`) || null,
	message_for_couple: formData.get(`${prefix}message_for_couple`) || null
};

// ✅ NOUVEAU: Sanitize avant validation
if (rawData.dietary_restrictions) {
	rawData.dietary_restrictions = sanitizeHtml(rawData.dietary_restrictions);
}
if (rawData.message_for_couple) {
	rawData.message_for_couple = sanitizeHtml(rawData.message_for_couple);
}

const result = rsvpSchema.safeParse(rawData);
// ... reste du code
```

### 5.2 Gallery

Fichier: `src/routes/gallery/+page.server.ts`

```typescript
import { sanitizeHtml } from '$lib/server/validation';

// Dans l'action upload
upload: async ({ request, locals: { user } }) => {
  // ... code existant ...

  let caption = formData.get('caption')?.toString();

  // ✅ NOUVEAU: Sanitize caption
  if (caption) {
    caption = sanitizeHtml(caption);
  }

  // ... reste du code
```

---

## ✅ Étape 6: Vérification (5 min)

### Checklist rapide

```bash
# 1. Build l'application
npm run build

# Devrait compiler sans erreur
```

```bash
# 2. Tests manuels
npm run dev

# Tester dans le navigateur:
# - Login (max 5 tentatives puis 429)
# - Register (max 3 par heure)
# - RSVP (saisir du HTML dans message → devrait être échappé)
# - Upload (caption avec <script> → devrait être échappé)
# - Keep-Alive (curl avec bonne clé → 200, mauvaise clé → 401)
```

```bash
# 3. Vérifier les logs
# Aucun email/password/token ne devrait apparaître
```

---

## 🎯 Checklist Finale

Avant de passer en production :

- [ ] ✅ SERVICE_ROLE_KEY régénérée
- [ ] ✅ RESEND_API_KEY régénérée
- [ ] ✅ CRON_SECRET générée
- [ ] ✅ .env supprimé de Git
- [ ] ✅ Rate limiting testé (login, register, RSVP, upload)
- [ ] ✅ IDOR fix testé (tentative d'assigner invité déjà géré)
- [ ] ✅ Sanitization testée (HTML dans messages)
- [ ] ✅ Keep-Alive fonctionnel
- [ ] ✅ Build sans erreur
- [ ] ✅ Variables d'environnement en production à jour

---

## 📚 Ressources

- **Guide complet**: [docs/ACTIONS_CRITIQUES.md](./ACTIONS_CRITIQUES.md)
- **Audit complet**: [docs/SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- **Tests**: [docs/TEST_CHECKLIST.md](./TEST_CHECKLIST.md)

---

## 🆘 En cas de problème

### Build échoue

```bash
# Vérifier les imports
npm run check

# Si erreurs TypeScript, vérifier les types
```

### Clés ne marchent pas

```bash
# Vérifier les variables d'environnement
echo $SERVICE_ROLE_KEY
echo $RESEND_API_KEY
echo $CRON_SECRET

# Redémarrer le serveur
pkill -f "node.*vite"
npm run dev
```

### Rate limiting ne fonctionne pas

```bash
# Vérifier que checkRateLimit est bien importé
grep -r "checkRateLimit" src/routes/

# Devrait apparaître dans login, register, rsvp, gallery
```

---

**Temps total estimé**: 30-35 minutes

**Bonne chance ! 🚀**
