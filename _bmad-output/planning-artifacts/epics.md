---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
---

# wedding-vm-202 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for wedding-vm-202, decomposing the requirements from the PRD into implementable stories. No Architecture or UX documents were produced — the PRD contient les specifications techniques et le codebase existant sert de reference architecturale.

## Requirements Inventory

### Functional Requirements

- FR1 : L'admin peut attribuer un type d'invitation (complet ou vin d'honneur) a chaque invite lors de la creation
- FR2 : L'admin peut modifier le type d'invitation d'un invite existant
- FR3 : L'admin peut attribuer un type d'invitation en masse a une selection d'invites
- FR4 : Le systeme attribue "complet" comme type d'invitation par defaut pour tout nouvel invite
- FR5 : L'invite peut voir un formulaire RSVP adapte a son type d'invitation
- FR6 : L'invite complet peut repondre separement pour chaque jour/bloc d'evenements (samedi : ceremonie + vin d'honneur + diner/soiree ; dimanche : brunch)
- FR7 : L'invite vin d'honneur peut repondre uniquement pour la ceremonie et le vin d'honneur
- FR8 : L'invite peut voir un en-tete personnalise indiquant les evenements auxquels il est convie
- FR9 : L'invite peut ajouter des accompagnants (adultes ou enfants) a son RSVP
- FR10 : L'invite peut specifier des restrictions alimentaires pour lui-meme et ses accompagnants
- FR11 : L'invite gerant un groupe peut soumettre le RSVP pour tous ses membres manages en une seule action
- FR12 : L'invite ayant un lien managed_by peut modifier individuellement son propre RSVP s'il dispose d'un compte
- FR13 : Le systeme conserve les donnees RSVP existantes lorsque l'admin change le type d'invitation d'un invite et ajoute les nouvelles options
- FR14 : L'invite peut consulter le programme organise par jour via des onglets (Samedi / Dimanche)
- FR15 : L'invite vin d'honneur ne voit que les evenements auxquels il est invite dans le programme
- FR16 : L'invite complet peut voir l'ensemble des evenements dans le programme
- FR17 : Le programme affiche les evenements avec une hierarchie visuelle (evenements majeurs en avant, evenements secondaires en retrait)
- FR18 : L'invite peut modifier son adresse email depuis ses parametres de profil
- FR19 : L'invite peut modifier son mot de passe depuis ses parametres de profil
- FR20 : L'invite authentifie via OAuth peut creer un mot de passe pour activer la connexion email/mot de passe
- FR21 : L'invite peut initier un changement de profil ("Ce n'est pas moi") depuis ses parametres
- FR22 : L'invite changeant de profil peut selectionner parmi les profils invites disponibles (non revendiques)
- FR23 : Le systeme reinitialise le RSVP de l'ancien profil lorsqu'un invite change de profil lie
- FR24 : Le nouvel utilisateur authentifie peut rechercher et selectionner son profil invite dans la liste
- FR25 : Le systeme detecte lorsqu'un profil selectionne est deja gere par un autre invite (managed_by)
- FR26 : Le systeme affiche une etape de confirmation intermediaire pour les profils managed
- FR27 : L'invite confirmant la revendication d'un profil managed conserve la relation managed_by existante
- FR28 : L'admin peut voir des badges colores indiquant le type d'invitation a cote de chaque invite
- FR29 : L'admin peut filtrer la liste des invites par type d'invitation
- FR30 : L'admin peut voir des compteurs agreges par type d'invitation et statut RSVP
- FR31 : L'admin peut voir des compteurs par evenement (ceremonie, vin d'honneur, diner, brunch)
- FR32 : L'admin peut delier un compte invite (reinitialiser le lien auth) pour permettre un re-claim
- FR33 : L'admin peut effectuer toutes les operations existantes sur les invites (creer, modifier, supprimer)
- FR34 : Le systeme envoie un email de confirmation RSVP adapte au type d'invitation de l'invite
- FR35 : Le systeme envoie un email d'invitation adapte au type d'invitation de l'invite
- FR36 : Le systeme envoie un email d'alerte admin avec le contexte du type d'invitation
- FR37 : La homepage affiche un CTA contextuel selon l'etat RSVP de l'invite (pas encore repondu → "Confirmer" / deja repondu → "Voir/Modifier")
- FR38 : La homepage affiche trois boutons d'action (RSVP, Programme, Galerie)
- FR39 : Le systeme supprime l'integralite du code et des donnees lies a `invitation_code`

### NonFunctional Requirements

- NFR1 : Les pages protegees se chargent en moins de 2 secondes sur une connexion mobile 4G (incluant SSR + hydration)
- NFR2 : Les soumissions de formulaire (RSVP, profil) retournent un feedback visuel en moins de 1 seconde
- NFR3 : Le programme avec onglets se charge sans delai perceptible lors du changement de tab (donnees deja presentes cote client)
- NFR4 : La galerie photo utilise le lazy loading pour ne pas impacter le temps de chargement initial
- NFR5 : Aucune page ne depasse 200KB de JavaScript cote client (hors images)
- NFR6 : Toute authentification utilise exclusivement `safeGetSession()` avec validation JWT — jamais `getSession()` brut
- NFR7 : Les operations admin sont protegees par verification du role `admin` en base de donnees a chaque requete
- NFR8 : Les Row-Level Security policies empechent tout acces non autorise aux donnees d'autres invites
- NFR9 : La modification d'email met a jour `auth.users` et `guests.email` de maniere atomique via le service role client
- NFR10 : Les inputs utilisateur sont valides cote serveur via Zod et sanitises avant insertion en base
- NFR11 : Le rate limiting est applique sur les endpoints sensibles (login, register, RSVP submit, password change)
- NFR12 : Les variables d'environnement sensibles (`SERVICE_ROLE_KEY`, `RESEND_API_KEY`) ne sont jamais exposees cote client
- NFR13 : Les headers de securite (CSP, X-Frame-Options, etc.) sont appliques en production
- NFR14 : Le keep-alive previent les cold starts du serveur Node.js pour garantir une disponibilite continue
- NFR15 : Les erreurs serveur (500) affichent une page d'erreur user-friendly sans exposer de details techniques
- NFR16 : La soumission RSVP est idempotente — une double soumission ne cree pas de donnees dupliquees
- NFR17 : Le changement de profil ("Ce n'est pas moi") est atomique — pas d'etat intermediaire ou l'invite serait sans profil
- NFR18 : `make qa` (lint + type check) passe sans erreur apres chaque modification
- NFR19 : Les types Supabase sont regeneres (`make types`) apres toute modification du schema
- NFR20 : Aucun code mort ne subsiste apres l'implementation (suppression complete de `invitation_code` et tout code orphelin)
- NFR21 : Les validations Zod sont centralisees dans `$lib/server/validation.ts` et reutilisees dans tous les form actions
- NFR22 : Les templates email sont maintenus comme composants Svelte dans `$lib/emails/` avec un rendu previsible

### Additional Requirements

**Contexte technique existant (brownfield) :**
- Migration BDD Supabase : ajout colonne `invitation_type` (enum `complet` | `vin_honneur`, defaut `complet`) sur table `guests` + suppression colonne `invitation_code`
- Les RLS policies existantes doivent rester valides apres la migration
- Regenerer les types TypeScript via `make types` apres toute modification du schema
- SvelteKit 2 + Svelte 5 avec form actions pattern (`+page.server.ts` + Zod validation)
- Authentification Supabase Auth : Google OAuth + email/mot de passe, coexistence des deux methodes
- Service role client (`SERVICE_ROLE_KEY`) pour les operations admin bypass RLS
- Email via Resend avec templates Svelte dans `$lib/emails/` rendus via `svelte-email`
- Pattern managed guests : `managed_by_id` sur table `guests` pour les groupes familiaux
- Tailwind CSS 3 + Bits UI pour les composants
- `make qa` (lint + type check) doit passer apres chaque story
- Pas de starter template — projet brownfield, tout s'ajoute au codebase existant

### FR Coverage Map

- FR1: Epic 1 — Admin attribue type invitation a la creation
- FR2: Epic 1 — Admin modifie type invitation existant
- FR3: Epic 1 — Admin bulk tagging type invitation
- FR4: Epic 1 — Defaut "complet" pour nouvel invite
- FR5: Epic 2 — Formulaire RSVP adapte au type
- FR6: Epic 2 — Invite complet repond par jour/bloc
- FR7: Epic 2 — Invite vin d'honneur repond ceremonie + VH
- FR8: Epic 2 — En-tete RSVP personnalise
- FR9: Epic 2 — Ajout accompagnants au RSVP
- FR10: Epic 2 — Restrictions alimentaires
- FR11: Epic 2 — RSVP groupe (managed guests)
- FR12: Epic 2 — RSVP individuel pour managed avec compte
- FR13: Epic 2 — Conservation RSVP au changement de type
- FR14: Epic 3 — Programme par onglets jour
- FR15: Epic 3 — Programme filtre vin d'honneur
- FR16: Epic 3 — Programme complet pour invite complet
- FR17: Epic 3 — Hierarchie visuelle evenements
- FR18: Epic 4 — Modification email depuis profil
- FR19: Epic 4 — Modification mot de passe depuis profil
- FR20: Epic 4 — Creation mot de passe pour OAuth
- FR21: Epic 4 — Initier changement de profil
- FR22: Epic 4 — Selection profil disponible
- FR23: Epic 4 — Reinitialisation RSVP ancien profil
- FR24: Epic 4 — Recherche et selection profil claim
- FR25: Epic 4 — Detection profil managed
- FR26: Epic 4 — Etape intermediaire claim managed
- FR27: Epic 4 — Conservation managed_by au claim
- FR28: Epic 1 — Badges colores type invitation
- FR29: Epic 1 — Filtre liste par type invitation
- FR30: Epic 1 — Compteurs par type et statut RSVP
- FR31: Epic 1 — Compteurs par evenement
- FR32: Epic 4 — Admin delier compte invite
- FR33: Epic 1 — Admin CRUD invites existant
- FR34: Epic 2 — Email confirmation RSVP adapte
- FR35: Epic 2 — Email invitation adapte
- FR36: Epic 2 — Email alerte admin avec type
- FR37: Epic 3 — CTA homepage contextuel RSVP
- FR38: Epic 3 — Trois boutons action homepage
- FR39: Epic 1 — Suppression code invitation_code

## Epic List

### Epic 1: Gestion des types d'invitation (Admin)
Les maries peuvent differencier leurs invites par type d'invitation (complet vs vin d'honneur) et gerer efficacement la liste de 75+ invites avec badges colores, filtres par type, et compteurs par evenement. Le code mort `invitation_code` est supprime.
**FRs covered:** FR1, FR2, FR3, FR4, FR28, FR29, FR30, FR31, FR33, FR39

### Epic 2: RSVP adaptatif et notifications email
Chaque invite voit un formulaire RSVP adapte a son type d'invitation avec un en-tete personnalise positif et recoit une confirmation email precise. Le RSVP de groupe, les accompagnants et les restrictions alimentaires fonctionnent pour les deux types. Le changement de type par l'admin conserve les donnees RSVP existantes.
**FRs covered:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR34, FR35, FR36

### Epic 3: Programme filtre et navigation contextuelle
L'invite consulte un programme organise par jour avec des onglets (Samedi/Dimanche), filtre selon son type d'invitation, avec une hierarchie visuelle claire entre evenements majeurs et secondaires. La homepage affiche des CTAs contextuels selon l'etat RSVP et trois boutons d'action.
**FRs covered:** FR14, FR15, FR16, FR17, FR37, FR38

### Epic 4: Gestion de profil et association de compte
L'invite peut modifier son email, son mot de passe (y compris creation pour les comptes OAuth), corriger une erreur de profil via "Ce n'est pas moi" avec re-claim, et l'admin peut delier un compte. Le claim-profile gere les profils managed avec une etape de confirmation intermediaire qui conserve le lien managed_by.
**FRs covered:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR32

## Epic 1: Gestion des types d'invitation (Admin)

Les maries peuvent differencier leurs invites par type d'invitation (complet vs vin d'honneur) et gerer efficacement la liste de 75+ invites avec badges colores, filtres par type, et compteurs par evenement. Le code mort `invitation_code` est supprime.

### Story 1.1: Migration BDD et nettoyage invitation_code

As a admin,
I want the database to support invitation types and remove the unused invitation_code system,
So that the foundation is ready for differentiated guest management.

**Acceptance Criteria:**

**Given** la table `guests` existe avec la colonne `invitation_code`
**When** la migration est executee
**Then** une colonne `invitation_type` de type enum (`complet`, `vin_honneur`) avec defaut `complet` est ajoutee a la table `guests`
**And** la colonne `invitation_code` est supprimee de la table `guests`
**And** toutes les references a `invitation_code` sont supprimees du codebase (composants, server code, validation, types)
**And** les RLS policies existantes restent valides et fonctionnelles
**And** les types TypeScript sont regeneres via `make types`
**And** `make qa` passe sans erreur

### Story 1.2: Type d'invitation a la creation et modification d'un invite

As a admin,
I want to set the invitation type when creating or editing a guest,
So that each guest is properly categorized from the start.

**Acceptance Criteria:**

**Given** l'admin est sur le formulaire de creation d'un invite
**When** il cree un nouvel invite
**Then** un champ dropdown "Type d'invitation" (Complet / Vin d'honneur) est visible
**And** la valeur par defaut est "Complet"
**And** le type selectionne est sauvegarde en base

**Given** l'admin est sur le formulaire de modification d'un invite existant
**When** il modifie le type d'invitation
**Then** le nouveau type est sauvegarde en base
**And** la validation Zod server-side accepte uniquement les valeurs `complet` ou `vin_honneur`
**And** `make qa` passe sans erreur

### Story 1.3: Bulk tagging type d'invitation

As a admin,
I want to assign an invitation type to multiple guests at once,
So that I can efficiently tag groups of guests without editing them one by one.

**Acceptance Criteria:**

**Given** l'admin est sur la liste des invites `/admin/guests`
**When** il selectionne plusieurs invites via des checkboxes
**Then** une action groupee "Definir le type d'invitation" est disponible
**And** il peut choisir "Complet" ou "Vin d'honneur" dans un dropdown

**Given** l'admin a selectionne 15 invites et choisi "Vin d'honneur"
**When** il valide l'action groupee
**Then** les 15 invites ont leur `invitation_type` mis a jour en base
**And** un feedback visuel confirme le succes de l'operation
**And** `make qa` passe sans erreur

### Story 1.4: Badges colores, filtres et compteurs

As a admin,
I want to see colored badges, filter guests by type, and view aggregate counters,
So that I can monitor my guest list at a glance and extract numbers for the caterer.

**Acceptance Criteria:**

**Given** l'admin est sur la liste des invites
**When** il regarde la liste
**Then** un badge colore apparait a cote de chaque nom (vert pour "Complet", orange pour "Vin d'honneur")

**Given** l'admin veut filtrer par type
**When** il selectionne un filtre de type d'invitation
**Then** seuls les invites du type selectionne sont affiches

**Given** l'admin consulte les compteurs
**When** la page se charge
**Then** des compteurs agreges affichent le nombre par type et par statut RSVP (ex: "60 complets - 15 vin d'honneur - 75 total")
**And** des compteurs par evenement affichent les confirmes par evenement (ceremonie, vin d'honneur, diner, brunch)
**And** `make qa` passe sans erreur

## Epic 2: RSVP adaptatif et notifications email

Chaque invite voit un formulaire RSVP adapte a son type d'invitation avec un en-tete personnalise positif et recoit une confirmation email precise. Le RSVP de groupe, les accompagnants et les restrictions alimentaires fonctionnent pour les deux types.

### Story 2.1: Formulaire RSVP adaptatif et en-tete personnalise

As a invite,
I want to see a RSVP form adapted to my invitation type with a personalized header,
So that I know exactly which events I'm invited to and can respond accordingly.

**Acceptance Criteria:**

**Given** un invite complet accede a la page RSVP
**When** le formulaire se charge
**Then** un en-tete personnalise affiche "Tu es invite(e) a celebrer notre mariage le samedi 18 et dimanche 19 juillet — ceremonie, vin d'honneur, diner, soiree et brunch !"
**And** le formulaire affiche des checkboxes par jour/bloc : "Samedi 18 — Ceremonie, Vin d'honneur, Diner & Soiree" et "Dimanche 19 — Brunch"
**And** l'invite peut ajouter des accompagnants (adultes et enfants)
**And** l'invite peut specifier des restrictions alimentaires pour chaque personne

**Given** un invite vin d'honneur accede a la page RSVP
**When** le formulaire se charge
**Then** un en-tete personnalise affiche "Tu es invite(e) a notre ceremonie et vin d'honneur le samedi 18 juillet !"
**And** le formulaire affiche un choix simplifie "Present / Absent" sans checkbox par jour
**And** l'invite peut ajouter des accompagnants et restrictions alimentaires

**Given** un invite gerant un groupe (managed guests)
**When** il soumet le RSVP
**Then** le RSVP est soumis pour lui-meme et tous ses membres manages en une seule action

**Given** un invite managed_by qui a son propre compte
**When** il accede a la page RSVP
**Then** il peut modifier individuellement son propre RSVP
**And** `make qa` passe sans erreur

### Story 2.2: Conservation RSVP au changement de type d'invitation

As a systeme,
I want to preserve existing RSVP data when the admin changes a guest's invitation type,
So that no guest responses are lost during type changes.

**Acceptance Criteria:**

**Given** un invite vin d'honneur a deja repondu "Present" a la ceremonie et au vin d'honneur
**When** l'admin change son type de "vin_honneur" a "complet"
**Then** la reponse existante (Present ceremonie + VH) est conservee
**And** les nouvelles options (diner, brunch) apparaissent dans le formulaire RSVP sans reponse pre-remplie
**And** l'invite peut completer son RSVP avec les nouvelles options

**Given** un invite complet a repondu pour samedi et dimanche
**When** l'admin change son type de "complet" a "vin_honneur"
**Then** la reponse pour la ceremonie et le vin d'honneur est conservee
**And** les reponses pour le diner et le brunch ne sont plus affichees dans le formulaire
**And** `make qa` passe sans erreur

### Story 2.3: Templates email adaptes au type d'invitation

As a invite,
I want to receive emails that accurately reflect my invitation type,
So that the confirmation and information I receive matches what I'm actually invited to.

**Acceptance Criteria:**

**Given** un invite complet soumet son RSVP
**When** l'email de confirmation est envoye
**Then** l'email recapitule la presence pour tous les evenements (ceremonie, vin d'honneur, diner, brunch) avec les restrictions alimentaires

**Given** un invite vin d'honneur soumet son RSVP
**When** l'email de confirmation est envoye
**Then** l'email recapitule uniquement la presence a la ceremonie et au vin d'honneur
**And** aucune mention du diner ou du brunch n'apparait

**Given** un invite est ajoute par l'admin
**When** l'email d'invitation est envoye
**Then** le contenu reflete le type d'invitation de l'invite

**Given** un RSVP est soumis
**When** l'email d'alerte admin est envoye
**Then** le type d'invitation de l'invite est mentionne dans l'alerte
**And** `make qa` passe sans erreur

## Epic 3: Programme filtre et navigation contextuelle

L'invite consulte un programme organise par jour avec des onglets, filtre selon son type d'invitation, avec une hierarchie visuelle claire.

### Story 3.1: Programme par onglets avec filtrage et hierarchie visuelle

As a invite,
I want to see my event programme organized by day with only the events I'm invited to,
So that I know exactly when to arrive and what to expect.

**Acceptance Criteria:**

**Given** un invite complet accede a la page programme
**When** la page se charge
**Then** deux onglets sont affiches : "Samedi 18 Juillet" et "Dimanche 19 Juillet"
**And** tous les evenements sont visibles (ceremonie, vin d'honneur, diner, soiree, brunch)
**And** les evenements majeurs (ceremonie, diner) sont affiches avec des cartes grandes/prominentes
**And** les evenements secondaires (ouverture des portes) sont affiches avec des cartes plus petites/discretes

**Given** un invite vin d'honneur accede a la page programme
**When** la page se charge
**Then** seul l'onglet "Samedi 18 Juillet" est affiche (pas d'onglet Dimanche)
**And** seuls les evenements auxquels il est invite sont visibles (ouverture des portes, ceremonie, vin d'honneur)
**And** aucun evenement du diner, de la soiree ou du brunch n'apparait
**And** le titre en haut affiche "Ton programme"

**Given** un invite change d'onglet
**When** il clique sur un autre onglet
**Then** le contenu se charge sans delai perceptible (donnees deja presentes cote client)
**And** `make qa` passe sans erreur

### Story 3.2: Homepage CTAs contextuels

As a invite,
I want the homepage to guide me toward the right action based on my RSVP status,
So that I always know what to do next when I visit the site.

**Acceptance Criteria:**

**Given** un invite connecte n'a pas encore repondu au RSVP
**When** il accede a la homepage
**Then** le bouton RSVP affiche "Confirmer Ta Presence" avec un sous-texte "Repondre avant le 1er mai"
**And** le bouton est visuellement mis en avant par rapport aux deux autres

**Given** un invite connecte a deja repondu au RSVP
**When** il accede a la homepage
**Then** le bouton RSVP affiche "Voir / Modifier mon RSVP"

**Given** un invite accede a la homepage
**When** la page se charge
**Then** trois boutons d'action sont visibles : RSVP, Programme, Galerie
**And** `make qa` passe sans erreur

## Epic 4: Gestion de profil et association de compte

L'invite peut modifier son email, son mot de passe, corriger une erreur de profil, et l'admin peut delier un compte. Le claim-profile gere les profils managed avec confirmation intermediaire.

### Story 4.1: Page profil settings — email et mot de passe

As a invite,
I want to manage my email and password from my profile settings,
So that I can update my credentials without contacting the couple.

**Acceptance Criteria:**

**Given** un invite connecte par email/mot de passe accede a `/profile/settings`
**When** il modifie son adresse email
**Then** l'email est mis a jour dans `auth.users` ET `guests.email` de maniere atomique via le service role client
**And** un message de confirmation s'affiche

**Given** un invite connecte par email/mot de passe accede a `/profile/settings`
**When** il modifie son mot de passe
**Then** le mot de passe est mis a jour dans Supabase Auth
**And** la validation exige l'ancien mot de passe avant d'accepter le nouveau

**Given** un invite connecte via Google OAuth accede a `/profile/settings`
**When** il souhaite creer un mot de passe
**Then** un formulaire de creation de mot de passe est affiche (sans demander l'ancien mot de passe)
**And** une fois cree, l'invite peut se connecter via email/mot de passe en plus de Google OAuth
**And** la validation Zod server-side est appliquee sur tous les champs
**And** le rate limiting est actif sur les endpoints de changement de mot de passe
**And** `make qa` passe sans erreur

### Story 4.2: Changement de profil "Ce n'est pas moi"

As a invite,
I want to correct a profile claim error by switching to my real profile,
So that I can fix a mistake without contacting the couple.

**Acceptance Criteria:**

**Given** un invite connecte accede a `/profile/settings`
**When** il regarde la section "Mon profil invite"
**Then** son nom de profil lie est affiche (ex: "Lucas Durand")
**And** un lien "Ce n'est pas moi ? Changer de profil" est visible

**Given** l'invite clique sur "Ce n'est pas moi"
**When** le dialog s'ouvre
**Then** un message affiche "Tu es actuellement lie a [nom]. Choisis ton vrai profil :"
**And** la liste des profils disponibles (non revendiques) est affichee

**Given** l'invite selectionne un nouveau profil
**When** il confirme le changement
**Then** un avertissement affiche "Ton RSVP sur l'ancien profil sera reinitialise. Tu devras refaire ton RSVP."
**And** apres confirmation, le lien `auth_id` est transfere vers le nouveau profil
**And** l'ancien profil a son `auth_id` reinitialise (redevient disponible)
**And** le RSVP de l'ancien profil est reinitialise
**And** les managed guests de l'ancien profil suivent vers le nouveau profil
**And** l'operation est atomique (pas d'etat intermediaire)
**And** `make qa` passe sans erreur

### Story 4.3: Claim-profile ameliore pour profils managed

As a nouvel utilisateur,
I want to claim my guest profile even if it's already managed by someone else,
So that I can have my own account while keeping the group relationship intact.

**Acceptance Criteria:**

**Given** un nouvel utilisateur authentifie accede a `/claim-profile`
**When** il recherche son nom
**Then** les profils correspondants (revendiques et non-revendiques sans auth_id) sont affiches

**Given** l'utilisateur selectionne un profil qui a un `managed_by_id` (gere par un autre invite)
**When** le systeme detecte le lien managed
**Then** une etape intermediaire affiche "[Nom du manager] a deja renseigne des informations pour toi. Confirmes-tu vouloir lier ce profil a ton compte ?"

**Given** l'utilisateur confirme la revendication du profil managed
**When** le lien est cree
**Then** le `auth_id` est associe au profil
**And** le `managed_by_id` reste intact (le manager garde la gestion du RSVP groupe)
**And** l'utilisateur a son propre acces au site (programme, galerie, RSVP individuel)
**And** `make qa` passe sans erreur

### Story 4.4: Admin delier un compte invite

As a admin,
I want to unlink a guest's account from their profile,
So that I can fix claim errors reported by guests.

**Acceptance Criteria:**

**Given** l'admin est sur la page de detail d'un invite dans `/admin/guests`
**When** il clique sur "Delier le compte"
**Then** le `auth_id` du profil invite est reinitialise a null
**And** le RSVP du profil est reinitialise
**And** l'invite, a sa prochaine connexion, est redirige vers `/claim-profile`
**And** le profil redevient disponible dans la liste de claim
**And** un feedback visuel confirme le succes de l'operation
**And** `make qa` passe sans erreur
