# 🔄 Keep-Alive Configuration

## Objectif

Le endpoint `/api/keep-alive` maintient la base de données Supabase active pour éviter qu'elle ne se mette en veille sur les plans gratuits.

## Configuration

### 1. Variable d'environnement

Générez une clé secrète forte :

```bash
openssl rand -base64 32
```

Ajoutez-la dans votre `.env` :

```env
CRON_SECRET=votre-clé-générée-ici
```

### 2. Endpoint

- **URL**: `https://yourdomain.com/api/keep-alive?key=YOUR_CRON_SECRET`
- **Méthode**: GET
- **Authentification**: Query parameter `key`

### 3. Configuration du Cron Job

Utilisez un service de cron externe pour appeler le endpoint régulièrement.

#### Option 1: cron-job.org (Gratuit)

1. Créez un compte sur [cron-job.org](https://cron-job.org)
2. Créez un nouveau cronjob :
   - **URL**: `https://yourdomain.com/api/keep-alive?key=YOUR_CRON_SECRET`
   - **Intervalle**: Toutes les 5 minutes
   - **Timeout**: 30 secondes
   - **Method**: GET

#### Option 2: EasyCron (Gratuit pour 1 cron)

1. Créez un compte sur [easycron.com](https://www.easycron.com)
2. Créez un nouveau cron :
   - **URL**: `https://yourdomain.com/api/keep-alive?key=YOUR_CRON_SECRET`
   - **Schedule**: `*/5 * * * *` (toutes les 5 minutes)

#### Option 3: GitHub Actions (Si hébergé sur GitHub)

Créez `.github/workflows/keep-alive.yml` :

```yaml
name: Keep-Alive

on:
  schedule:
    - cron: '*/5 * * * *' # Toutes les 5 minutes

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Call Keep-Alive Endpoint
        run: |
          curl -f "https://yourdomain.com/api/keep-alive?key=${{ secrets.CRON_SECRET }}"
```

Ajoutez `CRON_SECRET` dans les secrets GitHub.

## Réponse attendue

```json
{
  "status": "alive",
  "timestamp": "2026-01-23T10:30:00.000Z",
  "message": "Database connection maintained",
  "guestCount": 42
}
```

## Erreurs possibles

### 401 Unauthorized

- **Cause**: Clé manquante ou invalide
- **Solution**: Vérifiez que `CRON_SECRET` est correctement configuré

### 503 Service Unavailable

- **Cause**: Connexion à la base de données échouée
- **Solution**: Vérifiez la configuration Supabase

## Sécurité

✅ **Timing-safe comparison**: Utilise `crypto.subtle.timingSafeEqual` pour comparer les clés
✅ **Pas de rate limiting nécessaire**: Endpoint appelé par cron seulement
✅ **Logs structurés**: Erreurs loguées pour debugging
✅ **Pas d'exposition de données sensibles**: Retourne uniquement le count

## Monitoring

Pour vérifier que le cron fonctionne :

1. Consultez les logs du service de cron
2. Vérifiez les temps de réponse Supabase
3. Surveillez les erreurs 503

## Notes

- Le endpoint fait une requête HEAD pour minimiser la charge
- Supabase reste actif pendant ~15 minutes après chaque appel
- Un appel toutes les 5 minutes garantit une disponibilité continue
