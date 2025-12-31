# 🚀 Production Roadmap - Mariage V&M 2026 (Gold Master)

**Version:** 1.0.0
**Date:** 14 décembre 2025
**Objectif:** Préparer la mise en production finale (Gold Master) du projet
**Hébergement cible:** VPS Coolify

---

## Table des Matières

1. [AXE 2: Audit de Sécurité & Infrastructure](#axe-2-audit-de-sécurité--infrastructure-hardening)
2. [AXE 3: Review UI/UX & Responsive](#axe-3-review-uiux--responsive)
3. [AXE 4: To-Do de Finition](#axe-4-to-do-de-finition)
4. [Annexes](#annexes)

---

## AXE 2: Audit de Sécurité & Infrastructure (Hardening)

> **Environnement cible:** VPS Coolify
> **Priorité:** P1 (Bloquant pour production)

### 2.1 Logs & Monitoring 📊

#### 2.1.1 Configuration Logging Structuré

**Créer `/src/lib/server/logger.ts`:**

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	context?: Record<string, unknown>;
	requestId?: string;
}

// Données sensibles à ne JAMAIS logger
const REDACTED_FIELDS = ['password', 'token', 'email', 'access_token', 'refresh_token'];

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
	const sanitized = { ...obj };
	for (const field of REDACTED_FIELDS) {
		if (field in sanitized) {
			sanitized[field] = '[REDACTED]';
		}
	}
	return sanitized;
}

export function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
	const entry: LogEntry = {
		timestamp: new Date().toISOString(),
		level,
		message,
		context: context ? sanitize(context) : undefined
	};

	// JSON pour Coolify
	console.log(JSON.stringify(entry));
}

export const logger = {
	debug: (msg: string, ctx?: Record<string, unknown>) => log('debug', msg, ctx),
	info: (msg: string, ctx?: Record<string, unknown>) => log('info', msg, ctx),
	warn: (msg: string, ctx?: Record<string, unknown>) => log('warn', msg, ctx),
	error: (msg: string, ctx?: Record<string, unknown>) => log('error', msg, ctx)
};
```

#### 2.1.2 Liste `console.log` à Remplacer

Fichiers identifiés avec `console.log/error` à migrer vers logger:

| Fichier                                    | Lignes                     | Action                            |
| ------------------------------------------ | -------------------------- | --------------------------------- |
| `src/routes/claim-profile/+page.server.ts` | 61, 62, 74                 | Remplacer par `logger.info/error` |
| `src/routes/gallery/upload-button.svelte`  | 52                         | Client-side, garder en dev only   |
| `src/routes/unlock/+page.server.ts`        | 12                         | `logger.error`                    |
| `src/routes/register/+page.server.ts`      | 37, 72, 100, 120           | `logger.error`                    |
| `src/routes/rsvp/+page.svelte`             | 121                        | Supprimer (debug)                 |
| `src/routes/rsvp/+page.server.ts`          | 130, 241, 307              | `logger.error`                    |
| `src/routes/login/+page.server.ts`         | 20, 42                     | `logger.error`                    |
| `src/routes/admin/guests/+page.server.ts`  | 18, 83, 118, 147, 159, 169 | `logger.error`                    |
| `src/routes/gallery/+page.server.ts`       | 38, 84, 110                | `logger.error`                    |

#### 2.1.3 Tâches Techniques

| ID    | Tâche                                          | Effort | Dépendances |
| ----- | ---------------------------------------------- | ------ | ----------- |
| A2-01 | Créer module `logger.ts`                       | 1h     | -           |
| A2-02 | Remplacer tous les `console.log/error` serveur | 2h     | A2-01       |
| A2-03 | Configurer variable env `LOG_LEVEL`            | 30min  | A2-01       |
| A2-04 | Documenter format logs pour Coolify            | 30min  | A2-02       |

---

### 2.2 OWASP & Headers de Sécurité 🔒

#### 2.2.1 Configuration Headers (via hooks.server.ts)

**Ajouter dans `hooks.server.ts`:**

```typescript
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Content Security Policy
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' https://apis.google.com",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob: https://*.supabase.co https://*.googleapis.com",
			"font-src 'self'",
			"connect-src 'self' https://*.supabase.co wss://*.supabase.co",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		].join('; ')
	);

	// Autres headers de sécurité
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	response.headers.set('X-XSS-Protection', '1; mode=block');

	// HSTS (activer seulement en production avec HTTPS)
	if (process.env.NODE_ENV === 'production') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	return response;
};

// Mettre à jour sequence
export const handle = sequence(securityHeaders, supabase, passwordWall, authGuard);
```

#### 2.2.2 Rate Limiting

**Créer `/src/lib/server/rate-limit.ts`:**

```typescript
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
	windowMs: number; // Fenêtre en ms
	maxAttempts: number; // Max tentatives
}

const CONFIGS: Record<string, RateLimitConfig> = {
	login: { windowMs: 15 * 60 * 1000, maxAttempts: 5 }, // 5 tentatives / 15min
	unlock: { windowMs: 5 * 60 * 1000, maxAttempts: 10 }, // 10 tentatives / 5min
	upload: { windowMs: 60 * 1000, maxAttempts: 20 } // 20 uploads / min
};

export function checkRateLimit(
	identifier: string,
	action: keyof typeof CONFIGS
): { allowed: boolean; retryAfter?: number } {
	const config = CONFIGS[action];
	const key = `${action}:${identifier}`;
	const now = Date.now();

	const entry = rateLimitMap.get(key);

	if (!entry || now > entry.resetTime) {
		rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs });
		return { allowed: true };
	}

	if (entry.count >= config.maxAttempts) {
		return {
			allowed: false,
			retryAfter: Math.ceil((entry.resetTime - now) / 1000)
		};
	}

	entry.count++;
	return { allowed: true };
}
```

**Intégration dans `/unlock/+page.server.ts`:**

```typescript
import { checkRateLimit } from '$lib/server/rate-limit';

export const actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const ip = getClientAddress();
		const { allowed, retryAfter } = checkRateLimit(ip, 'unlock');

		if (!allowed) {
			return fail(429, {
				error: `Trop de tentatives. Réessayez dans ${retryAfter}s.`
			});
		}

		// ... reste du code
	}
};
```

#### 2.2.3 CSRF Protection

SvelteKit intègre nativement la protection CSRF via:

- Validation `Origin` header automatique
- Form actions avec tokens implicites

**Vérifications à effectuer:**

- [ ] Toutes les mutations passent par Form Actions (✅ déjà en place)
- [ ] Aucun endpoint API sensible sans vérification session
- [ ] Cookies `SameSite=Lax` (✅ Supabase SSR le fait)

#### 2.2.4 Tâches Techniques

| ID    | Tâche                                 | Effort | Dépendances |
| ----- | ------------------------------------- | ------ | ----------- |
| A2-05 | Ajouter `securityHeaders` hook        | 1h     | -           |
| A2-06 | Créer module `rate-limit.ts`          | 1h     | -           |
| A2-07 | Intégrer rate-limit sur `/login`      | 30min  | A2-06       |
| A2-08 | Intégrer rate-limit sur `/unlock`     | 30min  | A2-06       |
| A2-09 | Audit CSRF (vérification manuelle)    | 1h     | -           |
| A2-10 | Test headers avec securityheaders.com | 30min  | A2-05       |

---

### 2.3 Stratégie de Sauvegarde 💾

#### 2.3.1 Architecture Backup

```text
┌─────────────────────────────────────────────────────────┐
│                    COOLIFY VPS                          │
│  ┌─────────────────┐    ┌─────────────────────────┐    │
│  │  Cron Job       │    │  backup-storage.sh      │    │
│  │  Daily 3:00 AM  │───▶│  - Sync Supabase bucket │    │
│  └─────────────────┘    │  - Upload to S3/GDrive  │    │
│                         └─────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  Stockage Externe             │
              │  - AWS S3 (recommandé)        │
              │  - Google Drive via rclone    │
              │  - Backblaze B2 (économique)  │
              └───────────────────────────────┘
```

#### 2.3.2 Script de Backup

**Créer `/scripts/backup-storage.sh`:**

```bash
#!/bin/bash
# Backup Supabase Storage to external storage

set -e

# Configuration
SUPABASE_URL="${SUPABASE_URL}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
BACKUP_DIR="/tmp/wedding-backup-$(date +%Y%m%d)"
S3_BUCKET="s3://wedding-vm-backups"
RETENTION_DAYS=90  # 3 mois post-mariage

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Download all photos from Supabase Storage
echo "[$(date)] Starting backup..."

# Using Supabase CLI or API
npx supabase storage download photos --project-ref "${SUPABASE_PROJECT_REF}" \
  --output "$BACKUP_DIR/photos"

# Compress
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .

# Upload to S3
aws s3 cp "$BACKUP_DIR.tar.gz" "$S3_BUCKET/$(date +%Y%m%d)-photos.tar.gz"

# Cleanup old backups (keep 90 days)
aws s3 ls "$S3_BUCKET/" | while read -r line; do
  createDate=$(echo "$line" | awk '{print $1}')
  fileName=$(echo "$line" | awk '{print $4}')
  if [[ $(find "$createDate" -mtime +$RETENTION_DAYS -print) ]]; then
    aws s3 rm "$S3_BUCKET/$fileName"
  fi
done

# Cleanup local
rm -rf "$BACKUP_DIR" "$BACKUP_DIR.tar.gz"

echo "[$(date)] Backup completed!"
```

#### 2.3.3 Configuration Coolify Cron

Dans Coolify, ajouter un service cron ou utiliser le scheduler intégré:

```yaml
# docker-compose.override.yml ou configuration Coolify
services:
  backup:
    image: node:20-alpine
    volumes:
      - ./scripts:/scripts
    environment:
      - SUPABASE_URL
      - SUPABASE_SERVICE_ROLE_KEY
      - AWS_ACCESS_KEY_ID
      - AWS_SECRET_ACCESS_KEY
    command: /scripts/backup-storage.sh
    # Via cron Coolify ou service dédié
```

#### 2.3.4 Tâches Techniques

| ID    | Tâche                               | Effort | Dépendances  |
| ----- | ----------------------------------- | ------ | ------------ |
| A2-11 | Créer script `backup-storage.sh`    | 2h     | -            |
| A2-12 | Configurer bucket S3/B2 externe     | 1h     | -            |
| A2-13 | Configurer cron job Coolify         | 1h     | A2-11, A2-12 |
| A2-14 | Tester restore manuel               | 1h     | A2-13        |
| A2-15 | Documenter procédure backup/restore | 1h     | A2-14        |

---

### 2.4 Désactivation "Bunker Mode" (Password Wall) 🔓

#### 2.4.1 Implémentation Toggle

**Modifier `.env`:**

```env
# Bunker Mode (Password Wall)
# - true = Site protégé par code d'accès (avant mariage)
# - false = Site public (jour J et après)
BUNKER_MODE=true
WEDDING_ACCESS_CODE=votre_code_secret
```

**Modifier `hooks.server.ts`:**

```typescript
import { BUNKER_MODE } from '$env/static/private';

const passwordWall: Handle = async ({ event, resolve }) => {
	// Skip si Bunker Mode désactivé
	if (BUNKER_MODE !== 'true') {
		return resolve(event);
	}

	// Exceptions : Pages accessibles sans mot de passe
	const publicPaths = ['/unlock', '/health', '/_app', '/favicon', '/robots.txt', '/manifest.json'];

	if (publicPaths.some((path) => event.url.pathname.startsWith(path))) {
		return resolve(event);
	}

	const hasPass = event.cookies.get('wedding_pass');

	if (!hasPass) {
		throw redirect(303, '/unlock');
	}

	return resolve(event);
};
```

#### 2.4.2 Tâches Techniques

| ID    | Tâche                                         | Effort | Dépendances |
| ----- | --------------------------------------------- | ------ | ----------- |
| A2-16 | Ajouter variable `BUNKER_MODE`                | 15min  | -           |
| A2-17 | Modifier `passwordWall` hook                  | 30min  | A2-16       |
| A2-18 | Documenter procédure activation/désactivation | 30min  | A2-17       |

**Estimation totale AXE 2:** ~15-18h

---

## AXE 3: Review UI/UX & Responsive

> **Priorité:** P2
> **Focus:** Mobile First, Accessibilité

### 3.1 Checklist Responsive Mobile 📱

#### 3.1.1 Pages à Tester

| Page                | iPhone | Android | Tablette | Points d'attention             |
| ------------------- | ------ | ------- | -------- | ------------------------------ |
| `/login`            | ⬜     | ⬜      | ⬜       | Bouton Google, Magic Link      |
| `/unlock`           | ⬜     | ⬜      | ⬜       | Input code, clavier numérique  |
| `/` (Accueil)       | ⬜     | ⬜      | ⬜       | Hero image, countdown          |
| `/rsvp`             | ⬜     | ⬜      | ⬜       | Formulaire complet, checkboxes |
| `/gallery`          | ⬜     | ⬜      | ⬜       | Grid photos, upload button     |
| `/gallery` (Upload) | ⬜     | ⬜      | ⬜       | Sélection fichier, preview     |
| `/programme`        | ⬜     | ⬜      | ⬜       | Timeline, scroll               |
| `/dashboard`        | ⬜     | ⬜      | ⬜       | (Nouvelle page)                |
| `/admin/*`          | ⬜     | ⬜      | ⬜       | Tableaux, modals               |

#### 3.1.2 Tests Spécifiques

- [ ] **Orientation:** Tester portrait ET paysage
- [ ] **Clavier virtuel:** Vérifier que les inputs ne sont pas masqués
- [ ] **Touch targets:** Boutons min 44x44px (WCAG)
- [ ] **Scroll:** Pas de scroll horizontal non voulu
- [x] **Admin tables:** wrapper `overflow-x-auto` + `min-w-*` (guests/rooms/song-requests)
- [ ] **Images:** Lazy loading, tailles adaptatives
- [ ] **Navigation:** Menu hamburger fonctionnel

### 3.2 Contraste & Lisibilité 👁️

#### 3.2.1 Audit Couleurs (Sage Green / White)

Palette actuelle (depuis `tailwind.config.js`):

| Combinaison                     | Ratio  | WCAG AA | WCAG AAA     |
| ------------------------------- | ------ | ------- | ------------ |
| `sage-600` (#556b2f) sur blanc  | ~4.9:1 | ✅      | ⚠️ (4.5 min) |
| `sage-500` (#55735e) sur blanc  | ~4.2:1 | ⚠️      | ❌           |
| `stone-500` (#78716c) sur blanc | ~4.5:1 | ✅      | ⚠️           |
| Blanc sur `sage-600`            | ~4.9:1 | ✅      | ⚠️           |

**Recommandations:**

- Utiliser `sage-700` ou `sage-800` pour textes importants
- Éviter `sage-400/500` pour texte sur fond clair
- Vérifier boutons primaires (texte blanc sur sage-600)

#### 3.2.2 Tâches Techniques

| ID    | Tâche                                   | Effort | Dépendances   |
| ----- | --------------------------------------- | ------ | ------------- |
| A3-01 | Audit contrast ratio (Lighthouse/axe)   | 1h     | -             |
| A3-02 | Corriger problèmes contraste identifiés | 2h     | A3-01         |
| A3-03 | Test responsive iPhone Safari           | 2h     | -             |
| A3-04 | Test responsive Android Chrome          | 2h     | -             |
| A3-05 | Test responsive iPad/Tablette           | 1h     | -             |
| A3-06 | Corriger bugs responsive identifiés     | 3h     | A3-03 à A3-05 |

### 3.3 États de Chargement & Feedback 🔄

#### 3.3.1 Inventaire Interactions

| Action       | Page            | État actuel   | Amélioration           |
| ------------ | --------------- | ------------- | ---------------------- |
| Submit RSVP  | `/rsvp`         | ✅ Loader     | -                      |
| Upload photo | `/gallery`      | ⬜ À vérifier | Progress bar           |
| Login Google | `/login`        | ⬜ À vérifier | Spinner sur bouton     |
| Magic Link   | `/login`        | ⬜ À vérifier | Message "Email envoyé" |
| Unlock       | `/unlock`       | ⬜ À vérifier | Feedback erreur/succès |
| Add guest    | `/admin/guests` | ⬜ À vérifier | Toast confirmation     |

#### 3.3.2 Pattern Standard

```svelte
<script>
	let isSubmitting = $state(false);
</script>

<button disabled={isSubmitting} class="relative">
	{#if isSubmitting}
		<Loader2 class="h-4 w-4 animate-spin" />
		<span class="ml-2">Chargement...</span>
	{:else}
		<span>Valider</span>
	{/if}
</button>
```

#### 3.3.3 Tâches Techniques

| ID    | Tâche                            | Effort | Dépendances |
| ----- | -------------------------------- | ------ | ----------- |
| A3-07 | Auditer tous les boutons submit  | 1h     | -           |
| A3-08 | Ajouter loaders manquants        | 2h     | A3-07       |
| A3-09 | Implémenter progress bar upload  | 1h     | -           |
| A3-10 | Vérifier tous les toast/feedback | 1h     | -           |

**Estimation totale AXE 3:** ~15-18h

---

## AXE 4: To-Do de Finition

> **Priorité:** P3
> **Nettoyage et optimisations avant Gold Master**

### 4.1 Nettoyage Code 🧹

#### 4.1.1 Console.log à Supprimer

Voir section 2.1.2 pour liste complète. Tous doivent être:

- Supprimés (debug inutiles)
- Convertis en `logger.x()` (erreurs/info pertinentes)

#### 4.1.2 Code Mort / Fichiers Inutilisés

| Fichier/Dossier         | Statut    | Action            |
| ----------------------- | --------- | ----------------- |
| `/src/routes/debug-db/` | Debug     | Supprimer en prod |
| Composants non utilisés | À auditer | `npx depcheck`    |
| Imports non utilisés    | À auditer | ESLint            |

#### 4.1.3 Tâches Techniques

| ID    | Tâche                                   | Effort | Dépendances |
| ----- | --------------------------------------- | ------ | ----------- |
| A4-01 | Supprimer tous console.log (voir A2-02) | -      | A2-02       |
| A4-02 | Supprimer `/debug-db` route             | 15min  | -           |
| A4-03 | Run `npm run lint` et fix               | 1h     | -           |
| A4-04 | Run `npm run check` (TypeScript)        | 1h     | -           |
| A4-05 | Audit dépendances inutilisées           | 30min  | -           |

### 4.2 Optimisation Assets 🖼️

#### 4.2.1 Images Static

| Image       | Chemin                                | Taille actuelle | Action            |
| ----------- | ------------------------------------- | --------------- | ----------------- |
| Hero couple | `$lib/assets/photo_couple_saumur.jpg` | À vérifier      | WebP + srcset     |
| Favicon     | `/static/favicon.ico`                 | -               | Vérifier présence |
| OG Image    | -                                     | Manquant ?      | Créer pour SEO    |

#### 4.2.2 Optimisations

```svelte
<!-- Pattern image optimisée -->
<picture>
	<source srcset="/images/hero.webp" type="image/webp" />
	<source srcset="/images/hero.jpg" type="image/jpeg" />
	<img
		src="/images/hero.jpg"
		alt="Vincent & Mélanie"
		loading="lazy"
		decoding="async"
		width="1920"
		height="1080"
	/>
</picture>
```

#### 4.2.3 Tâches Techniques

| ID    | Tâche                              | Effort | Dépendances  |
| ----- | ---------------------------------- | ------ | ------------ |
| A4-06 | Convertir images static en WebP    | 1h     | -            |
| A4-07 | Implémenter lazy loading images    | 1h     | -            |
| A4-08 | Créer OG image pour partage social | 30min  | -            |
| A4-09 | Vérifier/créer favicon complet     | 30min  | -            |
| A4-10 | Audit Lighthouse Performance       | 1h     | A4-06, A4-07 |

### 4.3 SEO & Meta Tags 🔍

```svelte
<!-- /src/app.html ou +layout.svelte -->
<svelte:head>
	<title>Mariage Vincent & Mélanie - 18 Juillet 2026</title>
	<meta
		name="description"
		content="Le site officiel du mariage de Vincent et Mélanie. Confirmez votre présence et partagez vos photos."
	/>
	<meta property="og:title" content="Mariage V&M 2026" />
	<meta property="og:description" content="Rejoignez-nous pour célébrer notre union !" />
	<meta property="og:image" content="/og-image.jpg" />
	<meta property="og:type" content="website" />
	<meta name="robots" content="noindex, nofollow" />
	<!-- Site privé -->
</svelte:head>
```

#### 4.3.1 Tâches Techniques

| ID    | Tâche                         | Effort | Dépendances |
| ----- | ----------------------------- | ------ | ----------- |
| A4-11 | Ajouter meta tags SEO         | 30min  | A4-08       |
| A4-12 | Vérifier robots.txt (noindex) | 15min  | -           |

### 4.4 Documentation Finale 📖

| ID    | Tâche                                | Effort | Dépendances |
| ----- | ------------------------------------ | ------ | ----------- |
| A4-13 | Mettre à jour README.md              | 1h     | -           |
| A4-14 | Documenter variables d'environnement | 30min  | -           |
| A4-15 | Créer DEPLOYMENT.md pour Coolify     | 1h     | -           |
| A4-16 | Archiver ce roadmap comme référence  | 15min  | Tout        |

**Estimation totale AXE 4:** ~10-12h

---

## Annexes

### A. Récapitulatif des Estimations

| Axe       | Description      | Estimation |
| --------- | ---------------- | ---------- |
| AXE 2     | Sécurité & Infra | 15-18h     |
| AXE 3     | UI/UX Responsive | 15-18h     |
| AXE 4     | Finition         | 10-12h     |
| **TOTAL** |                  | **40-48h** |

### B. Ordre de Priorité Suggéré

1. **Sprint 1 (Semaine 1-2):** AXE 2 (Sécurité) - Bloquant production
2. **Sprint 2 (Semaine 2-3):** AXE 4 (Finition) - Quick wins
3. **Sprint 3 (Semaine 3-4):** AXE 3 (UI/UX) - Polish final

### C. Migrations SQL Requises

```sql
-- Migration 1: rooms
-- Migration 2: guests.room_id
-- Migration 3: site_content
-- Ordre important!
```

### D. Variables d'Environnement Nouvelles

```env
# Existantes
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
WEDDING_ACCESS_CODE=

# Nouvelles (AXE 2)
BUNKER_MODE=true
LOG_LEVEL=info

# Backup (optionnel)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BACKUP_BUCKET=
```

### E. Checklist Pré-Production

- [ ] Toutes les tâches AXE 2 (Sécurité) complétées
- [ ] Tests manuels sur mobile effectués
- [ ] Backup automatique configuré et testé
- [ ] Variables d'environnement production configurées
- [ ] DNS configuré
- [ ] SSL/HTTPS actif
- [ ] Monitoring/Alerting configuré
- [ ] Procédure rollback documentée

---

**Document généré le:** 14 décembre 2025
**Auteur:** GitHub Copilot
**Statut:** Draft - À valider par l'équipe
