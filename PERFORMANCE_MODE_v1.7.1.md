# LurJing v1.7.1 — Firestore Lite Performance Mode

This version removes Firestore realtime listeners from the app.

## What changed

- Replaced `firebase/firestore` with `firebase/firestore/lite` for Firestore access.
- Removed `onSnapshot()` from user status monitoring.
- Admin pages use one-time reads/writes only.
- Normal users get a one-time status check when navigating between protected routes.
- Status checks are throttled to at most once every 15 seconds during rapid navigation.
- Active status checks do not call `setUser()`, avoiding unnecessary rerenders.
- `ensureUserProfile()` no longer performs a duplicate Firestore read when a profile already exists.
- `/admin/users` now has an explicit Refresh button.

## Expected Network behavior

You should no longer see a persistent Firestore realtime `Listen/channel` connection created by this app.
One-time Firestore Lite reads/writes may appear as normal short HTTP requests.

Firebase Authentication still uses its own session/auth mechanisms; that is separate from Firestore realtime listeners.

## Deactivate behavior

Because realtime listeners were intentionally removed:

1. Admin changes a user's status to `disabled`.
2. The user's current page is not force-logged-out instantly.
3. On the user's next protected-route navigation, LurJing checks the Firestore profile once.
4. If disabled, the user is signed out and redirected to Login.

Login also rejects disabled users immediately.

## Setup

No Firestore Rules changes are required for this performance update.

```bash
rm -rf .next out
pnpm install
pnpm dev
```

For production:

```bash
pnpm build
firebase deploy --only hosting
```
