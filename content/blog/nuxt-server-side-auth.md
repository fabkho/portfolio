---
tag: "NUXT"
title: "Server-Side Auth in Nuxt: From 4 Redirects to Zero"
description: "How moving OAuth handling from client middleware to Nitro server middleware eliminated redundant redirects and made every authenticated page load instant."
date: "2026-01-15"
author: "Fabian Kirchhoff"
specs: ["NUXT", "AUTH", "PERFORMANCE"]
status: published
featured: true
order: 2
---

# Server-Side Auth in Nuxt: From 4 Redirects to Zero

Every page load in our admin app went through four redirects before the user saw anything. Not just on login — on *every* request, for *already authenticated* users. The fix required understanding exactly when Nuxt runs code and moving auth to the right place in the lifecycle.

## The Problem

Our initial auth implementation used a Nuxt route middleware — the standard approach you'll find in most tutorials. The middleware checked for a valid session and redirected to the OAuth provider if none was found.

The redirect chain for an authenticated user hitting `/admin/welcome`:

```
/admin/welcome
  → /admin/login          (middleware: no session found)
  → cognitor.test/oauth/authorize  (login page redirects to OAuth)
  → /admin/login/callback (OAuth redirects back with code)
  → /admin/welcome        (callback sets session, redirects to destination)
```

Four round-trips. Over 2 seconds of total duration. And this happened on *every page load* — not just on first login.

The root cause: **Nuxt route middleware runs on the client, after the Vue app has already booted**. By the time the middleware checked for a session, the browser had already loaded HTML, parsed JS, and hydrated the app. A redirect at that point means doing all of it again.

## The Nuxt Lifecycle

To understand the fix, you need to know when code actually runs:

**Server (on every request):**
1. Nitro server plugins
2. **Nitro server middleware** ← fastest possible interception
3. Nuxt app plugins
4. Route validation
5. Nuxt route middleware ← where our old auth lived
6. Render page
7. Send HTML

**Client (in browser):**
1. Parse HTML
2. Nuxt app plugins
3. Route validation
4. Nuxt route middleware
5. Hydration
6. Page is interactive

The old auth ran at step 5 on the server, then again at step 4 on the client — after all the heavy lifting. Moving it to step 2 means the redirect happens before a single byte of Vue is processed.

## The New Architecture

Three components with clear separation of concerns:

### 1. `session-guard.ts` — Nitro server middleware

The gatekeeper. Runs on every request before the Nuxt app boots:

```typescript
// server/middleware/session-guard.ts
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const isPublic = publicRoutes.some(route => path.startsWith(route))

  if (isPublic) return

  // Handle OAuth callback — no token needed here
  if (path.startsWith('/login/callback')) {
    const { code, state } = getQuery(event)
    const tokens = await exchangeCodeForTokens(code, state)
    setAuthCookies(event, tokens)
    return sendRedirect(event, '/')
  }

  // Validate existing session
  const accessToken = getCookie(event, 'access_token')

  if (!accessToken) {
    return sendRedirect(event, buildOAuthUrl(event))
  }

  const isValid = await validateToken(accessToken)

  if (!isValid) {
    const refreshed = await refreshAccessToken(event)
    if (!refreshed) return sendRedirect(event, buildOAuthUrl(event))
  }

  // Pass token to client via SSR context
  event.context.auth = { accessToken }
})
```

Key points:
- The OAuth callback (`/login/callback`) is now handled entirely server-side — no Vue page needed, no client-side JavaScript
- Token validation happens before the app renders
- Valid tokens are passed to the client via `event.context` for store hydration

### 2. `authStore.ts` — client-side source of truth

The store hydrates itself from the SSR context on first mount, then manages token state client-side:

```typescript
// stores/authStore.ts
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<User | null>(null)

  async function hydrate() {
    // On SSR, pick up token set by session-guard
    const nuxtApp = useNuxtApp()
    const ctx = nuxtApp.ssrContext?.event.context.auth

    if (ctx?.accessToken) {
      accessToken.value = ctx.accessToken
      await fetchUser()
    }
  }

  async function refreshToken() {
    const newToken = await $fetch('/api/auth/refresh', { method: 'POST' })
    accessToken.value = newToken
  }

  return { accessToken, user, hydrate, refreshToken }
})
```

### 3. `useAuth.ts` — component API

A thin facade over the store, so components never touch Pinia directly:

```typescript
// composables/useAuth.ts
export function useAuth() {
  const store = useAuthStore()

  return {
    isAuthenticated: computed(() => !!store.accessToken),
    user: computed(() => store.user),

    signIn() {
      navigateTo(buildOAuthUrl(), { external: true })
    },

    async signOut() {
      store.accessToken = null
      store.user = null
      deleteCookie('access_token')
      await navigateTo('/login')
    }
  }
}
```

## Results

The redirect chain after the rework:

**Authenticated user** (the common case):
```
/admin/welcome → /admin/welcome ✓
```
Zero redirects. The session-guard validates the cookie server-side and lets the request through. The page renders immediately.

**Fresh login:**
```
/admin/welcome → cognitor.test/oauth/authorize → /admin/welcome
```
Two redirects — the minimum possible for OAuth 2.0. The callback page is gone; the session-guard handles it directly.

| Scenario | Before | After |
|----------|--------|-------|
| Authenticated page load | 4 redirects, ~2.2s | 0 redirects |
| Fresh login | 4 redirects | 2 redirects (OAuth minimum) |
| Login callback | Vue page renders | Server redirect, no Vue |

## What Moved Where

The `useRoute` middleware didn't disappear — it still runs, but now for **business logic** (permission checks, feature flags) rather than auth. Security is enforced server-side; the middleware is just convenience.

The `/login/callback` and `/login` routes became server-only. No Vue components, no hydration overhead for pages whose only job is to redirect.

## Key Takeaway

Nuxt gives you multiple execution points. Nitro server middleware is the fastest one — it runs before anything Vue-related touches the request. For anything that needs to happen on every request (auth, feature flags, locale detection), that's where it belongs.

Client-side middleware runs after the app boots. That's useful for progressive enhancement and navigation guards within an already-authenticated session — not for the initial auth check that determines whether the user should see the page at all.
