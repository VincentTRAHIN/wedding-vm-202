# Rate Limiting - Configuration Mariage

**Date de modification** : 25 Janvier 2026  
**Objectif** : Éviter les faux positifs lors de l'événement tout en maintenant la sécurité

---

## 🎯 Problématique Résolue

### Contexte Mariage
- **Wi-Fi partagé** : Tous les invités sur la même IP (réseau du domaine)
- **Upload en masse** : Les invités vident leur galerie photo (50-100 photos)
- **Inscriptions familiales** : Un parent inscrit plusieurs enfants sur le même appareil

### Solution Implémentée
**Stratégie de clé différenciée** :
- **Utilisateurs connectés** (RSVP, UPLOAD) : Rate limit par `user.id` ✅
- **Utilisateurs anonymes** (LOGIN, REGISTER) : Rate limit par IP 🔒

**Résultat** : Un invité peut uploader 100 photos sans bloquer les autres invités sur le même Wi-Fi.

---

## 📊 Nouveaux Seuils

| Action | Ancien Seuil | Nouveau Seuil | Clé | Justification |
|--------|--------------|---------------|-----|---------------|
| **LOGIN** | 5/min | **5/min** ✅ | IP | Protection brute-force maintenue |
| **REGISTER** | 3/h | **10/h** ⬆️ | IP | Permet erreurs + inscriptions multiples |
| **RSVP** | 10/min | **10/min** ✅ | `user.id` | Seuil correct, clé changée |
| **UPLOAD** | 20/h | **100/h** ⬆️ | `user.id` | Permet dump galerie photo |

---

## 🔧 Implémentation Technique

### 1. Fonction `checkRateLimit` Modifiée

**Fichier** : [src/lib/server/validation.ts](../src/lib/server/validation.ts)

**Signature** :
```typescript
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000,
  userId?: string // NOUVEAU : Optionnel
): { allowed: boolean; remaining: number }
```

**Logique** :
```typescript
// Si userId fourni : clé = "user:<userId>:<action>"
// Sinon : clé = "<action>:<ip>"
const rateLimitKey = userId 
  ? `user:${userId}:${key.split(':')[0]}` 
  : key;
```

### 2. Appels Mis à Jour

#### LOGIN ([login/+page.server.ts](../src/routes/login/+page.server.ts))
```typescript
// ✅ INCHANGÉ - Utilise IP (anonyme)
const { allowed } = checkRateLimit(`login:${clientIp}`, 5, 60000);
```

#### REGISTER ([register/+page.server.ts](../src/routes/register/+page.server.ts))
```typescript
// ⬆️ SEUIL AUGMENTÉ : 3 → 10 par heure
const { allowed } = checkRateLimit(`register:${clientIp}`, 10, 3600000);
```

#### RSVP ([rsvp/+page.server.ts](../src/routes/rsvp/+page.server.ts))
```typescript
// ⬆️ CLÉ CHANGÉE : IP → user.id
const { allowed } = checkRateLimit('rsvp', 10, 60000, user.id);
```

#### UPLOAD ([gallery/+page.server.ts](../src/routes/gallery/+page.server.ts))
```typescript
// ⬆️ SEUIL : 20 → 100/h + CLÉ : IP → user.id
const { allowed } = checkRateLimit('upload', 100, 3600000, user.id);
```

---

## 📈 Scénarios Testés

### Scénario 1 : Wi-Fi Partagé (Même IP)
**Setup** :
- 5 invités sur le Wi-Fi du domaine (IP : `192.168.1.1`)
- Chacun veut uploader 50 photos

**Avant (Ancien Système)** :
- ❌ 1er invité : 20 photos → OK
- ❌ 2e invité : 0 photos → Bloqué (limite IP atteinte)

**Après (Nouveau Système)** :
- ✅ Invité A : 100 photos → OK (clé : `user:abc123:upload`)
- ✅ Invité B : 100 photos → OK (clé : `user:def456:upload`)
- ✅ Invité C : 100 photos → OK (clé : `user:ghi789:upload`)

### Scénario 2 : Inscription Familiale
**Setup** :
- Parent inscrit 4 enfants depuis son téléphone (même IP)

**Avant (Ancien Système)** :
- ❌ Enfant 1-3 : OK
- ❌ Enfant 4 : Bloqué (limite IP : 3/h)

**Après (Nouveau Système)** :
- ✅ Enfants 1-10 : OK (limite : 10/h)

### Scénario 3 : Brute Force Login
**Setup** :
- Attaquant tente 100 logins depuis `192.168.1.100`

**Avant & Après (INCHANGÉ)** :
- ✅ Tentatives 1-5 : OK
- ✅ Tentatives 6+ : Bloqué (limite IP : 5/min) 🔒

---

## 🛡️ Sécurité Maintenue

### Protections Actives
1. **Brute Force** : LOGIN reste à 5/min par IP ✅
2. **Spam Registration** : Limite augmentée mais présente (10/h) ✅
3. **IDOR** : Protection RSVP managed guests inchangée ✅
4. **XSS** : Sanitization HTML active ✅

### Limitations
- **In-Memory Store** : Rate limiting réinitialise au redémarrage serveur
  - **Recommandation** : Migrer vers Redis en production
- **User Enumeration** : Login rate limit par IP permet théoriquement enumeration
  - **Mitigation** : Supabase Auth gère les tentatives répétées

---

## 🚀 Déploiement

### Build Vérifié
```bash
npm run build
# ✅ Build réussi sans erreur
```

### Coolify
**Aucune configuration supplémentaire requise** - Les changements sont côté code.

### Rollback
Si nécessaire, revenir aux anciens seuils :
```typescript
// REGISTER : 10 → 3
checkRateLimit(`register:${clientIp}`, 3, 3600000);

// UPLOAD : 100 → 20
checkRateLimit(`upload:${user.id}`, 20, 3600000);

// RSVP : user.id → IP
checkRateLimit(`rsvp:${user.id}`, 10, 60000);
```

---

## 📊 Monitoring Recommandé

### Métriques à Surveiller
- **Taux d'erreur 429** par endpoint :
  - LOGIN : < 0.5% (légitime si attaques)
  - REGISTER : < 0.1%
  - RSVP : < 0.05%
  - UPLOAD : < 0.1%

### Alertes
- **UPLOAD 429 > 1%** → Seuil peut-être trop bas
- **REGISTER 429 > 1%** → Augmenter à 15/h si besoin

### Logs à Activer (Futur)
```typescript
if (!allowed) {
  console.warn(`[Rate Limit] ${key} - userId: ${userId} - remaining: 0`);
}
```

---

## 🎯 Prochaines Améliorations

### Court Terme (Post-Mariage)
- [ ] Analyser logs 429 réels
- [ ] Ajuster seuils si besoin
- [ ] Ajouter métriques Prometheus

### Long Terme
- [ ] Migrer vers Redis (rate limiting persistant)
- [ ] Implémenter Token Bucket Algorithm
- [ ] Rate limiting par endpoint + global par user
- [ ] Dashboard monitoring temps réel

---

**Conclusion** : Le rate limiting est maintenant **adapté au contexte mariage** (Wi-Fi partagé + uploads massifs) tout en **maintenant la sécurité** contre les attaques.
