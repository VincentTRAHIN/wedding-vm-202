# 🚨 Actions Critiques Avant Production

**Date**: 23 janvier 2026  
**Status**: ⚠️ À FAIRE IMMÉDIATEMENT

---

## 🔴 CRITIQUE - À faire MAINTENANT

### 1. Régénérer les clés exposées dans Git

Le fichier `.env` a été commité dans Git, exposant toutes vos clés secrètes. **Toutes les clés doivent être régénérées immédiatement.**

#### 1.1 Régénérer SERVICE_ROLE_KEY (Supabase)

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet `lrrygafrwyxnzbwaxntn`
3. Allez dans **Settings** > **API**
4. Section **Project API keys** > **service_role** > Cliquez sur **Regenerate**
5. Copiez la nouvelle clé
6. Mettez à jour `.env` local :
   ```env
   SERVICE_ROLE_KEY=nouvelle-clé-ici
   ```
7. Mettez à jour la variable d'environnement sur votre plateforme d'hébergement

#### 1.2 Régénérer RESEND_API_KEY

1. Allez sur [Resend Dashboard](https://resend.com/api-keys)
2. Trouvez la clé `re_PTWHViDK_N6fCrM46E33FkohewiNpYMCj`
3. Cliquez sur **Delete**
4. Créez une nouvelle clé API : **Create API Key**
5. Donnez-lui un nom: `wedding-vm-prod`
6. Copiez la nouvelle clé (elle ne sera affichée qu'une fois !)
7. Mettez à jour `.env` local :
   ```env
   RESEND_API_KEY=re_nouvelle-clé-ici
   ```
8. Mettez à jour la variable d'environnement sur votre plateforme d'hébergement

#### 1.3 Générer CRON_SECRET

```bash
openssl rand -base64 32
```

Copiez le résultat et mettez à jour `.env` :

```env
CRON_SECRET=votre-clé-aléatoire-générée
```

#### 1.4 Supprimer .env de l'historique Git

⚠️ **Attention**: Cette opération réécrit l'historique Git. Coordonnez-vous avec votre équipe.

```bash
# Retirer .env du tracking
git rm --cached .env

# Commit
git commit -m "chore: remove .env from tracking"

# Nettoyer l'historique (⚠️ DESTRUCTIF)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ Avertir l'équipe avant)
git push origin --force --all
git push origin --force --tags

# Nettoyer localement
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Alternative plus simple** (si le repo n'est pas partagé):

```bash
# Créer un nouveau repo sans historique
rm -rf .git
git init
git add .
git commit -m "Initial commit (security reset)"
git remote add origin <votre-url>
git push -u origin main --force
```

#### 1.5 Vérification

Après avoir régénéré toutes les clés :

```bash
# Testez votre application localement
npm run dev

# Vérifiez que :
# - La connexion Supabase fonctionne
# - Les emails s'envoient
# - Le keep-alive répond
curl "http://localhost:5173/api/keep-alive?key=VOTRE_NOUVEAU_CRON_SECRET"
```

---

## ⚠️ HAUTE PRIORITÉ - Cette semaine

### 2. Implémenter Rate Limiting

La fonction existe mais n'est pas utilisée. Ajoutez-la sur les routes critiques.

#### 2.1 Login

Éditez `src/routes/login/+page.server.ts` :

```typescript
import { checkRateLimit } from '$lib/server/validation';

export const actions: Actions = {
	login_password: async ({ request, locals, getClientAddress }) => {
		const clientIp = getClientAddress();
		const { allowed, remaining } = checkRateLimit(`login:${clientIp}`, 5, 60000);

		if (!allowed) {
			return fail(429, {
				message: 'Trop de tentatives de connexion. Réessayez dans 1 minute.'
			});
		}

		// ... reste du code existant
	}
};
```

#### 2.2 Register

Éditez `src/routes/register/+page.server.ts` :

```typescript
import { checkRateLimit } from '$lib/server/validation';

export const actions: Actions = {
	register: async ({ request, getClientAddress }) => {
		const clientIp = getClientAddress();
		const { allowed } = checkRateLimit(`register:${clientIp}`, 3, 3600000); // 3 par heure

		if (!allowed) {
			return fail(429, {
				message: "Trop de tentatives d'inscription. Réessayez plus tard."
			});
		}

		// ... reste du code existant
	}
};
```

#### 2.3 RSVP

Éditez `src/routes/rsvp/+page.server.ts` :

```typescript
import { checkRateLimit } from '$lib/server/validation';

export const actions: Actions = {
	update: async ({ request, locals: { user } }) => {
		if (!user) return fail(401);

		const { allowed } = checkRateLimit(`rsvp:${user.id}`, 10, 60000);

		if (!allowed) {
			return fail(429, {
				message: 'Trop de mises à jour. Attendez un peu.'
			});
		}

		// ... reste du code existant
	}
};
```

#### 2.4 Upload Photos

Éditez `src/routes/gallery/+page.server.ts` :

```typescript
import { checkRateLimit } from '$lib/server/validation';

export const actions: Actions = {
	upload: async ({ request, locals: { user } }) => {
		if (!user) return fail(401);

		const { allowed } = checkRateLimit(`upload:${user.id}`, 20, 3600000); // 20 par heure

		if (!allowed) {
			return fail(429, {
				message: "Limite d'upload atteinte. Réessayez dans 1 heure."
			});
		}

		// ... reste du code existant
	}
};
```

### 3. Corriger IDOR sur Managed Guests

Éditez `src/routes/rsvp/+page.server.ts`, action `addManagedGuest` :

```typescript
addManagedGuest: async ({ request, locals: { user } }) => {
	if (!user) return fail(401);

	const formData = await request.formData();
	const guestId = formData.get('guestId') as string;

	if (!guestId) return fail(400, { message: 'Veuillez sélectionner un invité.' });

	const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY);

	// Récupérer le current user
	const { data: currentUserGuest } = await supabaseAdmin
		.from('guests')
		.select('id')
		.eq('auth_id', user.id)
		.single();

	if (!currentUserGuest) return fail(400, { message: 'Profil introuvable.' });

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
			message: "Cet invité est déjà lié à un compte ou géré par quelqu'un."
		});
	}

	// Continuer avec l'assignation...
	const { error } = await supabaseAdmin
		.from('guests')
		.update({ managed_by_id: currentUserGuest.id })
		.eq('id', guestId);

	// ... reste du code
};
```

### 4. Sanitization HTML

Éditez `src/routes/rsvp/+page.server.ts` :

```typescript
import { sanitizeHtml } from '$lib/server/validation';

// Dans la boucle de traitement des guests
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
```

Faites de même dans `src/routes/gallery/+page.server.ts` pour les captions :

```typescript
import { sanitizeHtml } from '$lib/server/validation';

// Dans l'action upload
if (caption) {
	caption = sanitizeHtml(caption);
}
```

---

## 📋 Checklist de Vérification

Avant de déployer en production, vérifiez que :

- [ ] ✅ Toutes les clés ont été régénérées
- [ ] ✅ `.env` supprimé de l'historique Git
- [ ] ✅ Nouvelles clés configurées en production
- [ ] ✅ Keep-Alive testé et fonctionnel
- [ ] ✅ Rate limiting implémenté sur login, register, RSVP, upload
- [ ] ✅ IDOR corrigé sur managed guests
- [ ] ✅ Sanitization HTML appliquée
- [ ] ✅ Tests manuels passés (voir [TEST_CHECKLIST.md](./TEST_CHECKLIST.md))
- [ ] ✅ Variables d'environnement en production vérifiées
- [ ] ✅ Monitoring configuré (UptimeRobot, Sentry)

---

## 🆘 Support

Si vous rencontrez un problème :

1. **Logs Supabase**: Dashboard > Logs
2. **Logs Application**: Vérifiez la console de votre hébergeur
3. **Tests locaux**: `npm run dev` et testez chaque fonctionnalité

---

## 📚 Documentation

- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Rapport complet
- [KEEP_ALIVE.md](./KEEP_ALIVE.md) - Configuration Keep-Alive
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement
- [TEST_CHECKLIST.md](./TEST_CHECKLIST.md) - Tests avant production
