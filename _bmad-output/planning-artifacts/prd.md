---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - '_bmad-output/brainstorming/brainstorming-session-2026-02-01.md'
  - 'docs/cdc.md'
  - 'docs/RECAP_TRAVAUX.md'
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 2
classification:
  projectType: 'web_app'
  domain: 'general'
  complexity: 'low'
  projectContext: 'brownfield'
---

# Product Requirements Document - wedding-vm-202

**Auteur:** nitrahinio
**Date:** 2026-02-01

## Resume executif

Site de mariage pour Vincent & Melanie, construit avec SvelteKit 2 + Supabase, deploye en Node.js. L'application existante gere deja l'authentification (Google OAuth + email/mot de passe), le RSVP de groupe avec managed guests, la galerie photo, les song requests, et un panneau admin complet.

**Differenciation cle :** Introduction d'un systeme de types d'invitation (`complet` vs `vin_honneur`) qui conditionne l'ensemble de l'experience invite — formulaire RSVP adaptatif, programme filtre par jour et par type, emails personnalises, et CTAs homepage contextuels. Chaque invite ne voit et n'interagit qu'avec les evenements qui le concernent.

**Contexte brownfield :** Toutes les modifications s'appliquent sur un produit fonctionnel. Aucune vague d'implementation ne peut casser les fonctionnalites existantes. L'objectif est d'ajouter de la precision (types d'invitation) et de l'autonomie (gestion de profil self-service) sans regression.

**Public cible :** ~75 invites, ages de 25 a 70+ ans, acces principalement via smartphone (liens WhatsApp/email).

## Criteres de succes

### Succes utilisateur

- **Zero ambiguite RSVP :** Chaque invite sait exactement a quoi il est invite et ne peut repondre qu'aux evenements qui le concernent. Aucun invite ne RSVP a un evenement auquel il n'est pas convie.
- **Autonomie complete :** Un invite peut modifier son mot de passe, son email, et corriger une erreur de profil sans contacter les maries.
- **Navigation fluide :** Le programme est lisible immediatement (tabs par jour, evenements filtres par type d'invitation). La homepage guide naturellement vers l'action prioritaire.
- **Parcours sans friction :** De l'inscription au RSVP, aucune etape ne genere de confusion — y compris pour les profils managed, les invites OAuth, et les invites vin d'honneur.

### Succes admin (les maries)

- **Visibilite instantanee :** En un coup d'oeil, savoir combien d'invites viennent a chaque evenement (ceremonie, vin d'honneur, diner, brunch) grace aux compteurs et badges.
- **Gestion autonome :** Pouvoir tagger les types d'invitation (unitaire ou en masse), delier un compte, modifier un invite — sans intervention en BDD.
- **Information complete :** Toutes les reponses RSVP sont clairement interpretables selon le type d'invitation de chaque invite.

### Succes technique

- **Zero regression :** Toutes les fonctionnalites existantes (RSVP groupe, managed guests, galerie, song requests, admin CRUD) continuent de fonctionner apres chaque modification.
- **Code propre et maintenable :** Suppression complete du code mort (invitation_code), pas de code orphelin, ameliorations de qualite si pertinentes.
- **Schema de donnees coherent :** La nouvelle colonne `invitation_type` s'integre proprement, les RLS restent valides, la synchronisation email auth/guests est fiable.

### Resultats mesurables

- 100% des invites vin d'honneur ne voient que les evenements qui les concernent
- 0 intervention BDD necessaire pour les operations courantes (correction profil, changement type invitation)
- Les 3 templates email refletent correctement le type d'invitation
- `make qa` (lint + type check) passe sans erreur apres chaque vague d'implementation

## Perimetre et cadrage

### Strategie MVP

**Approche :** MVP d'amelioration progressive — le produit fonctionne deja. L'objectif est d'ajouter une couche de differenciation (types d'invitation) et d'autonomie (gestion de profil) a un systeme operationnel.

**Ressources :** Developpeur unique (nitrahinio), intermediate. Pas d'equipe, pas de deadline externe stricte au-dela du mariage (juillet 2026). Le rythme est auto-gere.

**Contrainte critique :** Chaque vague doit laisser l'application dans un etat fonctionnel et deployable. Aucune vague ne peut casser les fonctionnalites existantes.

### Parcours utilisateur couverts

- Monique (invite complet) : RSVP adaptatif + en-tete personnalise + email de confirmation adapte
- Kevin (vin d'honneur) : RSVP simplifie + programme filtre + email adapte
- Sophie & Thomas (famille) : RSVP groupe + claim-profile managed avec etape intermediaire
- Lucas (erreur de profil) : self-service "Ce n'est pas moi" + re-claim
- Vincent (admin) : creation/modification type invitation, bulk tagging, badges, filtres, compteurs, delier compte

### Vague 1 — Fondation critique (dependances en chaine)

| Fonctionnalite | Justification |
| --- | --- |
| Migration BDD : `invitation_type` enum + suppression `invitation_code` | Prerequis pour tout le reste — sans cette colonne, rien ne fonctionne |
| Admin : type invitation a la creation/modification | Les maries doivent pouvoir tagger les invites avant que les RSVP ne commencent |
| Admin : bulk tagging, badges colores, filtres, compteurs | Gestion efficace de 75+ invites |
| RSVP : formulaire adaptatif selon `invitation_type` | Coeur du probleme — Kevin ne doit pas voir le diner |
| RSVP : en-tete personnalise positif | Clarifier le perimetre d'invitation des le premier regard |
| Emails : 3 templates adaptes au type d'invitation | La confirmation doit refleter ce a quoi l'invite est convie |
| Nettoyage : suppression complete du code `invitation_code` | Code mort = dette technique immediate |

### Vague 2 — Ameliorations UI (parallele)

| Fonctionnalite | Justification |
| --- | --- |
| Programme : tabs Jour 1/Jour 2 | Lisibilite immediate vs scroll infini |
| Programme : filtrage par type d'invitation | Kevin ne voit pas le diner/brunch |
| Programme : hierarchie visuelle (evenements majeurs/mineurs) | Differencier ceremonie (carte grande) de "ouverture des portes" (carte petite) |
| Homepage : CTAs contextuels selon etat RSVP | "Confirmer" → "Voir/Modifier" apres RSVP |

### Vague 3 — Gestion de compte (independant)

| Fonctionnalite | Justification |
| --- | --- |
| `/profile/settings` : modification email | Autonomie utilisateur |
| `/profile/settings` : modification/creation mot de passe (y compris OAuth) | Coexistence OAuth + mot de passe |
| `/profile/settings` : "Ce n'est pas moi" + re-claim | Self-service pour erreur de profil (Lucas) |
| Claim-profile : etape intermediaire pour profils managed | Thomas confirme le lien sans perdre le managed_by |
| Admin : "Delier le compte" | Fallback admin pour les erreurs de claim |

### Post-MVP (Phase 2 — Croissance)

- Indicateur de progression temps reel le jour J sur le programme
- Homepage evolutive selon la temporalite (avant/pendant/apres mariage)
- Historique des changements de profil visible dans l'admin

### Vision (Phase 3 — Expansion)

- Programme interactif avec notifications push le jour J
- Dashboard admin avec analytics (taux de reponse RSVP, evolution dans le temps)

### Strategie d'attenuation des risques

**Risques techniques :**
- *Migration BDD* : Tester sur staging avant production. La colonne `invitation_type` avec valeur par defaut `complet` permet une migration non-destructive.
- *RLS* : Verifier que les policies restent valides apres l'ajout de la nouvelle colonne. Tester chaque role (invite, admin, anonyme).
- *Synchronisation email auth/guests* : La modification d'email dans `/profile/settings` doit mettre a jour `auth.users` ET `guests.email` de maniere atomique via le service role client.
- *Zero regression* : `make qa` apres chaque vague. Tests manuels des parcours critiques.

**Risques produit :**
- *Confusion invitation_type* : L'en-tete RSVP personnalise et le programme filtre sont les deux gardes-fous. Si un invite vin d'honneur voit un evenement qui ne le concerne pas, c'est un bug bloquant.
- *Changement de type en cours de route* : L'ancien RSVP est conserve et les nouvelles options s'ajoutent. Pas de perte de donnees.

**Risques de ressources :**
- *Developpeur unique* : L'ordre des vagues minimise les dependances. La Vague 3 peut etre reportee sans impact sur l'experience RSVP/programme.
- *Perimetre minimal* : En cas de contrainte forte, seule la Vague 1 est strictement necessaire.

## Parcours utilisateur

### Parcours 1 : Tante Monique — L'invitee complete qui decouvre le site

**Persona :** Monique, 62 ans, tante de Melanie. Smartphone Android, utilise surtout WhatsApp. Son mari Gerard n'a pas de compte email. Invites a tout (ceremonie, vin d'honneur, diner, brunch).

**Scene d'ouverture :** Monique recoit un message WhatsApp de Melanie avec le lien du site. Elle ouvre le lien, voit la photo du couple, le compte a rebours. Elle descend et voit trois boutons. Le bouton RSVP est mis en avant avec le sous-texte "Repondre avant le 1er mai". Elle comprend immediatement quoi faire.

**Action montante :** Monique clique sur "Confirmer Ta Presence". Elle est redirigee vers la page de connexion. Elle s'inscrit avec son email et un mot de passe. Elle arrive sur le claim-profile, tape "Monique", se trouve dans la liste, selectionne son nom et valide. Elle est redirigee vers le RSVP. En haut du formulaire, un en-tete chaleureux lui indique : "Tu es invitee a celebrer notre mariage le samedi 18 et dimanche 19 juillet — ceremonie, vin d'honneur, diner, soiree et brunch !" Elle comprend exactement a quoi elle est conviee. Elle coche "Oui", voit les labels explicites "Samedi 18 — Ceremonie, Vin d'honneur, Diner & Soiree" et "Dimanche 19 — Brunch". Elle ajoute Gerard comme accompagnant (pas d'email, pas un enfant). Elle ajoute "intolerant au lactose" pour Gerard. Elle valide.

**Climax :** Monique recoit un email de confirmation qui recapitule : "Monique — presente samedi et dimanche. Gerard — present samedi et dimanche (intolerant au lactose)." Elle est rassuree, tout est clair.

**Resolution :** Deux semaines plus tard, Monique revient sur le site. Sur la homepage, le bouton RSVP affiche maintenant "Voir / Modifier mon RSVP". Elle va sur le programme, voit les tabs "Samedi 18 Juillet" / "Dimanche 19 Juillet", clique sur Samedi, et trouve immediatement "Ouverture des portes — 15h00". Elle sait quand arriver.

### Parcours 2 : Kevin — L'invite vin d'honneur uniquement

**Persona :** Kevin, 30 ans, collegue de bureau de Vincent. iPhone, tech-savvy. Invite uniquement au vin d'honneur. Vient seul.

**Scene d'ouverture :** Kevin recoit un email d'invitation. Il ouvre le lien, voit la homepage. Le bouton RSVP est dominant avec "Repondre avant le 1er mai". Il clique, se connecte via Google OAuth en 2 secondes, claim son profil "Kevin Moreau", et arrive sur le RSVP.

**Action montante :** En haut du formulaire RSVP, Kevin lit : "Tu es invite a notre ceremonie et vin d'honneur le samedi 18 juillet !" Le formulaire est simplifie — pas de checkbox samedi/dimanche, juste "Present / Absent". Kevin comprend immediatement son perimetre. Il coche "Present", ajoute "aucune restriction" et valide.

**Climax :** Kevin va sur le programme. Il voit uniquement le tab "Samedi 18 Juillet" (le dimanche n'apparait pas pour lui). Sur le samedi, il ne voit que les evenements qui le concernent : "Ouverture des portes — 15h00", "Ceremonie — 15h30", "Vin d'honneur — 17h30". Le titre en haut dit "Ton programme". Pas de diner, pas de bal — aucun malaise. Il sait exactement quand venir et quand partir.

**Resolution :** Kevin recoit un email de confirmation : "Tu as confirme ta presence a la ceremonie et au vin d'honneur le samedi 18 juillet." Sur la homepage, le bouton RSVP affiche maintenant "Voir mon RSVP". Tout est clair et respectueux.

### Parcours 3 : Sophie & Thomas — La famille complete

**Persona :** Sophie, 32 ans, et Thomas, 34 ans, amis proches. Deux enfants : Emma (7 ans) et Leo (3 ans). Invites a tout. Sophie gere le compte principal.

**Scene d'ouverture :** Sophie s'inscrit par email/password et claim son profil "Sophie Marchand". Elle arrive sur le RSVP, voit l'en-tete complet et coche Present pour elle. Elle ajoute Thomas (adulte, avec email), Emma (enfant, pas d'email) et Leo (enfant, pas d'email).

**Action montante :** Sophie remplit le RSVP pour les 4 : tous presents samedi et dimanche. Elle ajoute "allergie aux noix" pour Emma et "pas de fruits de mer" pour Leo. Elle valide. Thomas recoit une notification qu'il a ete ajoute au groupe.

**Rebondissement :** Thomas decide de creer son propre compte pour acceder au site, voir le programme, et pouvoir uploader des photos le jour J. Il s'inscrit via Google OAuth, arrive sur claim-profile. Il voit "Thomas Marchand" dans la liste. Le systeme detecte que ce profil est deja gere par Sophie et affiche : "Sophie a deja renseigne des informations pour toi. Confirmes-tu vouloir lier ce profil a ton compte ?" Thomas confirme. Son lien managed_by reste intact — Sophie garde la gestion du RSVP groupe. Mais Thomas a maintenant son propre acces au site, au programme, a la galerie, et peut modifier son RSVP individuellement s'il le souhaite.

**Climax :** Le jour du mariage, Thomas uploade des photos depuis son propre compte dans la galerie. Sophie consulte le programme depuis le sien — les tabs Samedi/Dimanche sont clairs, les evenements majeurs (ceremonie, diner) sont bien visibles avec des cartes grandes.

**Resolution :** Apres le mariage, la homepage a evolue : le bouton "Galerie" est maintenant dominant. Sophie et Thomas partagent leurs photos.

### Parcours 4 : Lucas — L'erreur de claim-profile

**Persona :** Lucas, 25 ans, cousin de Melanie. Tech-savvy, Google OAuth. Invite a tout. Selectionne le mauvais nom par erreur.

**Scene d'ouverture :** Lucas se connecte via Google OAuth, arrive sur claim-profile. Il tape "Lucas", voit deux resultats : "Lucas Durand" et "Lucas Petit". Il clique vite sur "Lucas Durand" sans verifier le nom de famille. Valide.

**Action montante :** Lucas est redirige vers le RSVP. Il voit "Lucas Durand" en haut et fait son RSVP (Present, samedi + dimanche). Il va sur le dashboard et voit "Bienvenue Lucas Durand". Il realise son erreur.

**Climax (self-service) :** Lucas va dans son espace profil (/profile/settings). Il voit une section "Mon profil invite" affichant "Lucas Durand". A cote, un lien "Ce n'est pas moi ? Changer de profil". Il clique. Un dialog s'ouvre : "Tu es actuellement lie a Lucas Durand. Choisis ton vrai profil :" La liste des profils disponibles (non-revendiques) apparait. Il voit "Lucas Petit", le selectionne. Un avertissement s'affiche : "Ton RSVP sur l'ancien profil sera reinitialise. Tu devras refaire ton RSVP." Il confirme. Le changement est instantane — le profil "Lucas Durand" redevient disponible et Lucas est maintenant lie a "Lucas Petit".

**Resolution :** Lucas refait son RSVP en 30 secondes sous le bon profil. Le vrai Lucas Durand peut maintenant s'inscrire et trouver son nom dans la liste. Aucun appel aux maries n'a ete necessaire.

**Parcours alternatif (cote admin) :** Si Lucas contacte les maries, Vincent va dans /admin/guests, trouve le profil "Lucas Durand", clique "Delier le compte". Le profil est reinitialise. Lucas, a sa prochaine connexion, retombe automatiquement sur /claim-profile et peut choisir le bon nom.

### Parcours 5 : Admin (Vincent) — Gestion des invites et des types d'invitation

**Persona :** Vincent, le marie, admin du site. Gere la liste complete des invites, les chambres, surveille les RSVP.

**Scene d'ouverture :** Vincent ouvre /admin/guests. Il ajoute ses invites un par un : nom, email, et pour chacun il selectionne le type d'invitation dans un dropdown — "Complet" ou "Vin d'honneur". La plupart sont "Complet" (c'est le defaut).

**Action montante :** Vincent a ajoute 60 invites "complet" individuellement mais doit encore ajouter 15 collegues tous invites au vin d'honneur uniquement. Il les ajoute, puis selectionne les 15 dans la liste (selection multiple), clique sur l'action groupee "Definir le type d'invitation" et choisit "Vin d'honneur". Les 15 sont tagges en un clic. Dans la liste, des badges colores apparaissent a cote de chaque nom : vert pour "Complet", orange pour "Vin d'honneur". En haut de la liste, les compteurs affichent : "60 complets - 15 vin d'honneur - 75 total".

**Climax :** Les RSVP commencent a rentrer. Vincent filtre la liste par "Vin d'honneur" pour voir lesquels n'ont pas encore repondu. Il filtre par "Complet" + "Present" pour avoir le decompte des repas du diner. Les compteurs par evenement donnent instantanement : "Ceremonie : 52 confirmes - Vin d'honneur : 58 confirmes - Diner : 42 confirmes (complets uniquement) - Brunch : 38 confirmes". Il transmet ces chiffres au traiteur sans aucun calcul manuel.

**Rebondissement :** Une place se libere au diner. Vincent change le type d'invitation de Kevin de "Vin d'honneur" a "Complet". L'ancien RSVP est conserve et les nouvelles options apparaissent dans le formulaire de Kevin. Vincent previent Kevin par WhatsApp.

**Resolution :** Un invite appelle : il s'est trompe de profil. Vincent clique "Delier le compte" dans l'admin. C'est fait en un clic.

### Tracabilite parcours → capacites

| Capacite | Parcours source |
| --- | --- |
| RSVP adaptatif selon invitation_type | Kevin, Monique |
| En-tete RSVP personnalise positif | Kevin, Monique, Sophie |
| Programme filtre par type d'invitation (tabs) | Kevin, Monique, Sophie |
| Hierarchie visuelle des evenements | Sophie, Monique |
| CTAs homepage contextuels (etat + temporalite) | Monique, Kevin, Sophie |
| Self-service "Ce n'est pas moi" + re-claim | Lucas |
| Admin "Delier le compte" | Lucas, Admin |
| Etape intermediaire claim-profile pour managed | Sophie & Thomas |
| Coexistence managed_by + compte propre | Sophie & Thomas |
| Espace profil /profile/settings | Lucas, Monique |
| Bulk tagging type d'invitation | Admin |
| Badges colores + filtres + compteurs | Admin |
| Changement type invitation (conservation RSVP) | Admin |
| Emails adaptes au type d'invitation | Kevin, Monique, Sophie |
| Suppression logique invitation_code | Tous (nettoyage) |

## Exigences specifiques Web App

### Vue d'ensemble

Application web SvelteKit 2 en mode SSR hybride (server-side rendering + navigation client-side). Site prive a acces authentifie, principalement utilise sur mobile via des liens partages (WhatsApp, email). Le public cible va de 25 a 70+ ans, ce qui impose une UI claire et lisible sans complexite inutile.

### Considerations d'architecture technique

**Rendu et routage :**
- SvelteKit SSR avec `adapter-node` pour le deploiement serveur
- Pages protegees forcent le SSR via `+page.server.ts` (load functions) pour garantir l'authentification cote serveur
- Navigation client-side fluide entre les pages authentifiees
- Form actions SvelteKit avec `enhance` pour les soumissions sans rechargement

**Authentification :**
- Supabase Auth avec double methode : Google OAuth + email/mot de passe
- Les deux methodes coexistent — un utilisateur OAuth peut aussi definir un mot de passe
- Sessions cookie-based, validation JWT via `safeGetSession()`
- Service role client pour les operations admin (bypass RLS)

**Base de donnees :**
- PostgreSQL via Supabase avec Row-Level Security (RLS)
- Nouvelle colonne `invitation_type` (enum : `complet` | `vin_honneur`) sur la table `guests`
- Pattern managed guests (`managed_by_id`) pour les groupes familiaux
- Types auto-generes via `make types`

### Matrice navigateurs

| Navigateur | Support | Notes |
| --- | --- | --- |
| Chrome (mobile + desktop) | Prioritaire | Majorite du trafic attendu |
| Safari (iOS) | Prioritaire | Invites iPhone |
| Firefox | Supporte | Tests reguliers |
| Edge | Supporte | Base Chromium |
| IE11 | Non supporte | Hors perimetre |

### Design responsive

- **Mobile-first** : conception prioritaire pour smartphone (acces via lien WhatsApp)
- Tailwind CSS 3 avec breakpoints standards (`sm`, `md`, `lg`)
- Composants Bits UI adaptatifs
- Tabs du programme (Jour 1 / Jour 2) optimises pour le tactile
- Formulaire RSVP utilisable confortablement sur ecran 375px+

### Objectifs de performance

- **First Contentful Paint** < 1.5s sur mobile 4G
- **SSR** pour le contenu initial (pas de loading spinner au premier chargement)
- Images optimisees pour la galerie photo (compression + lazy loading existants)
- Pas de bundle JavaScript excessif — SvelteKit tree-shake naturellement
- Keep-alive deja implemente pour eviter les cold starts

### Strategie SEO

Non applicable — site prive avec authentification obligatoire. Aucune action SEO requise.

### Niveau d'accessibilite

- **Cible** : WCAG 2.1 niveau AA sur les parcours critiques
- **Parcours prioritaires** : inscription, claim-profile, RSVP, programme, profil/settings
- Bits UI fournit les bases ARIA (roles, labels, focus management)
- Contrastes respectes via le theme Sage/Stone/Bordeaux (variables HSL)
- Tailles de police lisibles pour le public 60+ ans
- Navigation au clavier fonctionnelle sur les formulaires

## Exigences fonctionnelles

### Gestion des types d'invitation

- FR1 : L'admin peut attribuer un type d'invitation (complet ou vin d'honneur) a chaque invite lors de la creation
- FR2 : L'admin peut modifier le type d'invitation d'un invite existant
- FR3 : L'admin peut attribuer un type d'invitation en masse a une selection d'invites
- FR4 : Le systeme attribue "complet" comme type d'invitation par defaut pour tout nouvel invite

### RSVP adaptatif

- FR5 : L'invite peut voir un formulaire RSVP adapte a son type d'invitation
- FR6 : L'invite complet peut repondre separement pour chaque jour/bloc d'evenements (samedi : ceremonie + vin d'honneur + diner/soiree ; dimanche : brunch)
- FR7 : L'invite vin d'honneur peut repondre uniquement pour la ceremonie et le vin d'honneur
- FR8 : L'invite peut voir un en-tete personnalise indiquant les evenements auxquels il est convie
- FR9 : L'invite peut ajouter des accompagnants (adultes ou enfants) a son RSVP
- FR10 : L'invite peut specifier des restrictions alimentaires pour lui-meme et ses accompagnants
- FR11 : L'invite gerant un groupe peut soumettre le RSVP pour tous ses membres manages en une seule action
- FR12 : L'invite ayant un lien managed_by peut modifier individuellement son propre RSVP s'il dispose d'un compte
- FR13 : Le systeme conserve les donnees RSVP existantes lorsque l'admin change le type d'invitation d'un invite et ajoute les nouvelles options

### Programme evenementiel

- FR14 : L'invite peut consulter le programme organise par jour via des onglets (Samedi / Dimanche)
- FR15 : L'invite vin d'honneur ne voit que les evenements auxquels il est invite dans le programme
- FR16 : L'invite complet peut voir l'ensemble des evenements dans le programme
- FR17 : Le programme affiche les evenements avec une hierarchie visuelle (evenements majeurs en avant, evenements secondaires en retrait)

### Gestion de profil invite

- FR18 : L'invite peut modifier son adresse email depuis ses parametres de profil
- FR19 : L'invite peut modifier son mot de passe depuis ses parametres de profil
- FR20 : L'invite authentifie via OAuth peut creer un mot de passe pour activer la connexion email/mot de passe
- FR21 : L'invite peut initier un changement de profil ("Ce n'est pas moi") depuis ses parametres
- FR22 : L'invite changeant de profil peut selectionner parmi les profils invites disponibles (non revendiques)
- FR23 : Le systeme reinitialise le RSVP de l'ancien profil lorsqu'un invite change de profil lie

### Association de profil (claim-profile)

- FR24 : Le nouvel utilisateur authentifie peut rechercher et selectionner son profil invite dans la liste
- FR25 : Le systeme detecte lorsqu'un profil selectionne est deja gere par un autre invite (managed_by)
- FR26 : Le systeme affiche une etape de confirmation intermediaire pour les profils managed
- FR27 : L'invite confirmant la revendication d'un profil managed conserve la relation managed_by existante

### Administration des invites

- FR28 : L'admin peut voir des badges colores indiquant le type d'invitation a cote de chaque invite
- FR29 : L'admin peut filtrer la liste des invites par type d'invitation
- FR30 : L'admin peut voir des compteurs agreges par type d'invitation et statut RSVP
- FR31 : L'admin peut voir des compteurs par evenement (ceremonie, vin d'honneur, diner, brunch)
- FR32 : L'admin peut delier un compte invite (reinitialiser le lien auth) pour permettre un re-claim
- FR33 : L'admin peut effectuer toutes les operations existantes sur les invites (creer, modifier, supprimer)

### Notifications email

- FR34 : Le systeme envoie un email de confirmation RSVP adapte au type d'invitation de l'invite
- FR35 : Le systeme envoie un email d'invitation adapte au type d'invitation de l'invite
- FR36 : Le systeme envoie un email d'alerte admin avec le contexte du type d'invitation

### Homepage et navigation

- FR37 : La homepage affiche un CTA contextuel selon l'etat RSVP de l'invite (pas encore repondu → "Confirmer" / deja repondu → "Voir/Modifier")
- FR38 : La homepage affiche trois boutons d'action (RSVP, Programme, Galerie)

### Nettoyage technique

- FR39 : Le systeme supprime l'integralite du code et des donnees lies a `invitation_code`

## Exigences non-fonctionnelles

### Performance

- NFR1 : Les pages protegees se chargent en moins de 2 secondes sur une connexion mobile 4G (incluant SSR + hydration)
- NFR2 : Les soumissions de formulaire (RSVP, profil) retournent un feedback visuel en moins de 1 seconde
- NFR3 : Le programme avec onglets se charge sans delai perceptible lors du changement de tab (donnees deja presentes cote client)
- NFR4 : La galerie photo utilise le lazy loading pour ne pas impacter le temps de chargement initial
- NFR5 : Aucune page ne depasse 200KB de JavaScript cote client (hors images)

### Securite

- NFR6 : Toute authentification utilise exclusivement `safeGetSession()` avec validation JWT — jamais `getSession()` brut
- NFR7 : Les operations admin sont protegees par verification du role `admin` en base de donnees a chaque requete
- NFR8 : Les Row-Level Security policies empechent tout acces non autorise aux donnees d'autres invites
- NFR9 : La modification d'email met a jour `auth.users` et `guests.email` de maniere atomique via le service role client
- NFR10 : Les inputs utilisateur sont valides cote serveur via Zod et sanitises avant insertion en base
- NFR11 : Le rate limiting est applique sur les endpoints sensibles (login, register, RSVP submit, password change)
- NFR12 : Les variables d'environnement sensibles (`SERVICE_ROLE_KEY`, `RESEND_API_KEY`) ne sont jamais exposees cote client
- NFR13 : Les headers de securite (CSP, X-Frame-Options, etc.) sont appliques en production

### Fiabilite

- NFR14 : Le keep-alive previent les cold starts du serveur Node.js pour garantir une disponibilite continue
- NFR15 : Les erreurs serveur (500) affichent une page d'erreur user-friendly sans exposer de details techniques
- NFR16 : La soumission RSVP est idempotente — une double soumission ne cree pas de donnees dupliquees
- NFR17 : Le changement de profil ("Ce n'est pas moi") est atomique — pas d'etat intermediaire ou l'invite serait sans profil

### Maintenabilite

- NFR18 : `make qa` (lint + type check) passe sans erreur apres chaque modification
- NFR19 : Les types Supabase sont regeneres (`make types`) apres toute modification du schema
- NFR20 : Aucun code mort ne subsiste apres l'implementation (suppression complete de `invitation_code` et tout code orphelin)
- NFR21 : Les validations Zod sont centralisees dans `$lib/server/validation.ts` et reutilisees dans tous les form actions
- NFR22 : Les templates email sont maintenus comme composants Svelte dans `$lib/emails/` avec un rendu previsible
