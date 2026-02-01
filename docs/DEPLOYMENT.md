# 🚀 Guide de Déploiement Production - Wedding VM 2026

**Date**: 17 janvier 2026  
**Version**: 1.0.0

---

## 📋 Pré-requis

### Comptes & Services Requis

- ✅ Compte Supabase (projet créé)
- ✅ Compte Resend (API key)
- ✅ Hébergeur Node.js (VPS, Railway, Render, Fly.io, etc.)
- ✅ Domaine personnalisé (optionnel mais recommandé)

### Outils Locaux

- Node.js >= 18
- npm >= 9
- Git

---

## 🔧 Configuration Supabase

### 1. Créer le Projet

1. Aller sur [supabase.com](https://supabase.com)
2. Créer nouveau projet
3. Noter:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Appliquer les Migrations

```bash
# Option A: Via Supabase Dashboard
# - Aller dans SQL Editor
# - Coller contenu de supabase/schema.sql
# - Exécuter

# Option B: Via CLI (si installé)
cd /path/to/project
supabase db push
```

### 3. Appliquer les Migrations Additionnelles

Dans l'ordre, exécuter chaque fichier de `supabase/migrations/`:

```sql
-- 1. 20251124_gallery_update.sql
-- 2. 20251126_gallery_social.sql
-- 3. 20251129_add_managed_by.sql
-- 4. 20251129_fix_managed_by_fk.sql
-- 5. 20251129_seed_guests_list.sql
-- 6. 20251202_add_invitation_code.sql
-- 7. 20251202_add_is_child.sql
-- 8. 20251207_add_admin_insert_policy.sql
-- 9. 20251207_cascade_delete_photos.sql
-- 10. 20251214_add_room_to_guests.sql
-- 11. 20251214_create_rooms_table.sql
-- 12. 20251214_create_site_content.sql
-- 13. 20251214_seed_local_guide.sql
-- 14. 20251230_add_access_code_to_rooms.sql
-- 15. 20251230_add_song_requests_delete_policy.sql
-- 16. 20251230_create_song_requests.sql
-- 17. 20251230_seed_premium_dashboard_content.sql
-- 18. 20251230_seed_rooms.sql
-- 19. 20260119_add_rsvp_day_columns.sql
-- 20. 20260122_add_invitation_sent.sql
-- 21. 20260201_add_invitation_type_remove_code.sql
```

### 4. Configurer Storage

1. Dashboard Supabase → Storage
2. Vérifier que bucket `photos` existe
3. Vérifier policies storage (déjà dans schema.sql)

### 5. Configurer Auth

1. Dashboard → Authentication → Providers
2. Activer **Email** (obligatoire)
3. Activer **Google OAuth** (optionnel mais recommandé)
   - Client ID & Secret depuis Google Cloud Console
   - Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 6. Créer Premier Admin

```sql
-- Dans SQL Editor Supabase
-- 1. Créer auth user via Dashboard Auth ou:
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@votredomaine.com', crypt('VotreMotDePasseSecurise', gen_salt('bf')), now());

-- 2. Récupérer l'ID du user créé
SELECT id FROM auth.users WHERE email = 'admin@votredomaine.com';

-- 3. Créer guest admin
INSERT INTO public.guests (email, auth_id, full_name, role)
VALUES (
  'admin@votredomaine.com',
  'UUID_DU_USER_CI_DESSUS',
  'Admin',
  'admin'
);
```

---

## 📧 Configuration Resend

### 1. Créer Compte & API Key

1. Aller sur [resend.com](https://resend.com)
2. Créer compte
3. Générer API key
4. Vérifier domaine d'envoi (ou utiliser `onboarding@resend.dev` pour tests)

### 2. Vérifier Domaine (Production)

1. Dashboard Resend → Domains
2. Ajouter votre domaine
3. Configurer DNS records (SPF, DKIM, DMARC)
4. Attendre validation

---

## 🌍 Variables d'Environnement

### Fichier `.env` (Production)

```env
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@votredomaine.com
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Site
WEDDING_ACCESS_CODE=VOTRECODEUNIQUE2026
ORIGIN=https://votredomaine.com

# Environment
NODE_ENV=production
```

### Configuration par Hébergeur

#### Railway

```bash
railway variables set PUBLIC_SUPABASE_URL=...
railway variables set PUBLIC_SUPABASE_ANON_KEY=...
railway variables set SERVICE_ROLE_KEY=...
railway variables set RESEND_API_KEY=...
railway variables set SENDER_EMAIL=...
railway variables set ADMIN_EMAILS=...
railway variables set WEDDING_ACCESS_CODE=...
railway variables set ORIGIN=https://yourapp.railway.app
railway variables set NODE_ENV=production
```

#### Render

Dashboard → Environment → Add Environment Variable

#### Fly.io

```bash
fly secrets set PUBLIC_SUPABASE_URL=...
fly secrets set PUBLIC_SUPABASE_ANON_KEY=...
# etc.
```

---

## 📦 Build & Déploiement

### Build Local (Test)

```bash
# Nettoyer
rm -rf .svelte-kit build

# Build
npm run build

# Tester localement
node build

# Ouvrir http://localhost:3000
```

### Déploiement Automatique

#### Via Git (Railway, Render, Vercel)

1. Push code sur GitHub

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. Connecter repo sur plateforme
3. Configurer variables d'environnement
4. Deploy automatique

#### Via Docker (VPS, Fly.io)

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
```

```bash
# Build
docker build -t wedding-vm-202 .

# Run
docker run -p 3000:3000 --env-file .env wedding-vm-202
```

---

## 🔒 Checklist Post-Déploiement

### Sécurité

- [ ] Toutes les variables d'env configurées
- [ ] HTTPS actif
- [ ] Cookies `secure` activés
- [ ] Headers sécurité présents (vérifier avec securityheaders.com)
- [ ] RLS Supabase actif sur toutes tables

### Fonctionnel

- [ ] `/health` retourne 200 OK
- [ ] `/unlock` accessible et fonctionne
- [ ] Login email/password fonctionne
- [ ] Google OAuth fonctionne (si activé)
- [ ] Upload photo fonctionne
- [ ] Emails envoyés correctement

### Performance

- [ ] Temps de chargement < 3s
- [ ] Images optimisées
- [ ] No JavaScript errors in console
- [ ] Build size raisonnable

### Monitoring

- [ ] Logs accessibles
- [ ] Uptime monitor configuré
- [ ] Alertes email configurées

---

## 🔧 Configuration Domaine Personnalisé

### DNS Records

```
A     @        YOUR_SERVER_IP
A     www      YOUR_SERVER_IP
CNAME @        your-app.railway.app (si hébergeur avec CNAME)
```

### SSL/HTTPS

La plupart des hébergeurs gèrent automatiquement:

- Railway: Auto SSL
- Render: Auto SSL
- Fly.io: Auto SSL
- Vercel: Auto SSL

Pour VPS manuel:

```bash
# Avec Certbot (Let's Encrypt)
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

---

## 🚨 Troubleshooting

### Erreur: "Failed to fetch"

**Cause**: CORS ou URL incorrecte  
**Solution**: Vérifier `ORIGIN` correspond au domaine

### Erreur: "Invalid API key"

**Cause**: Variable d'env incorrecte  
**Solution**: Vérifier `RESEND_API_KEY` ou `SERVICE_ROLE_KEY`

### Erreur: "Unauthorized" partout

**Cause**: Supabase RLS ou session  
**Solution**:

```bash
# Vérifier policies
# Vérifier cookies autorisés
# Vérifier SERVICE_ROLE_KEY correct
```

### Emails non envoyés

**Cause**: Resend API ou config  
**Solution**:

1. Vérifier logs serveur
2. Dashboard Resend → Logs
3. Vérifier `SENDER_EMAIL` vérifié

### Build échoue

**Cause**: Dépendances ou TypeScript  
**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Monitoring Recommandé

### Services Gratuits

#### Uptime Monitoring

- **UptimeRobot** (gratuit 50 monitors)
  - Monitorer: `https://votredomaine.com/health`
  - Interval: 5 minutes
  - Alerte email

#### Error Tracking

- **Sentry** (gratuit 5k events/mois)

```bash
npm install @sentry/sveltekit
```

```typescript
// hooks.client.ts
import * as Sentry from '@sentry/sveltekit';
Sentry.init({
	dsn: 'YOUR_SENTRY_DSN',
	environment: process.env.NODE_ENV
});
```

#### Analytics

- **Plausible** (privacy-friendly)
- **Google Analytics** (traditionnel)

---

## 🔄 Mises à Jour Post-Déploiement

### Process de Mise à Jour

```bash
# 1. Tester localement
npm run build
node build

# 2. Commit & push
git add .
git commit -m "Fix: description"
git push origin main

# 3. Vérifier déploiement auto
# ou trigger manuel sur hébergeur
```

### Rollback

```bash
# Git
git revert HEAD
git push origin main

# Hébergeur
# Railway: Redeploy previous version via dashboard
# Render: Rollback via dashboard
# Fly.io: fly deploy --image previous-tag
```

---

## 📞 Support d'Urgence

### Pendant le Mariage

**Problème critique** (site down):

1. Vérifier `/health` endpoint
2. Vérifier logs hébergeur
3. Vérifier quota Supabase
4. Redémarrer service si nécessaire

**Problème mineur** (feature ne marche pas):

1. Noter le problème
2. Workaround manuel si possible
3. Corriger après l'événement

---

## ✅ Validation Finale

**Le site est prêt si**:

- ✅ Build réussi sans erreurs
- ✅ Déployé et accessible via HTTPS
- ✅ Tous les flows testés (voir TEST_CHECKLIST.md)
- ✅ Emails fonctionnels
- ✅ Variables d'env correctes
- ✅ Monitoring configuré
- ✅ Admin peut se connecter
- ✅ Invité test peut s'inscrire et RSVP

---

## 📚 Ressources

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)

---

**Bonne chance avec le lancement ! 🎉**
