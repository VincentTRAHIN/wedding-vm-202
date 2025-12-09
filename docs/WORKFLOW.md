# Workflow de Développement

Ce document décrit les processus de développement, de test et de déploiement pour le projet Wedding VM 2026.

## Prérequis

Assurez-vous d'avoir configuré votre fichier `.env` à la racine du projet avec les variables suivantes :

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `ORIGIN` (ex: `http://localhost:5173`)
- `SENDER_EMAIL`
- `WEDDING_ACCESS_CODE`

## Utilisation du Makefile

Le projet utilise un `Makefile` pour automatiser les tâches courantes.

### Commandes Principales

Pour voir toutes les commandes disponibles, lancez simplement :
\`\`\`bash
make help
\`\`\`

#### Développement

- **`make install`** : Installe les dépendances du projet (`npm install`).
- **`make dev`** : Lance le serveur de développement local (`npm run dev`).
- **`make build`** : Compile le projet pour la production.
- **`make preview`** : Prévisualise le build de production localement.

#### Qualité & Tests

- **`make qa`** : Lance tous les contrôles de qualité (Linting + Vérification des types). C'est la commande à lancer avant de commit.
- **`make lint`** : Vérifie uniquement le style du code (ESLint).
- **`make check`** : Vérifie uniquement les types TypeScript.
- **`make format`** : Formate automatiquement le code avec Prettier.

#### Base de Données

- **`make types`** : Régénère les définitions TypeScript à partir de la base de données Supabase distante. Utile lorsque le schéma de la base de données change.

#### Déploiement

- **`make deploy`** : Automatise le flux de déploiement vers la production.
  1. Lance `make qa` pour vérifier que tout est correct.
  2. Bascule sur la branche `main`.
  3. Fusionne `develop` dans `main`.
  4. Pousse `main` vers le dépôt distant (ce qui déclenche le déploiement Coolify).
  5. Revient sur la branche `develop`.

## Workflow Git

Nous utilisons une version simplifiée de Git Flow :

- **`develop`** : Branche principale de développement. Toutes les nouvelles fonctionnalités et correctifs sont fusionnés ici.
- **`main`** : Branche de production. Ne doit être mise à jour que via `make deploy` (ou une PR depuis `develop`).

### Cycle de vie d'une fonctionnalité

1. Créer une branche depuis `develop` : `git checkout -b feature/ma-feature develop`
2. Coder et tester (`make dev`).
3. Vérifier la qualité (`make qa`).
4. Fusionner dans `develop` (via PR ou merge local).
5. Déployer en production (`make deploy`).
