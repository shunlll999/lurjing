# LurJing Firebase Setup

## 1) Environment

Copy:

```bash
cp .env.example .env.local
```

Fill the Firebase Web App config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lurjing.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lurjing
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lurjing.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL=admin@lurjing.com
NEXT_PUBLIC_DEMO_EMAIL=demo@lurjing.com
NEXT_PUBLIC_DEMO_PASSWORD=demo1234
```

Do not copy JavaScript object commas into `.env`.

## 2) Authentication

Firebase Console:

Authentication → Sign-in method → Enable Email/Password

Create the Demo user manually if you want the Demo button to work.

## 3) Firestore

Firebase Console:

Firestore Database → Create database

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

Registered users are written to:

```text
users/{firebaseUid}
```

Profile fields include:

- id
- email
- displayName
- storeName
- phone
- plan
- role
- status
- emailVerified
- providerId
- createdAt
- updatedAt
- lastLoginAt
- termsAcceptedAt
- isDemo

Passwords are never stored in Firestore.

## 4) Data behavior

- Demo account automatically uses mock seller data.
- Real users start with an empty Dashboard.
- Real users only see data they import themselves.
- Imported POC seller data is kept in browser localStorage and is namespaced by Firebase UID.

## 5) Build / Firebase Hosting

```bash
pnpm install
pnpm build
firebase deploy --only hosting
```

Next.js static export is written to `out/`.


## Product Analytics v1.5

This build uses two layers:

1. **GA4**
   - `route_view`
   - `ui_click`
   - does not send email, display name, or store name
   - Firebase UID is used as GA4 `user_id` for signed-in non-admin users

2. **Firestore `analytics_events`**
   - `user_registered`
   - `user_login`
   - `profile_updated`
   - `csv_imported`
   - `feedback_submitted`

Only important events are copied to Firestore to keep read/write volume small.

The Admin can turn tracking on/off from:

```text
/admin/settings
```

Admin activity is excluded from product tracking.

### Feedback

Feedback is now stored in:

```text
feedback/{feedbackId}
```

Users can read their own feedback.
The Admin can view/moderate/delete feedback from:

```text
/admin/feedback
```

Real feedback is **not displayed on the Landing Page yet**.

### Deploy rules

After updating the project:

```bash
firebase deploy --only firestore:rules
```
