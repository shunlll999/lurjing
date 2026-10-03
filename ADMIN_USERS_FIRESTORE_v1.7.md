# LurJing v1.7 — Firestore Admin User Management

## Changed

- `/admin/users` now reads `users/{uid}` from Firestore.
- Removed localStorage as the Admin user list source.
- Search works against display name, store name, email, plan and status.
- Admin can Activate / Deactivate normal user profiles.
- Demo/Admin system accounts are protected from status changes in the UI.
- `/admin` Overview registered-user count now reads Firestore users.
- Firestore Rules allow Admin to change only `status` and `updatedAt` on a user profile.
- Admin cannot change another user's id, email, role, plan or createdAt.

## Important

Deactivate controls LurJing app access through the Firestore profile. It does not delete or disable the Firebase Authentication record itself.

Deletion / Firebase Auth disable should be implemented later with Firebase Admin SDK or Cloud Functions on a trusted backend.

## Deploy

```bash
firebase deploy --only firestore:rules
rm -rf .next out
pnpm dev
```

Then login with the configured Admin account and open:

```text
/admin/users
```

If the Admin email differs from `admin@lurjing.com`, update `isAdmin()` in `firestore.rules` before deployment.
