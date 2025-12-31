# Spec: Dashboard Invité Premium (/dashboard)

**Date:** 2025-12-30  
**Branche:** 008-dashboard-invite-premium  
**Scope:** Mettre à jour la documentation + plan d’implémentation pour enrichir la page **Dashboard Invité** (`/dashboard`) avec 5 nouvelles sections (Logistique & GPS, Hébergement, Ambiance & Participation, Contacts & SOS, Lendemain & Brunch).

## 1) Contexte & Objectifs

Le projet est une app SvelteKit (TypeScript) avec Supabase (Auth + DB + Storage) et une UI Tailwind/Shadcn. La page `/dashboard` existe déjà et agit comme “hub” pour l’invité connecté.

**Objectif:** définir et planifier des évolutions fonctionnelles + techniques du Dashboard Invité, en restant:

- Mobile-first
- UX “Premium” (clair, lisible)
- Charte “Vert Sauge & Crème”
- SSR-first / JS minimal
- Mutations via Form Actions SvelteKit
- Typage strict basé sur types Supabase


## 2) Non-Objectifs

- Pas de nouvelles pages non demandées (pas de nouvelle navigation complexe).
- Pas d’animations “nice-to-have” hors composants existants.
- Pas d’intégration de services payants (Open-Meteo uniquement pour météo).

## 3) UX & Design

- Chaque section est compartimentée dans des composants `Card` (Shadcn-Svelte).
- Layout mobile-first : sections en colonne, spacing généreux, CTA clairs.
- Tonalité “Premium”: titres hiérarchisés, labels concis, icônes lucide-svelte.

## 4) Fonctionnel: Nouvelles Sections du Dashboard

### 4.1 Section « Logistique & GPS » (Action Cards)

**But:** faciliter l’arrivée.

**UI:** composant `LocationCard`.

**Contenu minimal:**

- Nom du lieu principal + adresse.

**Actions:** deux gros boutons `Outline` ou `Secondary` avec icônes:

- « Ouvrir Waze » : `https://waze.com/ul?ll=LAT,LNG&navigate=yes`
- « Ouvrir Google Maps » : `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`

**Données:** coordonnées et adresse définies côté serveur (constantes) OU via `site_content` (décision à figer au plan).

### 4.2 Section « Hébergement » (Gestion des Chambres)

**Affichage conditionnel:** seulement si l’invité a une chambre assignée (`guests.room_id != null`).

**Base de données (cible):**

- Table `rooms`:
  - `id` (uuid)
  - `name` (text, ex: “Suite Demacia”)
  - `capacity` (int)
  - `access_code` (text, code porte)
  - `description` (text)
- Table `guests`: colonne `room_id` (FK).

**Admin:** interface d’assignation d’une chambre à un invité (dans l’admin existant `/admin/guests`).

**Dashboard UI:** carte “Votre Chambre”:

- Nom
- Code d’accès (copiable au clic)
- Horaires (check-in / check-out)

### 4.3 Section « Ambiance & Participation »

#### 4.3.1 DJ collaboratif

**DB:** table `song_requests`:

- `id` (uuid)
- `created_at` (timestamptz)
- `track_name` (text)
- `artist` (text)
- `requested_by` (uuid/text selon convention existante: auth uid)

**UI:**

- Form “Proposer une musique” (track + artist)
- Liste des 3 dernières propositions (tri `created_at desc`, limit 3)

**Règles:**

- Tout invité authentifié peut proposer.
- Pas de suppression côté invité.

#### 4.3.2 Météo & Dress code

**API:** Open-Meteo (gratuit, sans clé).

- Récupérer une prévision à J-3 sur le lieu.

**UI:**

- Widget minimaliste (icône + température)
- Rappel dress code: “Chic & Vert”

### 4.4 Section « Contacts & SOS »

**Contenu:**

- Liste de cartes “Contacts d’urgence” (témoins, wedding planner) avec bouton “Appeler” (`tel:`).
- Liste de taxis locaux pré-sélectionnés.

**Données:** préférer contenu admin-éditable via `site_content` (décision au plan).

### 4.5 Section « Lendemain & Brunch »

**Contenu:**

- Bloc informatif (heure, menu sommaire, lieu si différent).

**Données:** admin-éditable via `site_content` (décision au plan).

## 5) Exigences Techniques

- SvelteKit SSR, Form Actions pour mutations (song request).
- Typage strict (pas de `any`).
- RLS obligatoire sur nouvelles tables Supabase.
- UI: composants Shadcn `Card`, `Button`, etc.

## 6) Critères d’acceptation

- Le dashboard affiche les 5 nouvelles sections conformément aux règles d’affichage.
- Section Hébergement n’apparaît que si `room_id` est présent.
- Code d’accès chambre est copiable au clic.
- Les invités peuvent proposer une musique et voir les 3 dernières.
- La météo (à J-3) s’affiche sans clé API.
- Les contacts/taxis/brunch sont configurables sans redéploiement (si choix `site_content`).
