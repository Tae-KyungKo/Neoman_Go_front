# Phase 8 Frontend SSE Reissue/Reconnect

## Policy

- SSE uses `@microsoft/fetch-event-source`.
- SSE authentication uses `Authorization: Bearer {accessToken}`.
- Access tokens must not be sent as query parameters.
- Native `EventSource` alone is not used because it cannot attach the required authorization header.
- Refresh tokens are received in the login JSON response and stored with the existing local token storage policy.
- `POST /api/auth/reissue` receives `{ refreshToken }` in the JSON request body.

## Runtime Flow

1. The notification stream connects to `/api/notifications/stream` with the access token in the `Authorization` header.
2. If the SSE open request fails with `401` or `403`, the auth layer calls the reissue API with the stored refresh token.
3. On reissue success, the auth layer stores the new access token and refresh token, updates React auth state, and the SSE hook reconnects with the new access token.
4. After reconnect, the frontend dispatches `neomango:notifications:refresh` with `source: 'sse-reconnect'`.
5. The notification page and bell already listen to that event and refetch notification REST APIs, so missed notifications are recovered from the database-backed notification list.
6. On reissue failure, frontend auth state and stored tokens are cleared and the user is moved to `/login`.

## Known Risk

- Phase 8 first deployment allows one SSE connection per browser tab.
- Multiple tabs can therefore create multiple backend SSE connections and duplicate realtime toasts per tab.
- A `BroadcastChannel` or leader-tab strategy is intentionally deferred to a later hardening step.
