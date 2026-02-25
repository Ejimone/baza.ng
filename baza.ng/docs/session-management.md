# Session Management

## Summary

The app now restores authenticated sessions automatically on reload.

On startup, the app attempts `POST /auth/refresh`. If successful, it fetches `/user/me` and hydrates auth state so users continue directly into the app without signing in again.

## Bootstrap Flow

1. App starts.
2. Attempt refresh request.
3. If refresh succeeds, store new access token.
4. Fetch current user profile (`/user/me`).
5. Mark user as authenticated and continue to app routes.
6. If refresh fails, continue to auth routes.

## Notes

- Frontend no longer gates startup refresh on locally stored refresh token presence.
- Frontend logout no longer relies on local refresh-token deletion for bootstrap behavior.

## Files

- `app/_layout.tsx`
- `hooks/useAuth.ts`
