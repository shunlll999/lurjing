# Cookie Consent / PDPA

- Added global cookie consent banner.
- Added `Necessary only`, `Accept all`, and granular Analytics settings.
- Added persistent cookie settings badge so consent can be changed later.
- Consent is stored in a first-party cookie for 180 days; no localStorage is used for consent.
- Google Analytics is not initialized until Analytics consent is granted.
- Firestore `analytics_events` are also skipped when Analytics consent is not granted.
- Existing Firebase Auth, seller data, feedback, admin and tracking settings remain unchanged.
- Added `/cookies` policy page and public navigation/footer links.
