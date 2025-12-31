# Plan: Nouvelle Feature "Tableau de Bord Invité"

> **Route:** `/infos`
> **Priorité:** P1
> **Hub central pour l'invité connecté**

## 1. Hébergement & Chambres (Thème League of Legends) 🏰

### 1.1 Modèle de Données

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

### 1.2 Noms des Chambres (Régions LoL)

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

## 2. Récapitulatif (Section Dashboard) 📋

### 2.1 Données Affichées

| Information               | Source                        | Format                               |
| ------------------------- | ----------------------------- | ------------------------------------ |
| Date du mariage           | Constante                     | "Samedi 18 Juillet 2026"             |
| Heure de début            | Constante                     | "14h00"                              |
| Lieu                      | Config/DB                     | "Domaine de la Grosse Tour, Vergèze" |
| Lien Maps                 | Généré                        | Google Maps / Waze deeplink          |
| Statut RSVP               | `guests.rsvp_status`          | Badge Présent/Absent/En attente      |
| Personnes accompagnantes  | `guests` managed_by           | Liste noms                           |
| Restrictions alimentaires | `guests.dietary_restrictions` | Texte                                |

### 2.2 Liens Deeplink Navigation

```typescript
// Génération des liens navigation
const VENUE_COORDS = { lat: 43.7459, lng: 4.2341 }; // À confirmer
const VENUE_NAME = 'Domaine de la Grosse Tour';

const wazeLink = `https://waze.com/ul?ll=${VENUE_COORDS.lat},${VENUE_COORDS.lng}&navigate=yes`;
const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${VENUE_COORDS.lat},${VENUE_COORDS.lng}&destination_place_id=PLACE_ID`;
const appleMapsLink = `maps://maps.apple.com/?daddr=${VENUE_COORDS.lat},${VENUE_COORDS.lng}`;
```

## 3. Guide Local (Infos Utiles) 🗺️

### 3.1 Structure de Données

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

## 4. Architecture Page Dashboard

```
/dashboard
├── +page.server.ts          # Load guest, room, site_content
├── +page.svelte             # Layout principal
├── components/
│   ├── RecapCard.svelte     # Résumé mariage + RSVP
│   ├── RoomCard.svelte      # Hébergement assigné
│   ├── LocalGuideSection.svelte
│   └── NavigationButtons.svelte
```
