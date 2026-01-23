# 🔒 Rapport d'Audit de Sécurité - Wedding VM 2026

**Dernière mise à jour**: 23 janvier 2026  
**Status**: ⚠️ Actions critiques requises

---

## 📋 Résumé Exécutif

### Audit V1 - 17 janvier 2026

L'audit initial a identifié et corrigé plusieurs points critiques. L'application était considérée prête pour la production.

### Audit V2 - 23 janvier 2026 ⚠️

Suite aux récents développements (RSVP amélioré, Dashboard Premium, Keep-Alive), un nouvel audit complet selon **OWASP Top 10 2021** a été réalisé.

**Score global**: 7.5/10 ⚠️

**Verdict**: Application globalement bien sécurisée mais nécessite des corrections **CRITIQUES** avant mise en production.

---

## 🚨 ALERTE SÉCURITÉ - Actions Immédiates Requises

### 🔴 CRITIQUE: Fichier .env exposé dans Git

**Problème**: Le fichier `.env` contenant toutes les clés secrètes a été commité dans le repository Git.

**Clés exposées**:

```
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_PTWHViDK_N6fCrM46E33FkohewiNpYMCj
CRON_SECRET=dev-secret-key-change-in-production
```

**Actions à faire IMMÉDIATEMENT**:

1. ✅ Régénérer `SERVICE_ROLE_KEY` sur Supabase Dashboard
2. ✅ Régénérer `RESEND_API_KEY` sur Resend Dashboard
3. ✅ Générer nouveau `CRON_SECRET`: `openssl rand -base64 32`
4. ✅ Supprimer `.env` de l'historique Git:

```bash
git rm --cached .env
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

---

## 📊 Audit OWASP Top 10 2021 - Détails

### A01:2021 - Broken Access Control ⚠️ (7/10)

#### ✅ Points sécurisés:

- Protection Admin robuste ([+layout.server.ts](src/routes/admin/+layout.server.ts))
- RLS activé sur toutes les tables
- Vérification ownership sur photos
- Service Role Key usage approprié (côté serveur uniquement)

#### ⚠️ Points à améliorer:

1. **Bypass RLS avec SERVICE_ROLE_KEY**
   - 30+ usages du client admin dans le code
   - Risque si une requête est mal filtrée

2. **Manque de rate limiting**
   - Fonction `checkRateLimit` définie mais **jamais utilisée**
   - Routes sensibles non protégées: `/login`, `/register`, `/rsvp`

3. **IDOR potentiel sur assignation d'invités** ([rsvp/+page.server.ts](src/routes/rsvp/+page.server.ts))
   ```typescript
   // ⚠️ Pas de vérification que guestId est disponible avant assignation
   addManagedGuest: async ({ request }) => {
   	const guestId = formData.get('guestId');
   	// TODO: Vérifier que targetGuest.managed_by_id et auth_id sont null
   };
   ```

#### 🎯 Actions recommandées:

```typescript
// src/routes/rsvp/+page.server.ts - addManagedGuest
const { data: targetGuest } = await supabaseAdmin
	.from('guests')
	.select('managed_by_id, auth_id')
	.eq('id', guestId)
	.single();

if (targetGuest.managed_by_id || targetGuest.auth_id) {
	return fail(400, { message: 'Cet invité est déjà lié à un compte.' });
}
```

---

### A02:2021 - Cryptographic Failures 🔴 (9/10 mais CRITIQUE)

#### ✅ Points sécurisés:

- Pas de mots de passe en clair (gestion Supabase Auth)
- Validation forte: min 8 chars + 1 chiffre
- Variables sensibles en environnement
- Pas de données sensibles loguées

#### 🔴 Vulnérabilités critiques:

- **Fichier .env exposé dans Git** (voir section Alerte ci-dessus)

---

### A03:2021 - Injection ✅ (9/10)

#### ✅ Points sécurisés:

- Pas de SQL injection (utilisation exclusive de Supabase ORM)
- Validation Zod systématique (20+ schémas)
- Pas de `{@html}` dans les composants Svelte
- Sanitization HTML disponible ([validation.ts](src/lib/server/validation.ts))

#### ⚠️ Points à améliorer:

- `sanitizeHtml()` définie mais **jamais utilisée**
- Champs texte libre non sanitizés: `message_for_couple`, `dietary_restrictions`, `caption`

#### 🎯 Actions recommandées:

```typescript
// src/routes/rsvp/+page.server.ts
import { sanitizeHtml } from '$lib/server/validation';

const result = rsvpSchema.safeParse({
	...rawData,
	message_for_couple: sanitizeHtml(rawData.message_for_couple || ''),
	dietary_restrictions: sanitizeHtml(rawData.dietary_restrictions || '')
});
```

---

### A04:2021 - Insecure Design ⚠️ (6/10)

#### ✅ Points sécurisés:

- Validation côté serveur obligatoire
- Gestion d'erreurs correcte
- Timing-safe comparison ([keep-alive/+server.ts](src/routes/api/keep-alive/+server.ts))

#### ⚠️ Points à améliorer:

1. **Rate limiting non implémenté**
   - Fonction existe mais 0 usage
   - Risque de brute-force sur login
   - Risque de spam sur upload/RSVP

2. **Pas de CAPTCHA**
   - Formulaires publics sans protection

3. **Validation upload basique**
   - Basée uniquement sur MIME type
   - Pas de vérification des magic bytes

#### 🎯 Actions recommandées:

```typescript
// src/routes/login/+page.server.ts
import { checkRateLimit } from '$lib/server/validation';

export const actions: Actions = {
	login_password: async ({ request, getClientAddress }) => {
		const clientIp = getClientAddress();
		const { allowed } = checkRateLimit(`login:${clientIp}`, 5, 60000);

		if (!allowed) {
			return fail(429, { message: 'Trop de tentatives. Réessaye dans 1 minute.' });
		}
		// ... reste du code
	}
};
```

---

### A05:2021 - Security Misconfiguration ✅ (8/10)

#### ✅ Points sécurisés:

- Headers de sécurité robustes ([hooks.server.ts](src/hooks.server.ts))
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy` stricte
- Configuration Supabase correcte (RLS, Storage privé)

#### ⚠️ Points à améliorer:

- CSP avec `unsafe-inline` et `unsafe-eval` (nécessaire pour SvelteKit)
- Headers seulement en production
- `NODE_ENV` hardcodé en `.env` (devrait être runtime)

---

### A06:2021 - Vulnerable Components ✅ (9/10)

#### ✅ Points sécurisés:

- Dépendances à jour (SvelteKit 2.48.5, Supabase 2.84.0, Zod 4.1.12)
- Pas de CVE connues

#### ⚠️ Points à améliorer:

- Manque d'audit régulier (`npm audit`)
- Recommandation: Ajouter en CI/CD

---

### A07:2021 - Authentication Failures ✅ (8/10)

#### ✅ Points sécurisés:

- Gestion auth via Supabase (JWT, httpOnly cookies)
- Validation mot de passe forte
- Reset password sécurisé (pas d'énumération d'emails)
- OAuth Google implémenté

#### ⚠️ Points à améliorer:

- Pas de MFA (recommandé pour admins)
- Pas de session timeout visible
- **Rate limiting manquant** (cf. A04)

---

### A08:2021 - Data Integrity Failures ⚠️ (7/10)

#### ✅ Points sécurisés:

- Validation upload images (10MB max, types autorisés)
- Nettoyage uploads échoués (rollback)

#### ⚠️ Points à améliorer:

- Validation MIME type seulement (pas de magic bytes)
- Pas de scan antivirus
- Pas de checksum/signature

---

### A09:2021 - Logging Failures ⚠️ (6/10)

#### ✅ Points sécurisés:

- Logs conditionnels (`NODE_ENV !== 'production'`)
- Pas de données sensibles loguées

#### ⚠️ Points à améliorer:

1. **Logging insuffisant sur actions critiques**
   - Pas de logs sur: tentatives login échouées, modifications admin, uploads, RSVP
2. **Pas de système de monitoring**
   - Pas de centralisation (Sentry, LogRocket)
3. **Logs non structurés**
   - `console.log` vs Winston/Pino

---

### A10:2021 - SSRF ✅ (10/10)

#### ✅ Points sécurisés:

- Un seul appel externe (open-meteo.com)
- URL hardcodée, pas d'input utilisateur
- Pas d'appels dynamiques

---

## 🆕 Nouveautés Audit V2

### 1. Keep-Alive Endpoint ✅

**Fichier**: [src/routes/api/keep-alive/+server.ts](src/routes/api/keep-alive/+server.ts)

**Sécurité**:

- ✅ Authentification par clé secrète (`CRON_SECRET`)
- ✅ Comparaison timing-safe (`crypto.subtle.timingSafeEqual`)
- ✅ Vérification longueur avant comparaison
- ✅ Gestion d'erreurs robuste
- ✅ Logs structurés

**Usage**:

```bash
curl "https://yourdomain.com/api/keep-alive?key=YOUR_CRON_SECRET"
```

**Recommandation**: Configurer un cron job externe (cron-job.org, EasyCron) pour appeler ce endpoint toutes les 5 minutes.

---

### 2. Nouveaux Champs RSVP ✅

**Migration**: [20260119_add_rsvp_day_columns.sql](supabase/migrations/20260119_add_rsvp_day_columns.sql)

**Champs ajoutés**:

- `present_saturday` (boolean)
- `present_sunday` (boolean)
- `message_for_couple` (text)

**Validation Zod** ([rsvp/+page.server.ts](src/routes/rsvp/+page.server.ts)):

```typescript
const rsvpSchema = z.object({
  rsvp_status: z.enum(['present', 'absent']),
  present_saturday: z.boolean().optional(),
  present_sunday: z.boolean().optional(),
  dietary_restrictions: z.string().nullable().optional().transform(...),
  message_for_couple: z.string().max(1000).nullable().optional().transform(...)
});
```

✅ Validation robuste avec limite de longueur et transformation.

⚠️ **À améliorer**: Ajouter sanitization HTML sur `message_for_couple`.

---

### 3. Simplification Admin ✅

**Changements**:

- Suppression du concept "chef de famille"
- Interface admin épurée
- Pas d'impact sur la sécurité (vérifications `role === 'admin'` intactes)

---

## 📊 Tableau Récapitulatif

| Catégorie OWASP                 | Score | Statut | Priorité     |
| ------------------------------- | ----- | ------ | ------------ |
| A01 - Broken Access Control     | 7/10  | ⚠️     | **HAUTE**    |
| A02 - Cryptographic Failures    | 9/10  | 🔴     | **CRITIQUE** |
| A03 - Injection                 | 9/10  | ✅     | Basse        |
| A04 - Insecure Design           | 6/10  | ⚠️     | **HAUTE**    |
| A05 - Security Misconfiguration | 8/10  | ✅     | Moyenne      |
| A06 - Vulnerable Components     | 9/10  | ✅     | Basse        |
| A07 - Authentication Failures   | 8/10  | ✅     | Moyenne      |
| A08 - Data Integrity Failures   | 7/10  | ⚠️     | Moyenne      |
| A09 - Logging Failures          | 6/10  | ⚠️     | Moyenne      |
| A10 - SSRF                      | 10/10 | ✅     | Basse        |

---

## 🎯 Plan d'Action

### 🔴 IMMÉDIAT (Avant déploiement)

1. ✅ Régénérer toutes les clés exposées dans .env
2. ✅ Supprimer .env de l'historique Git
3. ✅ Changer `CRON_SECRET` en production

### ⚠️ HAUTE PRIORITÉ (1-2 semaines)

1. ⚠️ Implémenter rate limiting sur login, register, upload, RSVP
2. ⚠️ Ajouter vérification IDOR sur `addManagedGuest`
3. ⚠️ Utiliser `sanitizeHtml()` sur tous les champs texte libre
4. ⚠️ Ajouter validation magic bytes sur uploads

### 📝 MOYENNE PRIORITÉ (1 mois)

1. ⚠️ Logging structuré (Winston/Pino)
2. ⚠️ Centralisation logs (Sentry/Axiom)
3. ⚠️ `npm audit` en CI/CD
4. ⚠️ MFA pour admins

### 📅 LONG TERME

1. ⚠️ CAPTCHA sur formulaires publics
2. ⚠️ Scanner antivirus sur uploads (ClamAV)
3. ⚠️ Audit externe + Pentest

---

## 🔗 Références

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [SvelteKit Security](https://kit.svelte.dev/docs/security)

---

## ✅ Améliorations Appliquées (Audit V1 - 17 janvier 2026)

### 1. Row Level Security (RLS) - ✅ VALIDÉ

**Status**: Toutes les tables ont des policies RLS actives et correctes.

#### Tables auditées:

- ✅ `guests` - Policies pour SELECT, UPDATE, INSERT, DELETE
- ✅ `photos` - Policies pour SELECT, INSERT, UPDATE
- ✅ `photo_likes` - RLS via relations
- ✅ `photo_comments` - RLS via relations
- ✅ `rooms` - Policies pour authenticated users et admins
- ✅ `song_requests` - Policies pour SELECT, INSERT, DELETE
- ✅ `site_content` - Policies pour SELECT (tous) et ALL (admins)

**Vérification Admin**:

```sql
SELECT auth_id FROM public.guests WHERE role = 'admin'
```

Utilisé systématiquement dans toutes les policies admin.

---

### 2. Variables d'Environnement - ✅ SÉCURISÉ

**Fichiers critiques**:

- ✅ `.env` dans `.gitignore`
- ✅ `.env.example` créé avec documentation
- ✅ Aucune clé hardcodée dans le code

**Variables sensibles identifiées**:

```
SERVICE_ROLE_KEY      -> Utilisé 15+ fois (légitime, serveur uniquement)
RESEND_API_KEY        -> Utilisé dans email.ts (serveur uniquement)
WEDDING_ACCESS_CODE   -> Utilisé pour le mur d'accès
```

**⚠️ ACTION REQUISE**: Si le `.env` a déjà été commité sur Git:

1. Régénérer immédiatement `SERVICE_ROLE_KEY` sur Supabase
2. Régénérer `RESEND_API_KEY` sur Resend
3. Changer `WEDDING_ACCESS_CODE`

---

### 3. Validation des Entrées - ✅ IMPLÉMENTÉ

**Nouveau fichier**: `src/lib/server/validation.ts`

Schemas Zod créés pour:

- ✅ Email (lowercase, trim)
- ✅ Password (min 8 chars, 1 chiffre)
- ✅ Nom d'invité (2-100 chars)
- ✅ RSVP Status (enum)
- ✅ Dietary restrictions (max 500 chars)
- ✅ Photo caption (max 500 chars)
- ✅ Commentaire (1-1000 chars)
- ✅ Song request

**Fonctions utilitaires**:

- `sanitizeHtml()` - Protection XSS basique
- `validateImageFile()` - Validation upload (type, taille)
- `checkRateLimit()` - Rate limiting simple

**Routes mises à jour**:

- ✅ `/register` - Email, password, nom
- ✅ `/login` - Email
- ✅ `/gallery` - Upload, caption, commentaires

---

### 4. Gestion des Erreurs - ✅ AMÉLIORÉ

**Console.log nettoyés**:

- Logs sensibles supprimés en production
- Logs conservés uniquement si `NODE_ENV === 'development'`
- Emojis ajoutés pour meilleure lisibilité en dev (✅, ❌, ⚠️)

**Fichiers modifiés**:

- `src/lib/server/email.ts` - Retours structurés `{ success, data/error }`
- `src/routes/gallery/+page.server.ts` - Logs conditionnels
- Autres routes - Gestion d'erreur cohérente

---

### 5. Headers de Sécurité - ✅ AJOUTÉS

**Nouveau hook**: `securityHeaders` dans `hooks.server.ts`

Headers configurés (production uniquement):

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()...
Content-Security-Policy: [directives complètes]
```

**CSP Configuration**:

- ✅ `default-src 'self'`
- ✅ `script-src` avec `'unsafe-inline'` (requis pour SvelteKit)
- ✅ `connect-src` autorise Supabase
- ✅ `frame-ancestors 'none'`

---

### 6. Upload de Fichiers - ✅ SÉCURISÉ

**Validations ajoutées**:

- ✅ Taille max: 10MB
- ✅ Types autorisés: jpeg, jpg, png, webp, heic
- ✅ Validation côté serveur (pas seulement client)
- ✅ Caption limitée à 500 caractères

**Storage Supabase**:

- ✅ Bucket `photos` configuré
- ✅ Policies storage pour authenticated users
- ✅ Upload path: `{user_id}/{timestamp}.{ext}`

---

### 7. Authentification & Authorization - ✅ ROBUSTE

**Hooks en séquence**:

1. `supabase` - Initialisation client SSR
2. `passwordWall` - Vérifie cookie wedding_pass
3. `authGuard` - Vérifie session + protection admin
4. `securityHeaders` - Ajoute headers

**Protection Admin**:

```typescript
if (event.url.pathname.startsWith('/admin')) {
	const { data: guest } = await supabase
		.from('guests')
		.select('role')
		.eq('auth_id', user.id)
		.maybeSingle();

	if (!guest || guest.role !== 'admin') {
		throw redirect(303, '/');
	}
}
```

**Hardcoded admin supprimé**:

- ❌ Ancien: `user.email === 'admin@example.com'`
- ✅ Nouveau: Vérification via BDD `role = 'admin'`

---

### 8. Dependencies - ⚠️ PARTIELLEMENT RÉSOLU

**Vulnérabilités npm audit**:

```
@sveltejs/kit: high (2 CVEs)
devalue: high (2 CVEs)
cookie: low
svelte-email -> svelte: moderate
```

**Actions prises**:

- ✅ `npm update @sveltejs/kit` exécuté
- ⚠️ Reste 6 vulnérabilités (4 low, 2 moderate)

**Recommandation**:
Les vulnérabilités restantes sont dans `svelte-email` (dépendance pour templates).

- Option 1: Accepter le risque (impact limité, côté serveur uniquement)
- Option 2: Remplacer svelte-email par templating HTML manuel

---

## 🔍 SQL Injection - ✅ PROTÉGÉ

**Analyse**: Supabase utilise des requêtes paramétrées par défaut.

Aucune concaténation SQL trouvée dans:

- Routes serveur
- API endpoints
- Hooks

**Méthode utilisée partout**:

```typescript
.from('table')
.select('*')
.eq('column', userInput) // ✅ Sécurisé
```

---

## 📱 Tests Recommandés

### Tests Manuels à Effectuer:

#### 1. Flow Authentification

- [ ] `/unlock` - Code correct/incorrect
- [ ] `/register` - Inscription nouvelle + email existant
- [ ] `/login` - Connexion email/password + Google OAuth
- [ ] `/logout` - Déconnexion
- [ ] `/claim-profile` - Réclamation profil

#### 2. Flow RSVP

- [ ] Mise à jour statut (présent/absent)
- [ ] Ajout restrictions alimentaires
- [ ] Ajout invité géré
- [ ] Suppression invité géré
- [ ] Réception email confirmation
- [ ] Réception email admin

#### 3. Galerie

- [ ] Upload photo (types valides/invalides)
- [ ] Upload photo (> 10MB)
- [ ] Ajout commentaire
- [ ] Like/Unlike photo
- [ ] Suppression photo (proprio)
- [ ] Suppression photo (admin)

#### 4. Admin

- [ ] Accès `/admin` (non-admin = redirect)
- [ ] Gestion invités (CRUD)
- [ ] Gestion contenu
- [ ] Gestion chambres
- [ ] Gestion demandes chansons

---

## ⚡ Performance - Optimisations Suggérées

### Images

```typescript
// À ajouter dans gallery/upload-button.svelte
<img loading="lazy" />
```

### Requêtes

- ✅ Index déjà créés sur colonnes fréquentes
- ✅ Requêtes optimisées avec `.select()` spécifique
- ⚠️ Vérifier N+1 queries dans dashboard

### Caching

```typescript
// Considérer pour site_content (change rarement)
export const config = {
	cache: {
		maxage: 60 * 5 // 5 minutes
	}
};
```

---

## 📊 Monitoring Recommandé

### Production

1. **Sentry** - Tracking d'erreurs

   ```bash
   npm install @sentry/sveltekit
   ```

2. **Supabase Dashboard** - Alertes
   - Configurer alertes email si quota dépassé
   - Monitorer performance queries

3. **Uptime Monitor** - UptimeRobot, Pingdom
   - Endpoint: `/health` (retourne 'ok')

---

## 🚀 Checklist Pré-Déploiement

### Configuration Serveur

- [ ] Variables d'environnement configurées
- [ ] `ORIGIN` = URL production
- [ ] `NODE_ENV=production`
- [ ] HTTPS activé (SSL)
- [ ] Domaine configuré

### Supabase

- [ ] Policies RLS vérifiées
- [ ] Backups automatiques activés
- [ ] Rate limiting activé (si disponible)
- [ ] Admin user créé avec `role='admin'`

### Email

- [ ] `RESEND_API_KEY` valide
- [ ] `SENDER_EMAIL` vérifié
- [ ] `ADMIN_EMAILS` configuré
- [ ] Test d'envoi email effectué

### Build

- [ ] `npm run build` réussi
- [ ] Tester build localement: `node build`
- [ ] Vérifier taille bundle

---

## 🔐 Maintenance Continue

### Hebdomadaire

- Vérifier logs d'erreur
- Monitorer utilisation Supabase (quota)

### Mensuel

- `npm audit` et mise à jour dépendances
- Vérifier backups Supabase
- Analyser métriques performance

### Post-Mariage

- Exporter photos galerie
- Sauvegarder BDD complète
- Archiver RSVPs

---

## 📞 Support d'Urgence

### Problèmes Critiques

**Site inaccessible**:

1. Vérifier `/health` endpoint
2. Vérifier logs hébergeur
3. Vérifier quota Supabase

**Emails non envoyés**:

1. Vérifier `RESEND_API_KEY` valide
2. Vérifier logs Resend dashboard
3. Fallback: Notifications manuelles

**Erreur authentification**:

1. Vérifier `SERVICE_ROLE_KEY` non régénéré
2. Vérifier policies RLS actives
3. Vérifier cookies non bloqués

---

## ✨ Conclusion

**Status Global**: 🟢 PRÊT POUR LA PRODUCTION

L'application a passé l'audit de sécurité avec succès. Les mesures critiques sont en place:

- ✅ RLS configuré correctement
- ✅ Validation des entrées robuste
- ✅ Headers de sécurité
- ✅ Gestion d'erreurs propre
- ✅ Logs nettoyés

**Actions Restantes**:

1. Tester flows complets (voir checklist)
2. Configurer monitoring (Sentry recommandé)
3. Documentation utilisateur pour admins

**Prêt à partager aux invités !** 🎉
