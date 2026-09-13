# Daymark — Frontend

Write one page a day. Writing yours unlocks your friends'.

React + Vite frontend for the Journal App backend. **Connected to the live
Express API and MongoDB Atlas.**

```bash
# terminal 1
cd backend && npm run dev     # http://localhost:5000

# terminal 2
cd frontend && npm run dev    # http://localhost:5173
```

Both must be running. Create an account at `/signup` — accounts are real and
persist in Atlas.

To develop the UI without the backend, set `USE_MOCK = true` in
`src/utils/constants.js`; every screen then runs on fixture data.

---

## The core mechanic

Everything in this app hangs off one boolean: **have you written today?**

```
        ┌─────────────┐
        │   WRITE     │  POST /journals/create   (one per IST day)
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │   UNLOCK    │  the DAY UNLOCK animation
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │    READ     │  GET /journals/friends/today
        └─────────────┘
```

Before you write, the friends' feed renders as blurred **decoy** cards behind a
frosted layer. No real content is ever put in the DOM while locked, so the blur
can't be defeated by inspecting the page.

`useJournal().hasWrittenToday` is the single source of truth, derived from the
archive rather than stored separately so the two can't drift apart.

---

## Backend wiring

```js
// src/utils/constants.js
export const USE_MOCK = false;   // true = fixture data, no backend needed
```

```
# .env
VITE_API_URL=http://localhost:5000/api
```

Every function in `src/services/` has its real axios implementation next to a
mock branch, so flipping the flag changes nothing in the UI — no component
imports mock data directly.

The token is sent two ways, because the backend accepts both: an httpOnly
cookie (via `withCredentials`) and an `Authorization: Bearer` header.

### DNS note

`backend/.env` uses the **direct** (non-`+srv`) Atlas connection string. The
`mongodb+srv://` form needs a DNS SRV lookup, which some ISP routers refuse
with `querySrv ECONNREFUSED`. Both forms are in the file — swap them if your
network handles SRV (or set your DNS to `8.8.8.8`).

### What the backend does *not* have

These surfaces are built and clearly labelled in the UI as not-yet-connected,
so they can be wired up without a redesign:

| Surface | Missing endpoint |
|---|---|
| Friend search (`FriendSearch`) | No user-lookup route; `POST /friends/request` needs a receiverId you already know |
| Discover page | No suggestions route |

Deliberately **not** built, because the API doesn't support them: deleting a
journal, removing a friend, cancelling a sent request, comments, likes, follows.

Two response quirks the frontend absorbs so the UI stays correct:

- `POST /auth/login` omits `username` (it returns `user.name`/`email`/`role`,
  none of which exist on the `User` schema). `authService.login()` falls back to
  the typed username.
- `GET /journals/friend/:id/today` returns `userId` as a bare ObjectId, while
  `GET /journals/friends/today` populates it to `{ _id, username }`. `JournalCard`
  takes an `authorName` prop so the caller can supply the name it already knows.

---

## Dates are IST, always

The backend files every entry under **midnight India Standard Time (UTC+5:30)**.
The browser's local timezone is irrelevant — someone in New York writing at 11pm
is already on tomorrow's IST page.

`src/utils/dateUtils.js` mirrors `backend/src/utils/dateHelper.js` exactly. Never
use raw `new Date()` comparisons for "is this today" — use `isTodayIST()`.

---

## Design system

From the Stitch export in `../stitch_daymark_editorial_social_journaling/`.
"Maximalist Editorial" — magazine production values, scrapbook intimacy.

**Colour** is driven by CSS custom properties holding `R G B` triplets, defined
on `:root` and overridden on `.dark` in `index.css`. That's why a single class
like `bg-surface` is correct in both themes.

| Token | Light | Dark |
|---|---|---|
| `surface` | `#fcf9f8` warm parchment | `#0a0c10` ink navy |
| `primary` | `#b32821` deep coral | `#ff7a6c` luminous coral |
| `secondary` | `#0040e0` cobalt | `#8ea2ff` |
| `tertiary-bright` | `#d2f000` acid yellow | same |

**Type** — three families, three jobs:
- `font-display` (Inter, 800) — headlines, UI, oversized numerals
- `font-journal` (Playfair Display) — every word a user writes
- `font-annotation` (Syne) — metadata, captions

**Material rules:**
- Hard offset shadows (`shadow-paper` = `4px 4px 0`), never soft blurs
- Inputs are a single 2px bottom rule, not boxes
- Buttons are sharp-cornered cut-outs that collapse their shadow on press
- Grain overlays everything via `body::before`
- Glass (`.frost`) only on nav chrome and the locked feed

---

## Animation

**Framer Motion** for interface state: page entrances, modals, cards, staggered
lists, the sidebar's active pill (a shared `layoutId`).

**GSAP** for choreography: hero drift, cursor parallax, counting numerals, and
the signature **DAY UNLOCK** sequence in `animations/gsapAnimations.js` —
button compresses → spinner → checkmark → lock appears → rotates → opens →
waves expand → particles scatter → heading slides in → cards reveal.

Two hard-won rules baked into this code:

1. **GSAP must not own DOM text.** A React re-render overwrites it and the value
   freezes. `countUp()` reports through a callback into React state instead.
2. **`requestAnimationFrame` is paused in background tabs.** Anything whose
   *visibility* depends on an animation needs a `setTimeout` fallback — see the
   safety nets in `countUp()` and `playUnlockSequence()`. For the same reason,
   `AnimatePresence mode="wait"` is avoided anywhere a stalled exit would strand
   stale state on screen (`DailyStatus`, `ThemeToggle`, route transitions).

`prefers-reduced-motion` is honoured globally in `index.css` and checked
explicitly before every GSAP timeline.

---

## Structure

```
src/
├── animations/     Framer variants + the GSAP timelines
├── components/
│   ├── layout/     AppLayout, Sidebar, Topbar, MobileNavbar, PageTransition
│   ├── journal/    Card, Editor, Reader, Timeline, Calendar, Visibility, LockedFeed
│   ├── friends/    Card, Grid, Search, RequestCard, Activity, Status
│   ├── dashboard/  WelcomeHero, DailyStatus, StreakCard, FriendsToday, DailyPrompt
│   ├── profile/    Header, Stats, Settings
│   └── ui/         Button, Input, Modal, Toast, Badge, Avatar, Skeleton,
│                   EmptyState, ErrorState, Loader, ThemeToggle, SunMark
├── context/        AuthContext, ThemeContext
├── hooks/          useAuth, useJournal, useFriends, useTheme, useDebounce,
│                   usePageTransition
├── pages/          auth · dashboard · journal · friends · discover · profile
├── routes/         AppRoutes, ProtectedRoute, PublicRoute
├── services/       api (axios) · auth · journal · friend · mockData
└── utils/          constants, dateUtils, formatDate, storage
```

Layout: sidebar on desktop (`lg+`), bottom navigation on mobile, with a floating
write button. Every page is reachable and usable at 375px.

---

## Notes

- Avatars are generated monograms with a deterministic accent colour, because
  the `User` model stores only a username — no avatar field to read.
- Profile shows no email, real name, or bio for the same reason.
- Error states map each backend status (401/403/404/409/500) to designed copy in
  `constants.js`. A duplicate-day 409 recovers into edit mode rather than dead-ending.
- Friend `streak` isn't a backend field, so streak badges only appear where the
  data supports them. "Wrote today" is real — it comes from
  `GET /journals/friends/written-today`.
- Mock data (when `USE_MOCK` is on) lives in memory only, so a refresh resets it.
