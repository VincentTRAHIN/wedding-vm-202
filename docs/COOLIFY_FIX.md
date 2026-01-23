# 🚨 Configuration Coolify - URGENT

## Problème Détecté

Le déploiement a échoué car la variable d'environnement `CRON_SECRET` n'est pas configurée dans Coolify.

**Erreur**:

```
"CRON_SECRET" is not exported by "virtual:env/static/private"
```

## ✅ Solution - Ajouter la Variable Manquante

### 1. Générer CRON_SECRET

Sur votre machine locale :

```bash
openssl rand -base64 32
```

Copiez le résultat (exemple: `a8K3mP9xL2vN5qR7tY4uW1eZ6hJ0iC8fD3gS5bV7nM9=`)

### 2. Ajouter dans Coolify

1. Allez dans votre projet Coolify : **july18.melanie.vincent-trahin.dev**
2. Cliquez sur **Environment Variables**
3. Ajoutez une nouvelle variable :
   - **Name**: `CRON_SECRET`
   - **Value**: `[votre-clé-générée]`
4. Cliquez sur **Save**

### 3. Redéployer

Après avoir ajouté la variable :

```bash
git add .
git commit -m "fix: Use dynamic env for CRON_SECRET"
git push origin main
```

Coolify va automatiquement redéployer avec la nouvelle variable.

---

## 📋 Vérification des Variables d'Environnement

Assurez-vous que toutes ces variables sont configurées dans Coolify :

### ✅ Variables Déjà Configurées (Selon les logs)

- `SERVICE_ROLE_KEY` ✅
- `ADMIN_EMAILS` ✅
- `BODY_SIZE_LIMIT` ✅
- `ORIGIN` ✅
- `PUBLIC_SUPABASE_ANON_KEY` ✅
- `PUBLIC_SUPABASE_URL` ✅
- `RESEND_API_KEY` ✅
- `SENDER_EMAIL` ✅
- `WEDDING_ACCESS_CODE` ✅

### ⚠️ Variable Manquante

- `CRON_SECRET` ❌ **À AJOUTER**

---

## 🔧 Modification Effectuée

Le code a été modifié pour utiliser `$env/dynamic/private` au lieu de `$env/static/private`, ce qui permet de :

- ✅ Charger la variable au **runtime** (quand le serveur démarre)
- ✅ Ne pas bloquer le **build** si la variable est absente
- ✅ Afficher une erreur claire si la variable n'est pas configurée

**Fichier modifié** : `src/routes/api/keep-alive/+server.ts`

---

## 🚀 Après Configuration

Une fois `CRON_SECRET` ajouté, vous pourrez :

1. ✅ Tester le endpoint :

   ```bash
   curl "https://july18.melanie.vincent-trahin.dev/api/keep-alive?key=VOTRE_CRON_SECRET"
   ```

2. ✅ Configurer le cron job (voir [docs/KEEP_ALIVE.md](./KEEP_ALIVE.md))

---

## 📚 Documentation

- **Configuration Keep-Alive** : [docs/KEEP_ALIVE.md](./KEEP_ALIVE.md)
- **Variables d'environnement** : [.env.example](./.env.example)
- **Guide de déploiement** : [docs/DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🆘 Besoin d'Aide ?

Si le problème persiste après avoir ajouté `CRON_SECRET` :

1. Vérifiez que la variable est bien enregistrée dans Coolify
2. Redéployez manuellement depuis le dashboard Coolify
3. Consultez les logs de build pour plus de détails
