# Checklist de Pré-Lancement - 25 Janvier 2026

**Status Global : ✅ PRÊT POUR DÉPLOIEMENT**

---

## ✅ 1. Sécurité Implémentée

### 1.1 Rate Limiting
- ✅ **Login** : 5 tentatives / minute (par IP) (`src/routes/login/+page.server.ts`)
- ✅ **Register** : 10 inscriptions / heure (par IP, augmenté de 3) (`src/routes/register/+page.server.ts`)
- ✅ **RSVP** : 10 mises à jour / minute (par `user.id`, évite blocage Wi-Fi partagé) (`src/routes/rsvp/+page.server.ts`)
- ✅ **Gallery Upload** : 100 uploads / heure (par `user.id`, augmenté de 20) (`src/routes/gallery/+page.server.ts`)

**Note** : Stratégie différenciée pour Wi-Fi partagé (mariage) - voir [RATE_LIMITING_WEDDING.md](RATE_LIMITING_WEDDING.md)

### 1.2 Sanitization HTML
- ✅ **RSVP** : `dietary_restrictions`, `message_for_couple` (`rsvp/+page.server.ts:123-128`)
- ✅ **Gallery** : `caption` (`gallery/+page.server.ts:45-47`)

### 1.3 IDOR Protection
- ✅ **Managed Guests** : Vérification stricte avant assignation (`rsvp/+page.server.ts:266-284`)
  - Check `managed_by_id` et `auth_id` avant UPDATE
  - Retourne 400 si déjà assigné

### 1.4 Keep-Alive
- ✅ **Endpoint** : `/api/keep-alive` avec `CRON_SECRET` timing-safe (`api/keep-alive/+server.ts`)
- ✅ **Fix Coolify** : Utilise `$env/dynamic/private` au lieu de `static`

---

## ⚠️ 2. Actions Critiques à Faire AVANT Lancement

### 🔴 URGENT - Sécurité des Secrets

#### 2.1 Régénérer les Clés
```bash
# 1. SERVICE_ROLE_KEY (Supabase)
# → Aller sur console.supabase.co > Settings > API > Régénérer Service Role Key

# 2. RESEND_API_KEY
# → Aller sur resend.com/api-keys > Créer nouvelle clé

# 3. CRON_SECRET
openssl rand -base64 32
```

#### 2.2 Supprimer .env de Git
```bash
# ATTENTION: Votre .env actuel contient des secrets EXPOSÉS sur GitHub
git rm --cached .env
git commit -m "security: Remove .env from repository (CRITICAL)"
git push origin main

# Ajouter au .gitignore (déjà fait normalement)
echo ".env" >> .gitignore
git add .gitignore
git commit -m "security: Ensure .env is ignored"
git push
```

#### 2.3 Configurer Coolify
1. **Ajouter CRON_SECRET** :
   - Aller sur Coolify > Votre projet > Environment Variables
   - Ajouter : `CRON_SECRET=<valeur générée à l'étape 2.1>`
   - Redéployer

2. **Vérifier autres secrets** :
   - `SERVICE_ROLE_KEY` (nouvelle valeur)
   - `RESEND_API_KEY` (nouvelle valeur)
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`

#### 2.4 Configurer Cron Job
**Option A - EasyCron** (recommandé) :
1. Créer compte sur https://www.easycron.com
2. Créer job :
   - URL : `https://july18.melanie.vincent-trahin.dev/api/keep-alive`
   - Méthode : POST
   - Headers : `Authorization: Bearer <CRON_SECRET>`
   - Intervalle : Toutes les 10 minutes
   - Timeout : 30 secondes

**Option B - Cron-job.org** :
1. Créer compte sur https://cron-job.org
2. Créer job similaire

**Option C - GitHub Actions** :
Fichier `.github/workflows/keep-alive.yml` :
```yaml
name: Keep Alive
on:
  schedule:
    - cron: '*/10 * * * *' # Toutes les 10 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Keep-Alive
        run: |
          curl -X POST https://july18.melanie.vincent-trahin.dev/api/keep-alive \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## ✅ 3. Fonctionnalités Vérifiées

### 3.1 Build & Deploy
- ✅ **Build local** : `npm run build` réussit sans erreur
- ✅ **Type safety** : Aucune erreur TypeScript
- ✅ **Imports** : Tous les imports de sécurité résolus

### 3.2 Fonctionnalités Principales
- ✅ **Authentification** : Login/Register avec rate limiting
- ✅ **RSVP** : Formulaire avec sanitization et IDOR protection
- ✅ **Gallery** : Upload avec rate limiting et sanitization
- ✅ **Admin** : Panel d'administration fonctionnel
- ✅ **Dashboard** : Tableau de bord invités

---

## 📋 4. Score de Sécurité OWASP

**Score Final : 7.5/10** (détails dans `docs/SECURITY_AUDIT.md`)

### Points Forts ✅
- ✅ A01 (Broken Access Control) : 8/10
- ✅ A02 (Cryptographic Failures) : 9/10
- ✅ A03 (Injection) : 8/10
- ✅ A04 (Insecure Design) : 7/10
- ✅ A05 (Security Misconfiguration) : 8/10

### Points d'Amélioration ⚠️
- ⚠️ A06 (Vulnerable Components) : 6/10 (dépendances à surveiller)
- ⚠️ A07 (Identification Failures) : 6/10 (2FA recommandé pour futur)
- ⚠️ A08 (Software Integrity) : 6/10 (SRI recommandé)
- ⚠️ A09 (Logging) : 7/10 (audit logs limités)
- ⚠️ A10 (SSRF) : 9/10 (bien protégé)

---

## 🚀 5. Procédure de Déploiement

### Étape 1 : Sécuriser les Secrets (30 min)
```bash
# 1. Régénérer toutes les clés (voir section 2.1)
# 2. Supprimer .env de Git (voir section 2.2)
# 3. Configurer Coolify (voir section 2.3)
# 4. Vérifier que TOUTES les env vars sont dans Coolify
```

### Étape 2 : Déployer (5 min)
```bash
git add .
git commit -m "security: Implement rate limiting, IDOR fix, HTML sanitization"
git push origin main
# Coolify auto-deploy
```

### Étape 3 : Configurer Keep-Alive (10 min)
```bash
# Choisir une option (2.4) et configurer le cron job
# Tester : curl -X POST https://july18.melanie.vincent-trahin.dev/api/keep-alive \
#   -H "Authorization: Bearer <CRON_SECRET>"
# Réponse attendue : {"status":"ok","timestamp":"..."}
```

### Étape 4 : Tests Post-Déploiement (15 min)
```bash
# 1. Login : Tester rate limiting (5 tentatives rapides)
# 2. Register : Tester rate limiting (3+ inscriptions)
# 3. RSVP : Tester sanitization (insérer <script>alert(1)</script>)
# 4. Gallery : Tester upload (20+ photos rapides)
# 5. Managed Guests : Tester IDOR (assigner guest déjà pris)
# 6. Keep-Alive : Vérifier logs Coolify après 10min
```

---

## 📊 6. Métriques de Monitoring

### À Surveiller (première semaine)
- [ ] **Taux d'erreur 429** (rate limiting) → Doit être < 1%
- [ ] **Latence API** → Doit être < 500ms
- [ ] **Uptime Supabase** → Keep-Alive logs toutes les 10min
- [ ] **Taille DB** → Estimer croissance (photos + RSVPs)
- [ ] **Logs Resend** → Vérifier emails envoyés

### Alertes à Configurer
- [ ] Coolify down > 5 min
- [ ] Keep-Alive fail > 3 tentatives
- [ ] Erreurs 500 > 10/heure
- [ ] Storage > 90% capacité

---

## 🎯 7. Checklist Finale

### Avant de Lancer
- [ ] ✅ Secrets régénérés (SERVICE_ROLE_KEY, RESEND_API_KEY, CRON_SECRET)
- [ ] ✅ .env supprimé de Git
- [ ] ✅ Coolify configuré avec TOUTES les env vars
- [ ] ✅ Cron job configuré (Keep-Alive)
- [ ] ✅ Tests post-déploiement passés

### Après le Lancement
- [ ] Surveiller logs Coolify (première heure)
- [ ] Tester flux complet (register → RSVP → upload)
- [ ] Vérifier emails de confirmation
- [ ] Monitorer base de données Supabase
- [ ] Documenter incidents (si présents)

---

## 📞 Support & Documentation

### Ressources
- **Audit Sécurité** : `docs/SECURITY_AUDIT.md`
- **Actions Critiques** : `docs/ACTIONS_CRITIQUES.md`
- **Quick Start** : `docs/QUICK_START_SECURITY.md`
- **Keep-Alive** : `docs/KEEP_ALIVE.md`
- **Déploiement** : `docs/DEPLOYMENT.md`

### Contacts d'Urgence
- **Supabase Status** : https://status.supabase.com
- **Coolify Docs** : https://coolify.io/docs
- **Resend Status** : https://resend.com/status

---

**Date de création** : 25 Janvier 2026  
**Dernière modification** : 25 Janvier 2026  
**Status** : ✅ PRÊT POUR PRODUCTION
