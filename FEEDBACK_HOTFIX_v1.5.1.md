# LurJing Feedback Hotfix v1.5.1

This fixes the user Feedback page so it:
- validates the Firebase Auth session before Firestore calls
- shows the real Firebase/Firestore error instead of a generic failure
- no longer silently disables submission when the message is under 10 characters
- prevents Analytics errors from blocking Feedback submission
- always exits loading state when there is no user session

## Replace files
- `src/lib/feedback.ts`
- `src/app/(app)/feedback/page.tsx`
- `firestore.rules`

## Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Restart Next.js

```bash
rm -rf .next out
pnpm dev
```

## Test

1. Login with a normal Firebase Email/Password user.
2. Open `/feedback`.
3. Type at least 10 characters.
4. Click `ส่ง Feedback`.
5. Firestore should create:
   `feedback/{auto-id}`
6. The same feedback should appear in the user's history.
7. Login as admin and open `/admin/feedback`.

If the write is still blocked, the page will now show the exact problem, such as:
- Firestore Rules permission denied
- Firebase session mismatch
- Firestore unavailable
