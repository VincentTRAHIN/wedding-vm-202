<!--
Sync Impact Report:
- Version change: 0.0.0 -> 1.0.0
- Modified principles: Initial population of all principles based on project requirements.
- Added sections: Principles I-VII covering Stack, Architecture, Typing, Style, Security, Conventions, Performance.
- Templates requiring updates: None immediately.
-->

# Mariage V&M 2026 Constitution

## Core Principles

### I. Stack Technique Strict

SvelteKit (TypeScript), Supabase (Auth, DB, Storage), Tailwind CSS, Shadcn-Svelte. Ce choix est non-négociable pour garantir la cohérence et la maintenabilité.

### II. Architecture Serveur

Utiliser les "Form Actions" pour les mutations serveur. Pas de fetch manuel côté client si évitable. L'objectif est de tirer parti des capacités natives de SvelteKit et de simplifier la gestion d'état côté client.

### III. Typage Strict

TypeScript Strict. Pas de `any`. Utiliser les types générés par Supabase. La sécurité de type est primordiale pour éviter les erreurs d'exécution et faciliter le refactoring.

### IV. Style & UX

Mobile First impératif. Utiliser Tailwind avec `cn()` pour les classes conditionnelles. L'expérience utilisateur sur mobile est la priorité absolue.

### V. Sécurité & Données

RLS (Row Level Security) obligatoire sur toutes les tables Supabase. La sécurité des données ne doit jamais être déléguée au client.

### VI. Conventions & Documentation

Respecter strictement le dossier `docs/`. La documentation est la source de vérité et doit être maintenue à jour avec le code.

### VII. Performance

Minimiser le JS client. Privilégier le SSR (Server-Side Rendering). La performance est une fonctionnalité clé, en particulier sur les réseaux mobiles.

## Governance

La constitution prévaut sur toutes les autres pratiques. Toute modification nécessite une documentation et une validation. Les Pull Requests doivent vérifier la conformité avec ces principes.

**Version**: 1.0.0 | **Ratified**: 2025-11-23 | **Last Amended**: 2025-11-23
