# Early analytics cache update

- Firestore remains the source of truth for tracking settings.
- No realtime listener was added.
- Concurrent tracking-settings reads are deduplicated in memory.
- Failed tracking-settings reads cache the default value for 5 minutes, preventing repeated retries on every UI event when Firestore is unavailable or quota is exhausted.
- Product-stage wording now uses `Early`.
