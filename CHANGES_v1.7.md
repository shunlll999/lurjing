# LurJing v1.7 — Firestore Admin User Management

- `/admin/users` now lists profiles from Firestore `users/{uid}` instead of browser localStorage.
- Admin Overview registered-user counts also use Firestore.
- Search supports name, store, email, plan and status.
- Admin can Activate / Deactivate normal users by updating Firestore `status`.
- Demo/Admin system accounts are protected from status changes.
- Normal user sessions listen to their Firestore profile; Deactivate signs the user out without waiting for a reload.
- Firestore Rules allow Admin to change only `status` and `updatedAt` for normal users.
- Delete is intentionally not exposed in the browser. Firebase Authentication deletion should use Admin SDK / Cloud Functions later.

## Deploy

```bash
firebase deploy --only firestore:rules
rm -rf .next out
pnpm dev
```
