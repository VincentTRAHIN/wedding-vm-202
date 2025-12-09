# Plan de Test Manuel (QA) - Mariage V&M

Ce document décrit les scénarios de test manuel pour valider l'intégralité de l'application "Mariage V&M". Il couvre les rôles Admin et Invité.

## 1. Pré-requis & Admin (Setup)

- [x] **Connexion en tant qu'Admin** (Compte Vincent ou Mélanie).
- [x] **Accès au Dashboard Admin** : Vérifier l'accès à l'URL `/admin`.
- [x] **Ajout manuel d'invités** (Scénario de base) :
  - [x] Créer un invité "Invité Test" (avec une adresse email valide pour le test).
  - [x] Créer un invité "Invité Couple A" (avec email).
  - [x] Créer un invité "Invité Couple B" (sans lien initial, avec ou sans email).
  - [x] Créer un invité "Enfant Test" (sans email, cocher "Est un enfant").
- [x] **Vérification** : S'assurer que tous les invités créés apparaissent bien dans le tableau du Dashboard Admin.

## 2. Parcours "Invité Standard" (Happy Path)

_Pré-requis : Utiliser un compte Google dont l'email correspond exactement à l'email de "Invité Test" créé précédemment._

- [x] **Connexion** : Se connecter via Google.
- [x] **Accès Home** : Vérifier l'accès direct à la page d'accueil (Pas de redirection vers `/claim-profile`).
- [x] **Message de bienvenue** : Vérifier que le nom affiché correspond à "Invité Test".
- [x] **Remplissage RSVP** :
  - [x] Sélectionner "Présent".
  - [x] Ne pas ajouter d'accompagnant.
  - [x] Valider le formulaire.
- [x] **Vérification UI** : Le formulaire disparaît et le Résumé de la réponse s'affiche.
- [x] **Vérification Admin** : Le statut de "Invité Solo" est passé au vert (Présent) dans le Back-office.

## 3. Parcours "Invité Inconnu" (Self-Claiming)

_Pré-requis : Utiliser un compte Google dont l'email N'EST PAS dans la base de données._

- [x] **Connexion** : Se connecter via Google.
- [x] **Redirection** : Vérifier la redirection automatique vers `/claim-profile`.
- [x] **Validation vide** : Tenter de valider sans rien sélectionner (doit échouer ou être bloqué).
- [x] **Recherche** : Rechercher "Invité Couple A" dans la liste déroulante.
- [x] **Sélection** : Sélectionner "Invité Couple A".
- [x] **Validation** : Cliquer sur "C'est moi".
- [x] **Redirection** : Vérifier la redirection vers la Home après succès. --> redirection vers /rsvp donc c'est OK
- [x] **Vérification Admin** : Vérifier que "Invité Couple A" a maintenant une icône ou un indicateur "Lié/Linked" (auth_id renseigné).

## 4. Parcours "Group RSVP" (Gestion Famille & Enfants)

_Contexte : Vous êtes connecté en tant que "Invité Couple A" (suite du parcours précédent)._

- [x] **Accès RSVP** : Aller sur la page RSVP.
- [x] **Validation perso** : Valider sa propre présence.
- [x] **Ajout Adulte** : Ajouter un accompagnant Adulte ("Invité Couple B").
  - [x] Rechercher "Invité Couple B" dans la liste.
  - [x] Le sélectionner.
  - [x] **Test UI** : Vérifier que le champ Email est obligatoire.
  - [x] Saisir un email (simulation ou réel).
- [x] **Ajout Enfant** : Ajouter un accompagnant Enfant ("Enfant Test").
  - [x] Rechercher "Enfant Test" dans la liste.
  - [x] Cocher la case "Est un enfant" (si applicable dans l'ajout, ou vérifier qu'il est détecté comme tel). _Note: Si l'ajout se fait par sélection, la propriété "enfant" est peut-être déjà définie en base._
  - [x] **Test UI** : Vérifier que le champ Email est grisé/désactivé ou non requis pour l'enfant.
- [x] **Soumission** : Valider le formulaire complet.
- [x] **Vérification Résumé** : Vérifier que le résumé affiche :
  - Ma réponse (Invité Couple A).
  - La réponse du conjoint (Invité Couple B).
  - La réponse de l'enfant (Enfant Test).

## 5. Vérification des Effets de Bord (Admin & Sécurité)

- [x] **Retour Admin** : Retourner dans le Dashboard Admin.
- [x] **Vérification "Invité Couple B"** :
  - [x] Statut : Présent.
  - [x] Colonne "Validé par" : Doit afficher "Invité Couple A".
- [x] **Vérification "Enfant Test"** :
  - [x] Statut : Présent.
  - [x] Colonne "Validé par" : Doit afficher "Invité Couple A".

## 6. Galerie Photo (Social)

- [x] **Upload** : Uploader une photo > 1Mo.
  - [x] Vérifier la vitesse d'upload et la compression (si implémentée).
- [x] **Affichage** : La photo doit apparaître immédiatement dans la grille (Pas de statut "En attente" visible pour l'utilisateur, sauf si modération a priori).
- [x] **Like** : Liker la photo.
  - [x] Le cœur devient rouge.
- [x] **Commentaire** :
  - [x] Ouvrir la photo en Lightbox.
  - [x] Écrire un commentaire avec un émoji.
  - [x] Publier le commentaire.
  - [x] Vérifier qu'il s'affiche.
- [x] **Suppression** :
  - [x] Supprimer son propre commentaire (Icône poubelle visible).
  - [x] Essayer de supprimer le commentaire d'un autre utilisateur (Icône poubelle DOIT être invisible).
  - [x] **Admin** : En tant qu'Admin, supprimer n'importe quelle photo (test de modération).

## 7. Gestion des Dates (Modification RSVP)

- [x] **Accès Modification** : Sur la page RSVP (Mode Résumé), cliquer sur le bouton "Modifier ma réponse".
- [x] **Pré-remplissage** : Vérifier que le formulaire réapparaît avec les choix précédents pré-remplis.
- [x] **Modification** : Changer le statut de "Présent" à "Absent" (ou inversement).
- [x] **Sauvegarde** : Enregistrer les modifications.
- [x] **Vérification** :
  - [x] Le Résumé est mis à jour.
  - [x] Le statut dans l'Admin est mis à jour.

## 8. Admin - Gestion Avancée (Recherche & Suppression)

- [x] **Recherche Invité** :
  - [x] Saisir un nom partiel dans la barre de recherche (ex: "Test").
  - [x] Vérifier que la liste se filtre instantanément.
  - [x] Vérifier que le compteur "Liste des invités (X)" se met à jour.
- [x] **Suppression Simple** :
  - [x] Créer un invité bidon "A Supprimer".
  - [x] Cliquer sur l'icône poubelle rouge.
  - [x] Confirmer la suppression dans la modale.
  - [x] Vérifier le message de succès et la disparition de la liste.
- [x] **Suppression avec Photos (Cascade)** :
  - [x] Identifier un invité ayant posté des photos (ex: "Invité Test").
  - [x] Cliquer sur supprimer.
  - [x] Confirmer.
  - [x] Vérifier que l'invité est supprimé sans erreur.
  - [x] (Optionnel) Vérifier en base ou dans le Storage que les photos ont bien disparu.

## 9. Notifications Email (Resend)

_Pré-requis : Avoir configuré les variables d'environnement `RESEND_API_KEY` et `ADMIN_EMAILS`._

- [x] **Confirmation RSVP (Invité Principal)** :
  - [x] Modifier son RSVP ou en soumettre un nouveau.
  - [x] Vérifier la réception de l'email "Confirmation de votre réponse".
  - [x] Vérifier que le récapitulatif dans l'email est correct.
- [ ] **Invitation Accompagnant** :
  - [ ] Ajouter un nouvel accompagnant "Invité Email" avec une adresse email valide.
  - [ ] Valider le RSVP.
  - [ ] Vérifier que "Invité Email" reçoit l'email "Vous êtes invité...".
  - [ ] Vérifier que le lien "Accéder à l'Espace Invité" fonctionne.
- [ ] **Alerte Admin** :
  - [ ] Soumettre n'importe quel RSVP.
  - [ ] Vérifier que les adresses configurées dans `ADMIN_EMAILS` reçoivent l'alerte "Nouveau RSVP !".
