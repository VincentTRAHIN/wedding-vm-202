# Configuration Vercel - Variables d'environnement

## ⚠️ CRITIQUE : Configuration Email

Pour que les emails fonctionnent correctement en production, tu DOIS configurer ces variables d'environnement dans **Vercel Dashboard** :

### 1. Aller dans Vercel
- Project Settings → Environment Variables

### 2. Ajouter TOUTES ces variables :

```
RESEND_API_KEY=re_PTWHViDK_N6fCrM46E33FkohewiNpYMCj
SENDER_EMAIL=july18.melanie@vincent-trahin.dev
ADMIN_EMAILS=vincent.trahin@gmail.com,melanie.douge@gmail.com
PUBLIC_SUPABASE_URL=https://lrrygafrwyxnzbwaxntn.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycnlnYWZyd3l4bnpid2F4bnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTI0OTMsImV4cCI6MjA3OTQyODQ5M30.J7Cbvx-W-sCCbZKq_sRTAlUUvguIi2GHQdxsBn2yx84
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxycnlnYWZyd3l4bnpid2F4bnRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg1MjQ5MywiZXhwIjoyMDc5NDI4NDkzfQ.tTulCbW3H9LghhyirXqu0G9u8vdQ23U_bElyIIRXAD8
```

### 3. ⚠️ VÉRIFICATIONS IMPORTANTES

**Email Sender** :
- ✅ Utilise `july18.melanie@vincent-trahin.dev` (domaine vérifié)
- ❌ NE PAS utiliser `onboarding@resend.dev` (domaine de test)
- ❌ NE PAS utiliser `noreply@` (non vérifié)

**Domaine Resend** :
- Vérifie que `vincent-trahin.dev` est bien vérifié dans Resend
- DNS records (DKIM, SPF, DMARC) doivent être configurés sur Porkbun

### 4. Après avoir ajouté les variables

1. **Redéployer** : Vercel → Deployments → Latest → Redeploy
2. **Tester** : Envoie un email de test via `/test-email-send`
3. **Vérifier les logs** : Vercel → Deployments → Logs

### 5. Comment vérifier que c'est bien configuré

Dans les logs Vercel, tu devrais voir :
```
📧 Email Config: { hasApiKey: true, sender: 'july18.melanie@vincent-trahin.dev', adminEmails: '...' }
```

Si tu vois :
```
❌ SENDER_EMAIL is not properly configured!
```

Alors la variable n'est pas correctement définie dans Vercel.

### 6. Erreurs communes

**"Testing domain restriction"** (Resend) :
- Tu utilises `onboarding@resend.dev` au lieu de ton domaine vérifié
- Solution : Vérifie que `SENDER_EMAIL` est bien défini dans Vercel

**"403 Forbidden"** :
- Le domaine n'est pas vérifié dans Resend
- Solution : Va sur https://resend.com/domains et vérifie `vincent-trahin.dev`

**Emails non reçus** :
- Vérifie les logs Resend : https://resend.com/emails
- Vérifie le spam
- Vérifie que l'adresse email est valide

## 🔍 Debug

Pour tester si les variables sont bien chargées en production :

1. Ajoute temporairement ce log dans `email.ts` :
```typescript
console.log('📧 SENDER_EMAIL from env:', process.env.SENDER_EMAIL);
console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
```

2. Redéploie

3. Va sur `/test-email-send`

4. Regarde les logs Vercel

5. Supprime les logs une fois vérifié

## ✅ Checklist Production

- [ ] Variables ajoutées dans Vercel Dashboard
- [ ] Domaine `vincent-trahin.dev` vérifié dans Resend
- [ ] DNS (DKIM, SPF, DMARC) configurés sur Porkbun
- [ ] Déploiement redéployé après ajout des variables
- [ ] Email de test envoyé avec succès
- [ ] Logs Vercel montrent le bon sender email
- [ ] Aucune erreur 403 dans Resend Dashboard
