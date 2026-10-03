# Public Feedback Landing Integration

- Removed all mock/demo testimonial cards from the landing page.
- Landing page now reads only real Firestore feedback that is:
  - `moderationStatus == "approved"`
  - `allowPublic == true`
  - `featured == true`
- Admin `Mark Featured` is the release switch for public display.
- No realtime listener or polling is used. Public feedback is fetched once when the landing section loads.
- If there is no public feedback yet, the landing page shows a product-feedback invitation instead of fake reviews.
- Firestore rules expose only the approved, consented, featured feedback documents to public visitors.
