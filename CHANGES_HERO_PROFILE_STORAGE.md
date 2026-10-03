# Hero + Shop Profile Image

- Redesigned the landing hero profit preview with store identity, revenue, true profit, margin, sales bars and profit trend.
- Early feedback period is clearly labeled FREE across hero, CTA, feedback section and registration.
- Added Firebase Storage shop avatar upload to `/profile`.
- Avatar URL/path are saved in Firestore `users/{uid}`.
- Uploaded shop avatar is reused in the signed-in sidebar/topbar/profile.
- Added `storage.rules` and Firebase Storage configuration to `firebase.json`.
- No realtime Firestore/Storage listener was added.
