---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Amelioration de l application de mariage Vincent & Melanie - UX, fonctionnalites, logique metier'
session_goals: 'Gestion de compte, correction profil invite, UI programme, boutons accueil, logique invitation RSVP'
selected_approach: 'ai-recommended'
techniques_used: ['Question Storming', 'Role Playing', 'SCAMPER Method']
ideas_generated: [25]
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitateur:** nitrahinio
**Date:** 2026-02-01

## Session Overview

**Sujet:** Amelioration de l'application de mariage Vincent & Melanie (SvelteKit 2 + Supabase)
**Objectifs:**

1. **Gestion de compte utilisateur** — Modification email, modification mot de passe depuis l'espace invite
2. **Correction du profil invite** — Permettre de changer de profil si erreur lors du claim-profile
3. **Hierarchie UI du programme** — Pagination Jour 1 / Jour 2, meilleure distinction dates vs evenements
4. **Boutons de la page d'accueil** — Ameliorer les 3 CTA en bas de page
5. **Logique d'invitation differenciee RSVP** — Admin definit "invite a quoi" (vin d'honneur vs tout), RSVP utilisateur reflete l'invitation

### Context Guidance

_Application existante en production avec SvelteKit 2, Svelte 5, Supabase Auth (Google OAuth + email/password), Tailwind CSS, Bits UI. Base de donnees PostgreSQL avec RLS. Systeme de managed guests pour les familles._

### Session Setup

_Session de brainstorming multi-axes sur 5 fonctionnalites/ameliorations identifiees. Exploration complete du codebase realisee pour contexte._

## Technique Selection

**Approche :** Techniques recommandees par l'IA
**Contexte d'analyse :** Amelioration d'application existante avec 5 axes (UX, fonctionnalites, logique metier)

**Techniques recommandees :**

- **Question Storming (Phase 1 - Cadrage) :** Generer les bonnes questions avant les solutions pour cadrer chaque axe d'amelioration
- **Role Playing (Phase 2 - Exploration) :** Explorer depuis les perspectives des differents types d'utilisateurs (invite, admin, famille, vin d'honneur uniquement)
- **SCAMPER Method (Phase 3 - Amelioration) :** Appliquer 7 filtres systematiques pour transformer les idees brutes en solutions concretes

**Justification IA :** Sequence concue pour d'abord cadrer les 5 problemes (Question Storming), puis explorer les perspectives utilisateurs (Role Playing), puis raffiner en solutions actionnables (SCAMPER).

## Technique 1 : Question Storming — Resultats

**Axe 1 — Gestion de compte utilisateur :**
- Synchronisation `auth.users.email` vs `guests.email` : qui est la source de verite ?
- Invites OAuth vs email/password : experiences differentes necessaires
- Securite du changement d'email : double confirmation (ancien + nouveau mail)
- Impact sur les notifications RSVP si email desynchronise
- Placement UX : `/profile/settings` ou integration dashboard ?
- Rate limiting specifique pour changements sensibles

**Axe 2 — Correction du profil invite :**
- Cascade de donnees critique : RSVP, managed guests, photos, song requests lies au profil
- Self-service vs admin-only : equilibre securite / praticite
- Reinitialisation necessaire du RSVP sur l'ancien profil apres de-claim
- Risque de "vol" de profil si self-service sans garde-fous
- Historique des changements pour tracabilite admin

**Axe 3 — Hierarchie UI du programme :**
- Pagination tabs "Samedi 18" / "Dimanche 19" vs scroll unique
- Hierarchie visuelle : moments cles vs moments de transition (taille, couleur, badges)
- Desequilibre de contenu : 6 events samedi vs 3 dimanche
- Lien critique avec Axe 5 : chaque invite voit-il le meme programme ?
- Indicateur temps reel le jour J
- Vue par defaut selon temporalite (avant/pendant/apres mariage)

**Axe 4 — Boutons de la page d'accueil :**
- Question fondamentale : quel est le role de la homepage ? (Landing page, hub, espace emotionnel)
- Boutons contextuels selon etat invite (RSVP fait/pas fait, connecte/non connecte)
- Temporalite : les CTAs devraient evoluer (avant → RSVP, jour J → programme, apres → galerie)
- Non-connecte : 3 boutons vers login = confusion, 1 seul CTA suffirait
- Galerie prematuree avant le mariage

**Axe 5 — Logique d'invitation differenciee RSVP :**
- Question fondamentale de granularite : enum simple (vin_honneur/complet) vs booleens par evenement
- Sensibilite sociale : formulation pour eviter le sentiment "invite de seconde zone"
- Impact sur RSVP : formulaire adapte au type d'invitation
- Impact sur programme : filtrage ou griser les evenements non-concernes
- Impact sur emails : invitation et confirmation doivent refleter le perimetre
- Managed guests : heritage du type d'invitation dans un groupe familial
- Dashboard admin : besoin de vue capacite par evenement

**Themes transversaux identifies :**
1. Synchronisation des donnees (email, type invitation qui cascade)
2. Contextualisation par invite (chaque invite voit-il la meme chose ?)
3. Granularite vs simplicite (types d'invitation)
4. Temporalite (homepage et CTAs evolutifs dans le temps)

## Technique 2 : Role Playing — Resultats

**Personas explores :** Tante Monique (60 ans, peu tech), Kevin (collegue, vin d'honneur seul), Sophie & Thomas (couple avec enfants), Admin (le marie), Lucas (erreur de claim-profile)

### Decisions prises durant le Role Playing

- **Code d'invitation a retirer** — la fonctionnalite d'invitation par code est a supprimer
- **Managed guest + claim propre compte** — Thomas peut claim son profil meme s'il est managed by Sophie, le lien managed_by reste. Etape intermediaire : "Cette personne a deja renseigne des infos pour vous, confirmez-vous ?"
- **Enfants hors perimetre** — Geres par le faire-part, pas par l'app
- **Migration managed guests** — Quand un invite change de profil, ses managed guests suivent
- **Mot de passe** — Pas de magic link, mot de passe classique suffit avec un design clair
- **3 boutons homepage** — Les 3 CTA restent sur la homepage
- **Tabs programme** — Tante Monique s'en sortira avec un design clair de tabs par jour
- **Type invitation admin** — A la creation ET modification + bulk tagging en masse
- **Badge colore** — Type d'invitation affiche en badge colore + filtre par badge
- **Compteur d'invites** — Par type d'invitation, discret et clair
- **Changement type invitation** — Pas d'email auto, notification manuelle via WhatsApp. Garder ancien RSVP + ajouter nouvelles options
- **Pas d'export** — Pas de CSV/PDF, pas de page logistique separee, pas de recap restrictions par evenement

### Insights par persona

| Persona | Axe le plus impacte | Decouverte cle |
|---|---|---|
| Tante Monique | Axe 3 (UI programme) | Tabs + design clair suffisent |
| Kevin | Axe 5 (invitation RSVP) | Le RSVP actuel est ambigu sans type d'invitation |
| Sophie & Thomas | Axe 2 (correction profil) | Managed guests doivent suivre + Thomas garde managed_by meme avec son propre compte |
| Admin (vous) | Axe 5 (invitation RSVP) | Badge + filtre + compteur discret + bulk tag |
| Lucas | Axe 2 (correction profil) | Self-service "Ce n'est pas moi" + admin "Delier le compte" |

### Solutions emergentes du Role Playing

- **Self-service "Ce n'est pas moi ?"** — Bouton dans l'espace perso pour changer de profil invite avec dialog de confirmation et migration des managed guests
- **Admin "Delier le compte"** — Bouton dans `/admin/guests` qui remet auth_id a null, reinitialise RSVP, dissocie managed guests. L'invite retombe sur claim-profile a la prochaine connexion
- **RSVP contextuel selon type d'invitation** — Kevin (vin d'honneur) voit un formulaire simplifie, Monique (invite complete) voit le formulaire actuel
- **Programme potentiellement filtre** — Kevin ne voit que les evenements auxquels il est invite

## Technique 3 : SCAMPER — Resultats

### Axe 1 — Gestion de compte : Solutions SCAMPER

- **[S] Substituer** le flux "mot de passe oublie" par un changement direct depuis `/profile/settings` avec verification de l'ancien mot de passe
- **[C] Combiner** email + mot de passe dans une seule page `/profile/settings`. Combiner la mise a jour `auth.users.email` et `guests.email` en une seule action serveur
- **[E] Eliminer** la possibilite de changer l'email pour les invites OAuth (gere par Google)
- **[A] Adapter** l'UI selon le type de compte : email/password (sections email + mdp) vs OAuth (message "Connecte via Google")
- **Decision utilisateur :** Les invites OAuth peuvent aussi definir/modifier un mot de passe pour la connexion email/password — les deux methodes coexistent

### Axe 2 — Correction profil : Solutions SCAMPER

- **[S] Substituer** l'intervention BDD par : self-service "Ce n'est pas moi ?" + admin "Delier le compte"
- **[C] Combiner** de-claim + re-claim en une seule action fluide (un seul dialog, un seul clic de validation)
- **[A] Adapter** le comportement selon la complexite (profil simple = changement instantane, avec managed guests = confirmation detaillee, avec RSVP = avertissement reinitialisation)
- **[M] Modifier** le claim-profile pour les profils managed : etape intermediaire "Cette personne a deja renseigne des infos pour vous"
- **[E] Eliminer** le code d'invitation + empecher le vol de profil (seuls les profils auth_id = null sont visibles)

### Axe 3 — UI Programme : Solutions SCAMPER

- **[S] Substituer** le scroll unique par des tabs "Samedi 18 Juillet" / "Dimanche 19 Juillet"
- **[M] Modifier** la hierarchie visuelle : cartes grandes pour evenements majeurs, compactes pour transitions, style distinct pour bonus. Tab par defaut selon temporalite
- **[C] Combiner** pagination + type d'invitation : l'invite ne voit que les evenements qui le concernent (Option A)
- **[E] Eliminer** ou minimiser "Fin de soiree — 04h — Ton lit"
- **[R] Renverser** la logique : "Voici TON programme" personnalise plutot qu'un programme generique

### Axe 4 — Boutons homepage : Solutions SCAMPER

- **[M] Modifier** les boutons pour qu'ils soient contextuels : RSVP pas fait = "Confirmer" en primaire, RSVP fait = "Voir/Modifier" en secondaire
- **[A] Adapter** la hierarchie visuelle selon la temporalite : avant deadline = RSVP dominant, apres deadline = Espace Invite dominant, apres mariage = Galerie dominante
- **[S] Substituer** le layout 3 boutons empiles par une grille adaptative (dominant en grand + 2 secondaires)
- **[C] Combiner** les boutons avec des micro-infos (sous-texte : "Repondre avant le 1er mai", "X photos", etc.)
- **[E] Eliminer** le scroll pour atteindre les boutons (reduire countdown ou CTA dans le hero)

### Axe 5 — Invitation differenciee RSVP : Solutions SCAMPER

- **[S] Substituer** le formulaire unique par un formulaire adaptatif. Nouvelle colonne `invitation_type` enum (`complet` | `vin_honneur`), defaut `complet`. Invite vin_honneur = formulaire simplifie, invite complet = formulaire actuel ameliore avec labels explicites
- **[C] Combiner** type d'invitation + en-tete RSVP personnalise (formulation positive : "Tu es invite a..."). Combiner avec programme filtre (Axe 3)
- **[A] Adapter** le panneau admin : dropdown type a la creation/modification, bulk tagging, badge colore (vert complet / orange vin_honneur), filtre par badge, compteurs discrets
- **[M] Modifier** managed guests pour heriter du type d'invitation du parent. Modifier emails de confirmation pour refleter le perimetre
- **[E] Eliminer** l'ambiguite de `present_saturday` : le sens est defini par `invitation_type` + `present_saturday`, pas besoin de colonnes supplementaires
- **[R] Renverser** la vue admin : compteurs par evenement (Ceremonie X, Vin d'honneur X, Diner X complets, Brunch X complets)

## Idea Organization and Prioritization

### Organisation thematique

**Theme 1 : Changements de schema de donnees (fondation technique)**

- Nouvelle colonne `invitation_type` (`complet` | `vin_honneur`) sur `guests`, defaut `complet`
- Synchronisation `auth.users.email` ↔ `guests.email` en action serveur unique
- Suppression de la logique `invitation_code` (code d'invitation retire)
- `invitation_type` + `present_saturday`/`present_sunday` suffisent — pas de colonnes supplementaires

**Theme 2 : Espace profil invite (`/profile/settings`)**

- Page `/profile/settings` avec sections adaptatives selon type de compte
- Changement de mot de passe avec verification ancien mot de passe (y compris pour OAuth qui peut definir un mot de passe)
- Changement d'email avec mise a jour synchronisee auth + guests
- Bouton "Ce n'est pas moi ? Changer de profil" → dialog de re-claim en une action avec migration managed guests
- Migration automatique des managed guests lors du changement de profil

**Theme 3 : Panneau admin evolue**

- Dropdown `invitation_type` a la creation ET modification d'invite
- Bulk tagging : selection multiple + action groupee sur le type d'invitation
- Badge colore (vert complet / orange vin d'honneur) + filtre par badge
- Compteurs discrets par evenement : Ceremonie X, Vin d'honneur X, Diner X, Brunch X
- Bouton "Delier le compte" pour corriger les erreurs de claim cote admin

**Theme 4 : RSVP contextuel**

- Formulaire adaptatif selon `invitation_type`
- En-tete personnalise positif : "Tu es invite(e) a..."
- Invite complet : labels explicites "Samedi 18 — Ceremonie, Vin d'honneur, Diner & Soiree" + "Dimanche 19 — Brunch"
- Invite vin_honneur : formulaire simplifie, pas de choix de jours
- Emails de confirmation refletant le perimetre d'invitation
- Managed guests heritent du type d'invitation du parent

**Theme 5 : UI Programme personnalise**

- Tabs "Samedi 18 Juillet" / "Dimanche 19 Juillet"
- Programme filtre par type d'invitation (Option A : l'invite ne voit que ses evenements)
- Hierarchie visuelle : cartes grandes (evenements majeurs), compactes (transitions), distinctes (bonus)
- Tab par defaut selon temporalite (avant/pendant/apres mariage)
- Titre personnalise "Voici ton programme"

**Theme 6 : Homepage contextuelle**

- 3 CTA maintenus, hierarchie visuelle adaptative selon temporalite et etat RSVP
- Bouton dominant change : RSVP (avant deadline) → Espace Invite (apres deadline) → Galerie (apres mariage)
- Label RSVP contextuel : "Confirmer" vs "Voir/Modifier"
- Micro-infos sous les boutons (sous-texte informatif)
- Layout grille adaptative (dominant en grand + 2 secondaires)

**Theme 7 : Flux claim-profile ameliore**

- Etape intermediaire pour profils managed : "Cette personne a deja renseigne des infos pour vous"
- Thomas peut claim son profil, le lien managed_by reste intact
- Profils deja claims (auth_id non null) invisibles dans la liste

### Prioritisation et ordre d'implementation

**Vague 1 — Fondation (dependance critique) :**

1. **Theme 1 : Schema de donnees** — Migration BDD : ajout `invitation_type`, suppression logique `invitation_code`
2. **Theme 3 : Admin evolue** — Interface admin pour gerer les types d'invitation (creation, modification, bulk tag, badges, filtres, compteurs)
3. **Theme 4 : RSVP contextuel** — Formulaire RSVP adaptatif selon type, en-tete personnalise, emails mis a jour

**Vague 2 — Ameliorations UI (en parallele) :**

4. **Theme 5 : Programme personnalise** — Tabs, hierarchie visuelle, filtrage par type d'invitation
5. **Theme 6 : Homepage contextuelle** — CTAs contextuels, temporalite, grille adaptative

**Vague 3 — Gestion de compte (independant) :**

6. **Theme 2 : Espace profil** — `/profile/settings`, changement email/mdp, bouton "Ce n'est pas moi"
7. **Theme 7 : Claim-profile ameliore** — Etape intermediaire pour profils managed, admin "Delier le compte"

### Points de vigilance techniques

- **Nettoyage de code mort** : supprimer toute la logique `invitation_code` (generation, envoi email invitation, verification) — ne pas laisser de code orphelin
- **Regression** : s'assurer que les fonctionnalites existantes (RSVP groupe, managed guests, admin CRUD, gallery, song requests) continuent de fonctionner apres chaque vague
- **Migration de donnees** : les invites existants en base doivent recevoir `invitation_type = 'complet'` par defaut lors de la migration
- **RLS** : verifier que les politiques de securite restent coherentes avec les nouvelles colonnes
- **Emails** : mettre a jour les 3 templates email (confirmation RSVP, invitation, alerte admin) pour refleter le type d'invitation

## Session Summary

**Techniques utilisees :** Question Storming → Role Playing → SCAMPER
**Decisions fermes prises :** 12 decisions cles validees par l'utilisateur
**Solutions generees :** 25+ solutions concretes organisees en 7 themes
**Ordre d'implementation :** 3 vagues avec dependances clairement identifiees

**Points de vigilance retenus par l'utilisateur :**

- Suppression complete du code mort (pas de code orphelin)
- Verification que l'application fonctionne correctement apres chaque modification
- Tests de non-regression sur les fonctionnalites existantes
