# ✅ Checklist de Tests Pré-Lancement

**Date**: 17 janvier 2026

## 🔐 Tests de Sécurité

### Variables d'Environnement

- [ ] `.env` existe et contient toutes les clés
- [ ] `.env` est dans `.gitignore`
- [ ] Toutes les variables sont configurées en production
- [ ] `ORIGIN` pointe vers le domaine de production
- [ ] `NODE_ENV=production` en prod

### Authentification

- [ ] Code d'accès mariage fonctionne (`/unlock`)
- [ ] Code incorrect rejeté
- [ ] Cookie `wedding_pass` persiste 30 jours
- [ ] Redirection vers `/unlock` si pas de cookie
- [ ] Inscription email/password fonctionne
- [ ] Email invalide rejeté
- [ ] Password < 8 chars rejeté
- [ ] Connexion Google OAuth fonctionne
- [ ] Redirection après OAuth vers `/`
- [ ] Déconnexion efface la session

### Authorization

- [ ] Non-authentifié redirigé vers `/login`
- [ ] User normal ne peut pas accéder `/admin`
- [ ] Admin peut accéder `/admin`
- [ ] Routes publiques accessibles: `/health`, `/unlock`

---

## 👥 Tests Fonctionnels - Invité

### Inscription & Profil

- [ ] Nouvel invité peut s'inscrire avec email
- [ ] Invité pré-seedé peut lier son compte
- [ ] Email déjà utilisé montre erreur appropriée
- [ ] Profil créé avec role='guest'
- [ ] Dashboard accessible après inscription

### RSVP

- [ ] Accès page `/rsvp`
- [ ] Voir son propre statut
- [ ] Changer statut (présent/absent)
- [ ] Ajouter restrictions alimentaires
- [ ] Voir liste d'invités éligibles
- [ ] Ajouter invité géré
- [ ] Supprimer invité géré
- [ ] Email confirmation reçu après soumission
- [ ] Admin reçoit email de notification

### Dashboard

- [ ] Voir récapitulatif événement
- [ ] Voir lieu du mariage
- [ ] Voir informations brunch
- [ ] Voir chambre attribuée (si assigné)
- [ ] Voir guide local
- [ ] Voir contacts SOS
- [ ] Voir météo & dress code
- [ ] Ajouter demande de chanson
- [ ] Voir liste des demandes de chansons

### Galerie

- [ ] Voir photos approuvées
- [ ] Upload photo (formats: jpg, png, webp)
- [ ] Photo > 10MB rejetée
- [ ] Format invalide rejeté
- [ ] Ajouter légende (max 500 chars)
- [ ] Voir ses propres photos immédiatement
- [ ] Liker une photo
- [ ] Unliker une photo
- [ ] Ajouter commentaire
- [ ] Voir commentaires avec noms
- [ ] Supprimer son propre commentaire
- [ ] Supprimer sa propre photo

### Programme

- [ ] Voir timeline du mariage
- [ ] Toutes les informations visibles

---

## 👨‍💼 Tests Fonctionnels - Admin

### Accès Admin

- [ ] Login avec compte admin
- [ ] Accès `/admin` autorisé
- [ ] Menu admin visible

### Gestion Invités

- [ ] Voir liste complète des invités
- [ ] Ajouter nouvel invité
- [ ] Modifier invité existant
- [ ] Supprimer invité (avec confirmation)
- [ ] Voir statuts RSVP
- [ ] Filtrer/rechercher invités
- [ ] Assigner chambre à invité

### Gestion Contenu

- [ ] Éditer contenu site (local guide, etc.)
- [ ] Sauvegarder modifications
- [ ] Modifications visibles sur dashboard invité

### Gestion Chambres

- [ ] Voir liste des chambres
- [ ] Ajouter nouvelle chambre
- [ ] Modifier chambre existante
- [ ] Voir capacité et occupants

### Demandes Chansons

- [ ] Voir toutes les demandes
- [ ] Filtrer par date
- [ ] Export possible (copier/coller)

### Galerie Admin

- [ ] Voir toutes les photos (approved + pending)
- [ ] Approuver photo
- [ ] Rejeter photo
- [ ] Supprimer n'importe quelle photo
- [ ] Supprimer n'importe quel commentaire

---

## 📧 Tests Emails

### Configuration

- [ ] `RESEND_API_KEY` valide
- [ ] `SENDER_EMAIL` configuré et vérifié
- [ ] `ADMIN_EMAILS` liste correcte

### Envois

- [ ] RSVP confirmation reçu par invité
- [ ] Email contient bon nom et statut
- [ ] Admin alert reçu après RSVP
- [ ] Email admin contient détails
- [ ] Invitation invité géré reçue
- [ ] Pas d'erreur dans logs serveur

---

## 🎨 Tests UI/UX

### Responsive Mobile

- [ ] `/unlock` - formulaire correct
- [ ] `/login` - formulaire correct
- [ ] `/register` - formulaire correct
- [ ] `/dashboard` - cards empilées
- [ ] `/rsvp` - formulaire utilisable
- [ ] `/gallery` - grille adaptée
- [ ] `/programme` - timeline lisible
- [ ] `/admin/*` - tableaux scrollables

### Navigation

- [ ] Menu principal visible
- [ ] Logo/titre cliquable
- [ ] Breadcrumbs (si présents)
- [ ] Bouton retour fonctionne
- [ ] Liens footer fonctionnels

### Formulaires

- [ ] Messages d'erreur clairs
- [ ] Messages de succès visibles
- [ ] Loading states pendant soumission
- [ ] Boutons désactivés pendant traitement
- [ ] Focus sur champ erreur

### Accessibilité

- [ ] Navigation clavier possible
- [ ] Labels sur tous les inputs
- [ ] Contraste texte suffisant
- [ ] Images ont attribut alt
- [ ] Formulaires ont structure sémantique

---

## ⚡ Tests Performance

### Temps de Chargement

- [ ] Page d'accueil < 2s
- [ ] Dashboard < 3s
- [ ] Galerie < 3s (même avec 50+ photos)
- [ ] Admin < 3s

### Images

- [ ] Images compressées automatiquement
- [ ] Lazy loading actif
- [ ] Formats optimaux (webp si possible)
- [ ] Pas d'images > 5MB chargées

### Requêtes

- [ ] Pas de N+1 queries visibles
- [ ] Pagination si > 100 items
- [ ] Cache utilisé où approprié

---

## 🔒 Tests Sécurité Avancés

### Headers HTTP

- [ ] `X-Frame-Options: DENY` présent (prod)
- [ ] `X-Content-Type-Options: nosniff` présent
- [ ] `Content-Security-Policy` présent
- [ ] Cookies `httpOnly` pour sessions
- [ ] Cookies `secure` en production

### Injection

- [ ] SQL Injection impossible (Supabase ORM)
- [ ] XSS: HTML échappé dans commentaires
- [ ] XSS: Légendes photos échappées
- [ ] CSRF: Tokens SvelteKit actifs
- [ ] Path traversal impossible (upload paths)

### Rate Limiting (si implémenté)

- [ ] Upload photos limité (ex: 10/min)
- [ ] Commentaires limités (ex: 20/min)
- [ ] Login attempts limités

---

## 🗄️ Tests Base de Données

### Supabase Dashboard

- [ ] Se connecter au projet Supabase
- [ ] Vérifier toutes les tables existent
- [ ] Vérifier seed data présent
- [ ] Policies RLS actives (icône cadenas)

### Backups

- [ ] Backups automatiques activés
- [ ] Tester restauration (environnement test)
- [ ] Point de restauration disponible

### Migrations

- [ ] Toutes migrations appliquées
- [ ] Pas d'erreur dans logs migrations
- [ ] Schema à jour avec types TypeScript

---

## 🌐 Tests Navigateurs

### Desktop

- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Safari (dernière version)
- [ ] Edge (dernière version)

### Mobile

- [ ] Safari iOS (iPhone)
- [ ] Chrome Android
- [ ] Samsung Internet

### Cas Edge

- [ ] Navigation privée
- [ ] Bloqueur pub activé
- [ ] Cookies tiers bloqués
- [ ] JavaScript partiellement bloqué

---

## 📱 Tests Offline/Réseau

### Connexion Lente

- [ ] Formulaires utilisables avec 3G
- [ ] Messages de loading visibles
- [ ] Timeouts gérés gracefully
- [ ] Pas de double soumission

### Déconnexion

- [ ] Message approprié si API down
- [ ] Retry automatique (si implémenté)
- [ ] Pas de crash application

---

## 🚀 Tests Déploiement

### Build Production

- [ ] `npm run build` sans erreur
- [ ] Bundle size raisonnable (< 500KB JS)
- [ ] CSS extracted
- [ ] Source maps générées

### Environnement Production

- [ ] Variables d'environnement correctes
- [ ] HTTPS forcé
- [ ] Redirections HTTP -> HTTPS
- [ ] WWW vs non-WWW cohérent
- [ ] `/health` endpoint accessible

### Monitoring

- [ ] Logs accessibles
- [ ] Alertes configurées (si Sentry/autre)
- [ ] Uptime monitoring actif
- [ ] Dashboard Supabase consulté

---

## 📊 Tests Analytics (Optionnel)

- [ ] Google Analytics configuré
- [ ] Events trackés (RSVP, upload photo)
- [ ] Funnel visualisé
- [ ] Privacy policy à jour

---

## ✅ Validation Finale

### Scénarios Complets

#### Scénario 1: Nouvel Invité

1. [ ] Reçoit invitation (email ou autre)
2. [ ] Visite site, voit `/unlock`
3. [ ] Entre code mariage, redirigé vers `/login`
4. [ ] Clique "S'inscrire"
5. [ ] Remplit formulaire, compte créé
6. [ ] Voit dashboard personnalisé
7. [ ] Va sur `/rsvp`, confirme présence
8. [ ] Reçoit email confirmation

#### Scénario 2: Invité Existant

1. [ ] Visite site, entre code mariage
2. [ ] Se connecte avec email/password
3. [ ] Voit dashboard avec infos
4. [ ] Upload photo dans galerie
5. [ ] Commente photo d'un autre
6. [ ] Ajoute demande chanson
7. [ ] Se déconnecte

#### Scénario 3: Admin

1. [ ] Se connecte avec compte admin
2. [ ] Accède `/admin/guests`
3. [ ] Ajoute nouvel invité
4. [ ] Assigne chambre
5. [ ] Va sur `/admin/content`
6. [ ] Modifie guide local
7. [ ] Vérifie changements sur dashboard invité

---

## 🎯 Critères de Succès

**L'application est prête si**:

- ✅ Tous les tests "Critique" passent
- ✅ 90%+ des tests "Important" passent
- ✅ Aucun bug bloquant identifié
- ✅ Performance acceptable (< 3s)
- ✅ Sécurité validée (RLS, validation, headers)
- ✅ Emails fonctionnels

**Nice to Have**:

- Tous tests "Optionnel" passent
- Analytics configuré
- Monitoring actif
- Documentation admin

---

## 📝 Notes de Test

_Utiliser cette section pour noter les bugs/observations pendant les tests_

### Bugs Identifiés

1.
2.
3.

### Améliorations Suggérées

1.
2.
3.

### Questions/Clarifications

1.
2.
3.

---

**Testeur**: ********\_\_\_********  
**Date**: ********\_\_\_********  
**Version**: ********\_\_\_********
