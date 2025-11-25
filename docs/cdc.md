# Cahier des Charges - 💍 Mariage V&M 2026 💍

## 1. Présentation du projet

**Mariage V&M 2026** est une plateforme web sur-mesure dédiée à l'organisation et au déroulement du mariage de Vincent et Mélanie, prévu pour juillet 2026.

## 2. Définitions des besoins et objectifs

### 2.1 Besoins

- **Centralisation :** Éviter la dispersion des informations (SMS, mail, papier).
- **Gestion RSVP :** Automatiser la récolte des réponses (présence, régimes, enfants).
- **Sécurité & Identité :** S'assurer que chaque personne accédant au site est bien un invité légitime grâce à une authentification robuste.
- **Confidentialité :** Garantir que les données privées ne sont accessibles qu'aux personnes autorisées.

### 2.2 Objectifs

- **Simplicité d'usage :** Interface "Mobile First" (priorité smartphone).
- **Authentification Moderne :** Utilisation de fournisseurs d'identité tiers (Google) pour éviter la gestion de mots de passe.
- **Autonomie administrative :** Permettre aux mariés de modifier les contenus sans toucher au code.

## 3. Les Fonctionnalités

### 3.1 MVP (Minimum Viable Product)

- **Authentification OAuth :** Connexion via Google ("Sign in with Google") sécurisée.
- **Système de "Whitelist" :** Seuls les utilisateurs dont l'email figure sur la liste des invités peuvent accéder au contenu.
- **Page d'Accueil Personnalisée :** Accueil avec le nom de l'invité récupéré via Google.
- **Module RSVP :** Formulaire pré-rempli (l'utilisateur est déjà identifié).
- **Programme & Lieux :** Timeline et cartes interactives.
- **Galerie Photo (Upload) :** Upload lié au compte utilisateur (on sait qui a posté quoi).
- **Administration :** Back-office pour gérer la liste des invités (emails autorisés) et les contenus.

### 3.2 Évolutions (V2)

- Galerie Photo (Visualisation type Masonry).
- Livre d'Or numérique.
- FAQ Interactive.
- Notifications emails.

## 4. Architecture & Stack Technique

### 4.1 Technologies

- **Framework :** SvelteKit + TypeScript.
- **UI :** Tailwind CSS + Shadcn-Svelte.
- **Backend/BaaS :** Supabase (PostgreSQL, Auth, Storage).
- **Hébergement :** Vercel.

### 4.2 Stratégie d'Authentification & Sécurité

- **Fournisseur :** Google OAuth (via Supabase Auth).
  - _Scope demandé :_ `email`, `profile` (Nom, Avatar).
- **Principe de "Whitelisting" (Liste Blanche) :**
  - Les mariés pré-remplissent la table `guests` avec les emails des invités.
  - À la connexion Google, un _Trigger_ (PostgreSQL) ou un _Hook_ vérifie si l'email existe dans la table `guests`.
  - Si l'email est inconnu : Redirection vers une page "Désolé, vous n'êtes pas sur la liste, contactez les mariés".
  - Si l'email est connu : Accès autorisé et liaison du compte Auth avec la fiche Invité.
- **Fallback (Plan B) :** Pour les invités sans Google, possibilité d'ajouter une connexion par "Magic Link" (Lien email sans mot de passe) via Supabase.

### 4.3 Gestion de Contenu

- **In-Page Editing :** Modification des textes directement depuis l'interface pour les admins (boutons d'édition visibles uniquement par les mariés).

## 5. Structure de la Base de Données (Supabase)

- `guests` :
  - `id` (uuid), `email` (unique), `full_name`, `avatar_url` (venant de Google).
  - `nb_adultes`, `nb_enfants`, `restrictions_alim`, `rsvp_status`.
  - `auth_user_id` (Lien vers la table `auth.users` de Supabase une fois connecté).
- `photos` :
  - `id`, `url`, `owner_id` (référence à `guests.id`), `status` (pending/approved).
- `content` : `key`, `value`, `page`.

## 6. Arborescence & Routes

### Pages Publiques (Accessibles après Login)

| Route        | Description                                            |
| :----------- | :----------------------------------------------------- |
| `/login`     | **Connexion :** Bouton unique "Continuer avec Google". |
| `/`          | **Accueil :** "Bienvenue [Prénom Google]".             |
| `/programme` | **Planning :** Timeline de la journée.                 |
| `/rsvp`      | **RSVP :** Formulaire personnel.                       |
| `/galerie`   | **Photos :** Upload (Mobile first).                    |

### Pages Admin

| Route           | Description                                         |
| :-------------- | :-------------------------------------------------- |
| `/admin`        | **Dashboard :** Vue d'ensemble.                     |
| `/admin/guests` | **Gestion Invités :** Ajout des emails (Whitelist). |

## 7. User Stories (Détail MVP)

| Thématique  | En tant que... | Je veux...                                     | Afin de...                                       |
| :---------- | :------------- | :--------------------------------------------- | :----------------------------------------------- |
| **Auth**    | **Invité**     | Me connecter en un clic avec mon compte Google | Accéder au site rapidement sans mot de passe.    |
| **Auth**    | **Invité**     | Recevoir un "Lien Magique" par email           | Me connecter si je n'ai pas de compte Google.    |
| **Auth**    | **Système**    | Vérifier si l'email est dans la Whitelist      | Bloquer l'accès aux inconnus.                    |
| **Auth**    | **Système**    | Rediriger un utilisateur non autorisé          | Lui indiquer d'utiliser l'email de l'invitation. |
| **Général** | **Invité**     | Voir une page d'accueil personnalisée          | Me sentir accueilli ("Bonjour Vincent").         |
| **RSVP**    | **Invité**     | Indiquer ma présence/absence                   | Informer les mariés.                             |
| **RSVP**    | **Invité**     | Préciser nb. adultes/enfants                   | Aider à la logistique (couchages, chaises).      |
| **RSVP**    | **Invité**     | Renseigner mes restrictions alimentaires       | Que le traiteur adapte mon repas.                |
| **Infos**   | **Invité**     | Consulter le planning (Timeline)               | Savoir où et quand être présent.                 |
| **Infos**   | **Invité**     | Cliquer sur l'adresse du lieu                  | Ouvrir directement mon GPS (Waze/Maps).          |
| **Photos**  | **Invité**     | Uploader une photo depuis mon mobile           | Partager un souvenir en direct.                  |
| **Photos**  | **Système**    | Compresser l'image avant l'envoi               | Économiser la data et le stockage.               |
| **Admin**   | **Mariés**     | Voir des boutons "Éditer" sur le site          | Savoir ce que je peux modifier facilement.       |
| **Admin**   | **Mariés**     | Modifier un texte via une fenêtre simple       | Corriger une info sans toucher au code.          |
| **Admin**   | **Mariés**     | Ajouter un email à la "Whitelist"              | Autoriser un nouvel invité.                      |
| **Admin**   | **Mariés**     | Voir le tableau des RSVP                       | Avoir les chiffres pour le traiteur.             |
| **Admin**   | **Mariés**     | Supprimer une photo                            | Modérer le contenu inapproprié.                  |

## 8. Analyse des Risques (Mise à jour)

1. **Accessibilité (Le risque Google)**
   - _Risque :_ Un invité âgé n'a pas de compte Google.
   - _Solution :_ Utilisation du "Magic Link". **Note importante :** L'email de l'invité doit être récolté en amont (par téléphone ou courrier) et ajouté à la Whitelist par les mariés _avant_ que l'invité ne tente de se connecter.
2. **Sécurité des données**
   - _Risque :_ Un invité se connecte avec un email personnel non invité.
   - _Solution :_ Le système de Whitelist bloque l'accès. Un message d'erreur clair invite l'utilisateur à se connecter avec l'adresse email sur laquelle il a reçu l'invitation.

## 9. Équipe

- **Lead Tech :** Vincent
- **Content & Admin :** Mélanie

## 10. Conventions Techniques & Bonnes Pratiques

Ce document définit les règles de développement pour le projet.

### 10.1 Organisation du Code & Architecture (SvelteKit)

- **Alias (`$lib`) :**
  - `src/lib/components/ui` : Composants Shadcn (Button, Input, etc.).
  - `src/lib/components` : Composants globaux (Navbar, Footer).
  - `src/lib/server` : Code backend uniquement (Clients Supabase Admin, Secrets). **Jamais importé côté client.**
  - `src/lib/utils` : Fonctions helpers.
- **Nommage des Fichiers :**
  - Composants Svelte : `PascalCase.svelte` (ex: `GuestCard.svelte`).
  - Fichiers TS/JS : `camelCase.ts` (ex: `dateFormatter.ts`).
  - Dossiers de Routes : `kebab-case` (ex: `/routes/guest-book`).

### 10.2 Conventions TypeScript & Svelte

- **Typage Strict :**
  - ❌ **Interdit :** L'usage du type `any`.
  - ✅ **Recommandé :** Utiliser les types générés par Supabase (`Database['public']['Tables']['guests']['Row']`).
- **Data Fetching :**
  - Utiliser les `load functions` (`+page.server.ts`) pour charger les données.
  - Privilégier les **Form Actions** pour les mutations de données.

### 10.3 Style & CSS (Tailwind)

- **Utility-First :** Écrire les classes directement dans le HTML.
- **Conditionnel :** Utiliser l'utilitaire `cn()` pour les classes dynamiques.
- **Mobile First :** Le CSS par défaut cible le mobile, les breakpoints (`md:`, `lg:`) ciblent les écrans plus larges.

### 10.4 Base de Données (Supabase / SQL)

- **Nommage :** Tables en `snake_case` pluriel (`guests`), colonnes en `snake_case` (`is_attending`).
- **Sécurité :** RLS (Row Level Security) activé sur toutes les tables.

### 10.5 Git & Versioning

- **Conventional Commits :**
  - `feat:` : Nouvelle fonctionnalité.
  - `fix:` : Correction de bug.
  - `ui:` : Changement visuel.
  - `chore:` : Maintenance/Config.
- **Linting :** Prettier et ESLint doivent passer avant tout commit.
- **Gitmoji :** Ajoute des gitmoji cohérent dans les nom de branche ou commit.
  - `✨` : Nouvelle fonctionnalité.
  - `🐛` : Correction de bug.
  - `🎨` : Amélioration du code (refactor).
  - `📝` : Mise à jour de la documentation.
  - `🚀` : Déploiement
  - `🔒` : Sécurité
  - `⚙️` : Configuration/CI
  - `📦` : Mise à jour des dépendances
  - `🔥` : Suppression de code ou fichiers
  - `💄` : Changement visuel (UI/CSS)
  - `🔧` : Ajustement des scripts ou outils de build
  - `✅` : Ajout ou modification des tests
  - `📚` : Ajout ou mise à jour de la documentation technique
  - `🚨` : Correction de problèmes de linting ou formatage
  - `⬆️` : Mise à jour majeure de dépendances

## 11. Dictionnaire des Données

Cette section décrit la structure de la base de données PostgreSQL hébergée sur Supabase.

### 11.1 Types Personnalisés (Enums)

Pour garantir la cohérence des données, nous utilisons des types énumérés (Enums) plutôt que du texte libre pour les status.

| Nom du Type    | Valeurs Possibles                       | Description                                                                                             |
| :------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `user_role`    | `'admin'`, `'guest'`                    | Définit si l'utilisateur a accès au Back-office.                                                        |
| `rsvp_status`  | `'pending'`, `'present'`, `'absent'`    | État de la réponse de l'invité. Par défaut : `pending`.                                                 |
| `photo_status` | `'pending'`, `'approved'`, `'rejected'` | État de modération d'une photo. Par défaut : `pending` (ou `approved` si on décide de faire confiance). |

### 11.2 Table : `guests` (Invités & Utilisateurs)

Cette table est le cœur du système. Elle sert à la fois de "Whitelist" (liste blanche) pré-remplie par les mariés et de profil utilisateur une fois connecté.

| Champ                  | Type          | Contrainte                                     | Description                                                                               |
| :--------------------- | :------------ | :--------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `id`                   | `UUID`        | **PK**, Default: `gen_random_uuid()`           | Identifiant unique interne de l'invité.                                                   |
| `created_at`           | `TIMESTAMPTZ` | Default: `now()`                               | Date d'ajout à la liste.                                                                  |
| `email`                | `TEXT`        | **Unique**, Non-Null                           | L'email sert de clé pour la Whitelist. Doit correspondre à l'email Google.                |
| `full_name`            | `TEXT`        | Nullable                                       | Nom complet (Rempli manuellement ou via Google).                                          |
| `avatar_url`           | `TEXT`        | Nullable                                       | URL de la photo de profil (récupérée via Google).                                         |
| `role`                 | `user_role`   | Default: `'guest'`                             | Rôle de l'utilisateur. Vincent et Mélanie auront le rôle `'admin'`.                       |
| `auth_id`              | `UUID`        | **FK** vers `auth.users(id)`, Nullable, Unique | Lien vers le compte Supabase Auth. Rempli automatiquement au premier login (via Trigger). |
| **Données RSVP**       |               |                                                |                                                                                           |
| `rsvp_status`          | `rsvp_status` | Default: `'pending'`                           | Réponse de l'invité.                                                                      |
| `adults_count`         | `INTEGER`     | Default: `1`                                   | Nombre d'adultes prévus.                                                                  |
| `children_count`       | `INTEGER`     | Default: `0`                                   | Nombre d'enfants prévus.                                                                  |
| `dietary_restrictions` | `TEXT`        | Nullable                                       | Champ texte libre pour allergies/régimes.                                                 |

### 11.3 Table : `photos` (Galerie)

Stocke les références des photos uploadées sur Supabase Storage.

| Champ          | Type           | Contrainte                                   | Description                                                                               |
| :------------- | :------------- | :------------------------------------------- | :---------------------------------------------------------------------------------------- |
| `id`           | `UUID`         | **PK**, Default: `gen_random_uuid()`         | Identifiant unique de la photo.                                                           |
| `created_at`   | `TIMESTAMPTZ`  | Default: `now()`                             | Date d'upload.                                                                            |
| `storage_path` | `TEXT`         | Non-Null                                     | Chemin du fichier dans le bucket Supabase Storage (ex: `uploads/user_123/photo_abc.jpg`). |
| `guest_id`     | `UUID`         | **FK** vers `guests(id)`, On Delete: Cascade | Qui a uploadé la photo.                                                                   |
| `status`       | `photo_status` | Default: `'pending'`                         | Statut de modération.                                                                     |
| `caption`      | `TEXT`         | Nullable                                     | Petite légende ou commentaire optionnel.                                                  |

### 11.4 Table : `site_content` (CMS Léger)

Permet aux mariés de modifier les textes du site sans toucher au code.

| Champ             | Type          | Contrainte       | Description                                                                          |
| :---------------- | :------------ | :--------------- | :----------------------------------------------------------------------------------- |
| `key`             | `TEXT`        | **PK**           | Clé unique d'identification du texte (ex: `home.welcome_message`, `faq.question_1`). |
| `section`         | `TEXT`        | Non-Null         | Pour organiser le contenu (ex: `'home'`, `'programme'`, `'faq'`).                    |
| `value`           | `TEXT`        | Non-Null         | Le contenu textuel affiché sur le site.                                              |
| `last_updated_at` | `TIMESTAMPTZ` | Default: `now()` | Date de dernière modification.                                                       |

### 11.5 Relations & Sécurité

- **Lien Auth <-> Guests :** La colonne `guests.auth_id` fait le pont entre le système d'authentification de Supabase et nos données métier.
- **Intégrité :**
  - Si un invité est supprimé de `guests`, ses photos sont supprimées (`On Delete Cascade`).
- **Bucket Storage :**
  - Un bucket nommé `photos` sera créé.
  - Les photos seront organisées par dossier utilisateur pour plus de propreté.
