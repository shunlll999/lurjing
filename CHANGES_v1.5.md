# LurJing v1.5 — Product Analytics + Firestore Feedback

## Product Analytics
- GA4 `route_view` event for route changes.
- GA4 `ui_click` event for clickable UI elements.
- Firebase UID is used as GA4 User ID for signed-in non-admin users.
- No email, display name, store name, input value, or raw element text is sent to GA4.
- Admin sessions are excluded from product analytics.

## Firestore Important Events
Only these important product events are copied to Firestore:
- `user_registered`
- `user_login`
- `profile_updated`
- `csv_imported`
- `feedback_submitted`

Admin page:
- `/admin/analytics`

## Tracking switch
Admin can enable/disable:
- Master Product Tracking
- GA4
- Firestore Important Events

Page:
- `/admin/settings`

The setting is stored at:
- `settings/tracking`

## Feedback
Feedback is stored at:
- `feedback/{feedbackId}`

Users can:
- submit feedback
- read their own feedback

Admin can:
- view all feedback
- approve / reject
- mark Featured only when the user allowed future testimonial use
- delete feedback

Real feedback is NOT displayed on the Landing Page yet.
The Landing Page continues to show clearly labeled POC demo testimonials only.

## Firestore Rules
Rules were updated for:
- users
- feedback
- analytics_events
- settings

The POC admin email in the rules is:
- `admin@lurjing.com`

If the Admin email changes later, update the `isAdmin()` rule too.

## Required setup
Make sure `.env.local` contains:
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

Then deploy rules:

```bash
firebase deploy --only firestore:rules
```

Restart the app:

```bash
rm -rf .next out
pnpm dev
```

For production static export:

```bash
pnpm build
firebase deploy --only hosting
```
