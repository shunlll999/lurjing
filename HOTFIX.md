# LurJing Firestore Auth Hotfix v1.4.1

Replace these files in the project, then:

```bash
firebase deploy --only firestore:rules

rm -rf .next out
pnpm dev
```

Open browser Console. On load, confirm:

```text
[LurJing Auth] Firestore AuthProvider v1.4.1 loaded
```

For an existing signed-in Firebase Auth user that has no Firestore document yet,
you should then see:

```text
[Firestore] users/<uid> missing — creating fallback profile
[Firestore] users/<uid> fallback profile created
```

Then Firebase Console > Firestore should show:

```text
users
  <uid>
```

This hotfix also makes Profile save defensive so an old AuthProvider cannot crash
the page with `Cannot read properties of undefined (reading 'ok')`.
