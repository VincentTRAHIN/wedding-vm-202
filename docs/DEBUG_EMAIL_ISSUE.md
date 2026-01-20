# 🔍 Guide de Débogage - Email Invité Non Reçu

## Problème Rapporté

Quand un invité ajoute un autre invité avec email via RSVP :

- ✅ L'invité connecté reçoit son email de confirmation RSVP
- ❌ L'invité ajouté ne reçoit PAS l'email d'invitation

## Modifications Apportées

### 1. Ordre d'exécution corrigé

**Avant :**

```typescript
invitation_sent: !isChild && email ? true : false  // Marqué AVANT l'envoi
await sendInvitationEmail(...)  // Envoyé APRÈS
```

**Après :**

```typescript
await sendInvitationEmail(...)  // Envoyé D'ABORD
if (success) {
  update({ invitation_sent: true })  // Marqué APRÈS succès
}
```

### 2. Logs Détaillés Ajoutés

#### Dans `addManagedGuest` :

```
📧 Sending invitation email to email@example.com (Guest Name) from Inviter Name
📨 Preparing to send invitation email...
   To: email@example.com
   Guest: Guest Name
   From: Inviter Name
📤 Sending email via Resend...
✅ Resend response: {...}
✅ Invitation email sent successfully to email@example.com
```

#### En cas d'erreur :

```
❌ Failed to send invitation email to email@example.com: Error details
❌ Exception while sending email to email@example.com: {...}
```

## Comment Déboguer

### 1. Lance le serveur en mode dev

```bash
npm run dev
```

### 2. Ouvre la console serveur

Garde un œil sur le terminal où tourne `npm run dev`

### 3. Reproduis le scénario

1. Connecte-toi comme invité
2. Va sur `/rsvp`
3. Clique "Ajouter un invité"
4. Sélectionne un invité
5. Entre l'email de test (utilise TON email pour vérifier)
6. Clique "Ajouter"

### 4. Vérifie les logs

#### ✅ Si tu vois cette séquence complète :

```
📧 Sending invitation email to test@email.com (Melanie) from Vincent
📨 Preparing to send invitation email...
   To: test@email.com
   Guest: Melanie
   From: Vincent
📤 Sending email via Resend...
✅ Resend response: { id: 're_...' }
✅ Guest Invitation sent to: test@email.com
✅ Invitation email sent successfully to test@email.com
```

→ L'email est parti ! Vérifie ta boîte mail + spams

#### ❌ Si tu vois :

```
ℹ️ Skipping email for child: Melanie
```

→ La case "Cet invité est un enfant" est cochée

#### ❌ Si tu vois :

```
ℹ️ Skipping email - no email provided for: Melanie
```

→ Pas d'email fourni ou case "Pas d'adresse email" cochée

#### ❌ Si tu vois :

```
❌ RESEND_API_KEY is not configured!
```

→ Variable d'environnement manquante dans `.env`

#### ❌ Si tu vois :

```
❌ Error sending guest invitation email: Error: ...
```

→ Problème avec Resend (clé invalide, domaine non vérifié, etc.)

### 5. Teste l'envoi directement

Visite : `http://localhost:5173/test-email?email=ton-email@gmail.com`

Si ça fonctionne → Le problème est dans le flow RSVP
Si ça ne fonctionne pas → Le problème est dans la config Resend

## Checklist de Vérification

- [ ] `.env` contient `RESEND_API_KEY=re_...`
- [ ] `.env` contient `SENDER_EMAIL=...`
- [ ] L'email fourni est valide (pas de typo)
- [ ] La case "enfant" n'est PAS cochée
- [ ] La case "pas d'email" n'est PAS cochée
- [ ] Le serveur dev est bien lancé (pas de cache)
- [ ] Les logs montrent bien `📧 Sending invitation email`
- [ ] Resend Dashboard montre l'email dans l'historique

## Vérifier dans Resend

1. Va sur [resend.com/emails](https://resend.com/emails)
2. Vérifie l'historique des emails
3. Cherche par email destinataire
4. Si l'email apparaît :
   - Status "delivered" → vérifie tes spams
   - Status "bounced" → email invalide
   - Status "failed" → problème de config

## Si Toujours Pas d'Email

### Vérification Base de Données

Execute dans Supabase SQL Editor :

```sql
SELECT full_name, email, invitation_sent, managed_by_id, is_child
FROM public.guests
WHERE email = 'email-de-test@example.com';
```

Vérifie que :

- `invitation_sent` = `false` avant l'envoi
- `invitation_sent` = `true` après l'envoi réussi
- `is_child` = `false`
- `managed_by_id` est non null

## Emails de Confirmation vs Invitation

### Email de Confirmation RSVP (pour toi)

- Envoyé par : `sendRsvpConfirmation()`
- Quand : Après validation du formulaire RSVP
- Contenu : Récapitulatif de TES réponses + celles de tes invités gérés

### Email d'Invitation (pour tes invités)

- Envoyé par : `sendGuestInvitation()`
- Quand :
  1. Immédiatement après "Ajouter un invité" (si email fourni)
  2. Lors de la validation RSVP (si invité secondaire présent)
- Contenu : "[inviterName] a confirmé ta présence + lien de connexion"

## Next Steps

Si après toutes ces vérifications l'email ne part toujours pas :

1. Copie-colle les logs complets de la console
2. Vérifie l'historique Resend
3. Teste avec `/test-email`
4. Vérifie la BDD avec la requête SQL ci-dessus
