# 🚀 Production Roadmap - Mariage V&M 2026 (Gold Master)

**Version:** 1.0.0
**Date:** 14 décembre 2025
**Objectif:** Préparer la mise en production finale (Gold Master) du projet
**Hébergement cible:** VPS Coolify

---

## Table des Matières

1. [AXE 1: Nouvelle Feature "Tableau de Bord Invité"](#axe-1-nouvelle-feature-tableau-de-bord-invité)
2. [AXE 2: Audit de Sécurité & Infrastructure](#axe-2-audit-de-sécurité--infrastructure-hardening)
3. [AXE 3: Review UI/UX & Responsive](#axe-3-review-uiux--responsive)
4. [AXE 4: To-Do de Finition](#axe-4-to-do-de-finition)
5. [Annexes](#annexes)

---

## AXE 1: Nouvelle Feature "Tableau de Bord Invité"

> **Route:** `/dashboard`
> **Priorité:** P1
> **Hub central pour l'invité connecté**

### 1.1 Hébergement & Chambres (Thème League of Legends) 🏰

#### 1.1.1 Modèle de Données

**Nouvelle table `rooms`:**

```sql
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL UNIQUE,           -- Ex: "Demacia", "Noxus", "Ionia"
  lol_region TEXT,                     -- Nom officiel LoL pour ref
  description TEXT,                    -- Description thématique
  capacity INT NOT NULL DEFAULT 2,     -- Nombre de personnes max
  price_per_night DECIMAL(10,2),       -- Prix/nuit (optionnel)
  building TEXT,                       -- Bâtiment/Lieu physique
  amenities JSONB DEFAULT '[]',        -- Ex: ["wifi", "salle_de_bain_privée"]
  image_url TEXT                       -- Image de la chambre ou illustration LoL
);

-- Index pour recherche rapide
CREATE INDEX idx_rooms_name ON public.rooms(name);
```

**Modification table `guests`:**

```sql
ALTER TABLE public.guests
  ADD COLUMN room_id UUID REFERENCES public.rooms(id),
  ADD COLUMN check_in_date DATE,
  ADD COLUMN check_out_date DATE,
  ADD COLUMN room_notes TEXT;          -- Notes spéciales (lit bébé, etc.)
```

**Policies RLS:**

```sql
-- Rooms: Lecture pour tous les authentifiés
CREATE POLICY "Authenticated can view rooms" ON public.rooms
  FOR SELECT TO authenticated USING (true);

-- Rooms: CRUD Admin seulement
CREATE POLICY "Admins can manage rooms" ON public.rooms
  FOR ALL USING (auth.uid() IN (SELECT auth_id FROM public.guests WHERE role = 'admin'));
```

#### 1.1.2 Noms des Chambres (Régions LoL)

| Nom Chambre      | Région LoL   | Thème/Ambiance         |
| ---------------- | ------------ | ---------------------- |
| **Demacia**      | Demacia      | Noble, lumineux, doré  |
| **Noxus**        | Noxus        | Puissant, rouge/noir   |
| **Ionia**        | Ionia        | Zen, nature, spirituel |
| **Piltover**     | Piltover     | Steampunk, inventif    |
| **Zaun**         | Zaun         | Industriel, néon       |
| **Freljord**     | Freljord     | Glacial, bleu, viking  |
| **Shurima**      | Shurima      | Désert, or, égyptien   |
| **Bilgewater**   | Bilgewater   | Pirate, maritime       |
| **Shadow Isles** | Shadow Isles | Mystérieux, gothique   |
| **Targon**       | Targon       | Céleste, montagne      |

#### 1.1.3 Tâches Techniques

| ID    | Tâche                                                   | Effort | Dépendances |
| ----- | ------------------------------------------------------- | ------ | ----------- |
| A1-01 | Créer migration SQL `rooms`                             | 1h     | -           |
| A1-02 | Créer migration SQL `guests.room_id`                    | 30min  | A1-01       |
| A1-03 | Mettre à jour types Supabase (`npx supabase gen types`) | 15min  | A1-02       |
| A1-04 | Créer page admin `/admin/rooms` (CRUD chambres)         | 3h     | A1-03       |
| A1-05 | Ajouter sélecteur chambre dans `/admin/guests`          | 2h     | A1-04       |
| A1-06 | Créer composant `RoomCard.svelte`                       | 1h     | A1-03       |
| A1-07 | Créer section "Votre Hébergement" dans dashboard        | 2h     | A1-06       |

---

### 1.2 Récapitulatif (Section Dashboard) 📋

#### 1.2.1 Données Affichées

| Information               | Source                        | Format                               |
| ------------------------- | ----------------------------- | ------------------------------------ |
| Date du mariage           | Constante                     | "Samedi 18 Juillet 2026"             |
| Heure de début            | Constante                     | "14h00"                              |
| Lieu                      | Config/DB                     | "Domaine de la Grosse Tour, Vergèze" |
| Lien Maps                 | Généré                        | Google Maps / Waze deeplink          |
| Statut RSVP               | `guests.rsvp_status`          | Badge Présent/Absent/En attente      |
| Personnes accompagnantes  | `guests` managed_by           | Liste noms                           |
| Restrictions alimentaires | `guests.dietary_restrictions` | Texte                                |

#### 1.2.2 Liens Deeplink Navigation

```typescript
// Génération des liens navigation
const VENUE_COORDS = { lat: 43.7459, lng: 4.2341 }; // À confirmer
const VENUE_NAME = 'Domaine de la Grosse Tour';

const wazeLink = `https://waze.com/ul?ll=${VENUE_COORDS.lat},${VENUE_COORDS.lng}&navigate=yes`;
const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${VENUE_COORDS.lat},${VENUE_COORDS.lng}&destination_place_id=PLACE_ID`;
const appleMapsLink = `maps://maps.apple.com/?daddr=${VENUE_COORDS.lat},${VENUE_COORDS.lng}`;
```

#### 1.2.3 Tâches Techniques

| ID    | Tâche                                                  | Effort | Dépendances |
| ----- | ------------------------------------------------------ | ------ | ----------- |
| A1-08 | Créer route `/dashboard/+page.svelte`                  | 30min  | -           |
| A1-09 | Créer `+page.server.ts` avec chargement données invité | 1h     | -           |
| A1-10 | Créer composant `RecapCard.svelte`                     | 2h     | A1-08       |
| A1-11 | Intégrer boutons navigation (Waze/Maps)                | 1h     | A1-10       |
| A1-12 | Ajouter lien Dashboard dans navigation principale      | 30min  | A1-08       |

---

### 1.3 Guide Local (Infos Utiles) 🗺️

#### 1.3.1 Structure de Données

**Option A: Table `site_content` (Recommandé)**

```sql
CREATE TABLE public.site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  key TEXT NOT NULL UNIQUE,            -- Ex: "local_guide"
  content JSONB NOT NULL,              -- Contenu structuré
  page TEXT                            -- Page associée (optionnel)
);

-- Trigger update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_content_updated
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Structure JSONB pour `local_guide`:**

```json
{
  "categories": [
    {
      "id": "visits",
      "title": "Lieux à Visiter",
      "icon": "MapPin",
      "items": [
        {
          "name": "Pont du Gard",
          "description": "Monument romain à 30min",
          "distance": "25km",
          "link": "https://...",
          "image": "/images/local/pont-du-gard.jpg"
        }
      ]
    },
    {
      "id": "services",
      "title": "Services",
      "icon": "Scissors",
      "items": [
        {
          "name": "Salon Élégance",
          "type": "Coiffeur",
          "phone": "04 66 XX XX XX",
          "address": "12 rue de la Paix, Nîmes"
        }
      ]
    },
    {
      "id": "transport",
      "title": "Taxis & Transport",
      "icon": "Car",
      "items": [
        {
          "name": "Taxi Vergèze",
          "phone": "06 XX XX XX XX",
          "available_24h": true
        }
      ]
    }
  ]
}
```

#### Option B: Fichier Config JSON (Alternative simple)

Créer `/src/lib/config/local-guide.json` - Plus simple mais nécessite redéploiement pour modifier.

#### 1.3.2 Tâches Techniques

| ID    | Tâche                                             | Effort | Dépendances |
| ----- | ------------------------------------------------- | ------ | ----------- |
| A1-13 | Créer migration `site_content`                    | 30min  | -           |
| A1-14 | Seed données initiales guide local                | 1h     | A1-13       |
| A1-15 | Créer composant `LocalGuideSection.svelte`        | 2h     | A1-13       |
| A1-16 | Créer page admin `/admin/content` (éditeur JSONB) | 4h     | A1-13       |
| A1-17 | Intégrer dans `/dashboard`                        | 1h     | A1-15       |

---

### 1.4 Architecture Page Dashboard

```text
/dashboard
├── +page.server.ts          # Load guest, room, site_content
├── +page.svelte             # Layout principal
├── components/
│   ├── RecapCard.svelte     # Résumé mariage + RSVP
│   ├── LocationCard.svelte  # Logistique & GPS (Waze/Maps)
│   ├── RoomCard.svelte      # Hébergement assigné
│   ├── SongRequestsCard.svelte
│   ├── WeatherDressCodeCard.svelte
│   ├── ContactsSosSection.svelte
│   ├── BrunchCard.svelte
│   ├── LocalGuideSection.svelte
│   └── NavigationButtons.svelte
```

---

## 1.5 Logistique & GPS (Action Cards) 🧭

**Objectif:** faciliter l'arrivée des invités.

**UI:** créer un composant `LocationCard` (Shadcn `Card`).

**Fonctionnalités:**

- Afficher l'adresse du lieu principal.
- Afficher 2 gros boutons d'action (Outline ou Secondary) + icônes:
  - "Ouvrir Waze" (deep link `https://waze.com/ul?ll=...&navigate=yes`)
  - "Ouvrir Google Maps" (`https://www.google.com/maps/dir/?api=1&destination=...`)

**Tâches techniques:**

| ID    | Tâche                                   | Effort | Dépendances |
| ----- | --------------------------------------- | ------ | ----------- |
| A1-18 | Créer composant `LocationCard.svelte`   | 1h     | -           |
| A1-19 | Intégrer `LocationCard` dans dashboard  | 30min  | A1-18       |

---

## 1.6 Hébergement (Gestion des Chambres) 🛏️

**Affichage conditionnel:** la section n'apparaît que si `guests.room_id` est présent.

**Base de données (delta):** la table `rooms` existe déjà.

**Ajout requis:** `rooms.access_code` (code porte) + affichage côté UI.

```sql
ALTER TABLE public.rooms
  ADD COLUMN access_code TEXT;
```

**Dashboard UI:** carte "Votre Chambre" (Shadcn `Card`).

- Nom de la chambre (clin d'œil LoL)
- Code d'accès (copiable au clic)
- Horaires (check-in / check-out)

**Admin:** conserver l'assignation chambre → invité dans `/admin/guests`.

**Tâches techniques:**

| ID    | Tâche                                              | Effort | Dépendances |
| ----- | -------------------------------------------------- | ------ | ----------- |
| A1-20 | Migration: ajouter `rooms.access_code`             | 30min  | -           |
| A1-21 | UI: afficher + copier `access_code` dans dashboard | 1h     | A1-20       |

---

## 1.7 Ambiance & Participation 🎶⛅️

### 1.7.1 DJ Collaboratif

**DB:** créer table `song_requests`.

```sql
CREATE TABLE public.song_requests (

  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  track_name TEXT NOT NULL,
  artist TEXT,
  requested_by UUID NOT NULL
);

ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

-- Lecture pour tous les authentifiés
CREATE POLICY "Authenticated can view song requests" ON public.song_requests
  FOR SELECT TO authenticated USING (true);

-- Insertion uniquement si requested_by == auth.uid()
CREATE POLICY "Authenticated can create own song request" ON public.song_requests
  FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());
```

**UI:**

- Form simple "Proposer une musique" (track + artist)
- Afficher les 3 dernières propositions

### 1.7.2 Météo & Dress Code

**API:** utiliser Open-Meteo (sans clé). Récupérer la prévision à J-3 quand la date est dans l'horizon de forecast, sinon afficher un état "Disponible à J-3".

**UI:** widget météo minimaliste (icône + température) + rappel dress code: "Chic & Vert".

**Tâches techniques:**

- A1-22 (1h): Migration: créer table `song_requests` + policies RLS
- A1-23 (2h): UI: formulaire + liste des 3 dernières (SSR + Form Actions)
- A1-24 (2h): API/SSR: fetch Open-Meteo + mapping icône/code
- A1-25 (1h): UI: widget météo + dress code

---

## 1.8 Contacts & SOS 📞

**Données:** via `site_content` (admin éditable), ex:

```json
{
  "contacts": [
    { "name": "Témoin 1", "role": "Témoin", "phone": "+336..." }
  ],
  "taxis": [
    { "name": "Taxi Vergèze", "phone": "+336..." }
  ]
}
```

**UI:** cartes Contacts d'urgence avec bouton "Appeler" (`tel:`) + section Taxis.

**Tâches techniques:**

- A1-26 (30min): Seed `site_content` keys: `contacts_sos`, `taxis`
- A1-27 (2h): UI: section Contacts & SOS (cards + tel links)

---

## 1.9 Lendemain & Brunch 🥐

**Données:** via `site_content` (admin éditable), ex:

```text
{
  "start_time": "11:00",
  "location": "Domaine de la Grosse Tour",
  "menu": "Café, jus, viennoiseries, brunch"
}
```

**UI:** bloc informatif (heure, menu sommaire, lieu si différent).

**Tâches techniques:**

| ID    | Tâche                                                | Effort | Dépendances |
| ----- | ---------------------------------------------------- | ------ | ----------- |
| A1-28 | Seed `site_content` key `brunch_info`                | 30min  | -           |
| A1-29 | UI: bloc Brunch dans dashboard                       | 1h     | A1-28       |

**Estimation totale AXE 1:** ~28-35h

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
| AXE 1     | Dashboard Invité | 20-25h     |
| AXE 2     | Sécurité & Infra | 15-18h     |
| AXE 3     | UI/UX Responsive | 15-18h     |
| AXE 4     | Finition         | 10-12h     |
| **TOTAL** |                  | **60-73h** |

### B. Ordre de Priorité Suggéré

1. **Sprint 1 (Semaine 1-2):** AXE 2 (Sécurité) - Bloquant production
2. **Sprint 2 (Semaine 2-3):** AXE 4 (Finition) - Quick wins
3. **Sprint 3 (Semaine 3-5):** AXE 1 (Dashboard) - Feature principale
4. **Sprint 4 (Semaine 5-6):** AXE 3 (UI/UX) - Polish final

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
