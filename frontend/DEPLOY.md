# Deploying to Vercel

Frontend on Vercel, backend on your friend's Render service.

---

## 1. Get the Render URL

Ask your friend for the service URL. It looks like:

```
https://something.onrender.com
```

Check it's alive before going further:

```bash
curl https://something.onrender.com/api/health
```

Expect `{"message":"health ok!","time":"..."}`. The first request after the
service has been idle can take **30–50 seconds** on Render's free tier — that
is normal, not a failure.

---

## 2. Set the environment variable

`VITE_API_URL` must include the **`/api`** suffix:

```
VITE_API_URL=https://something.onrender.com/api
```

**Locally** — put it in `frontend/.env`:

```
VITE_API_URL=https://something.onrender.com/api
```

**On Vercel** — Project → Settings → Environment Variables → Add:

| Name | Value | Environments |
|---|---|---|
| `VITE_API_URL` | `https://something.onrender.com/api` | Production, Preview, Development |

⚠️ Vite bakes env vars in **at build time**. Changing this in Vercel requires a
**redeploy** to take effect — it will not update on its own.

---

## 3. Deploy

Import the repo in Vercel and set:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| **Root Directory** | **`frontend`** |
| Build Command | `npm run build` |
| Output Directory | `dist` |

The Root Directory matters — this repo has `frontend/` and the backend folders
side by side, so Vercel must be pointed at `frontend`.

[vercel.json](vercel.json) already handles SPA routing: without its rewrite,
loading `/journal` or `/friends` directly would 404, because those paths only
exist client-side in React Router.

---

## 4. Backend must allow your Vercel origin

This is the step that usually breaks first, and only your friend can fix it.

The backend currently uses:

```js
cors({ origin: true, credentials: true })
```

`origin: true` reflects whatever origin asks, so a Vercel domain is allowed as
is — **no change needed**. If your friend later tightens it to a fixed list,
your Vercel URL has to be added or every request fails CORS.

### About the auth cookie

The backend sets its `token` cookie with `sameSite: "lax"`, which browsers will
**not** store across sites. Vercel → Render is cross-site, so that cookie is
effectively dead in production.

This app does not depend on it: the token is also returned in the login/signup
response body, saved to `localStorage`, and sent as `Authorization: Bearer`.
That path works cross-origin. No action needed — just don't be surprised the
cookie is missing in devtools.

---

## 5. After deploying — check these

1. **Signup** — create a fresh account. Watch the username field turn green/red as you type.
2. **Write today's entry** — confirm the unlock animation runs and the friends' feed opens.
3. **Refresh the page** while signed in — you should stay logged in.
4. **Open `/journal` directly** in a new tab — should load, not 404. (If it 404s, `vercel.json` isn't being picked up — check Root Directory.)
5. **Discover → send a request** — then check the Sent tab.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| All requests fail, console shows CORS | Backend isn't allowing your Vercel origin |
| First load hangs ~40s then works | Render cold start. Expected on free tier. |
| `404` on `/journal` refresh | `vercel.json` not applied — check Root Directory is `frontend` |
| Logged out on every refresh | `localStorage` blocked (private mode / tracking protection) |
| `//users/all` in network tab | `VITE_API_URL` has a trailing slash. It's stripped in code, but remove it anyway. |
| Env change did nothing | Vite inlines at build time — redeploy |

---

## What this build does NOT use

The backend has no route for these, so the UI doesn't offer them:

- Withdrawing a sent request — sent requests are shown read-only
- Friend streak badges — `viewFriends` returns only `{_id, username}`
- Server-side username checking — done client-side via `/api/users/search`
- Server-side discovery ranking — Discover reads `/api/users/all` and filters locally

If your friend adds `/auth/check-username`, `/users/suggestions`, `/users/me`,
`/friends/requests/sent`, or a cancel route, tell me and I'll switch these over
— the service layer is the only thing that would change.
