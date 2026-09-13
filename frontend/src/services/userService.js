import api from "./api";
import { USE_MOCK } from "../utils/constants";
import { MOCK_DISCOVER, MOCK_USER, delay } from "./mockData";

/**
 * User discovery, built against exactly what the backend provides:
 *
 *   GET /api/users/search?username=<q>   → { count, users: [{ userId, username }] }
 *   GET /api/users/all                   → { count, users: [{ _id,    username }] }
 *
 * Note the two routes disagree on the id field name (`userId` vs `_id`), so
 * everything is normalised through `normaliseUser` before it reaches the UI.
 *
 * There is no /users/me, /users/:id, or /users/suggestions — those are
 * derived here from the two routes above.
 */

/** Both id shapes in, one shape out. */
function normaliseUser(raw) {
  return {
    _id: raw._id ?? raw.userId,
    username: raw.username,
  };
}

/** Cache of /users/all — it's a full table scan, so don't repeat it needlessly. */
let allUsersCache = null;
let allUsersCachedAt = 0;
const ALL_USERS_TTL = 30_000;

async function fetchAllUsers({ force = false } = {}) {
  const fresh = Date.now() - allUsersCachedAt < ALL_USERS_TTL;
  if (!force && allUsersCache && fresh) return allUsersCache;

  const { data } = await api.get("/users/all");
  allUsersCache = (data.users ?? []).map(normaliseUser);
  allUsersCachedAt = Date.now();
  return allUsersCache;
}

export function invalidateUserCache() {
  allUsersCache = null;
  allUsersCachedAt = 0;
}

/**
 * Username search.
 *
 * The API takes `?username=`, returns matches including the caller, and does
 * not escape the term before using it as a regex — so we escape it here and
 * filter ourselves out.
 */
export async function searchUsers(query, { excludeId } = {}) {
  const trimmed = (query ?? "").trim();
  if (trimmed.length < 2) return [];

  if (USE_MOCK) {
    await delay(350);
    return MOCK_DISCOVER.filter((u) =>
      u.username.toLowerCase().includes(trimmed.toLowerCase())
    ).map(normaliseUser);
  }

  const { data } = await api.get("/users/search", {
    params: { username: trimmed },
  });

  return (data.users ?? [])
    .map(normaliseUser)
    .filter((u) => !excludeId || u._id !== excludeId);
}

/** Exact-username existence check — powers the signup availability field. */
export async function usernameExists(username) {
  const trimmed = (username ?? "").trim();
  if (!trimmed) return false;

  if (USE_MOCK) {
    await delay(300);
    return ["rahul", "maya", "admin", "test"].includes(trimmed.toLowerCase());
  }

  // Search is a case-insensitive substring match, so narrow to an exact,
  // case-insensitive equality ourselves.
  const { data } = await api.get("/users/search", {
    params: { username: trimmed },
  });

  return (data.users ?? []).some(
    (u) => u.username.toLowerCase() === trimmed.toLowerCase()
  );
}

/**
 * Discover suggestions.
 *
 * No /users/suggestions route exists, so this is built from /users/all with
 * the caller, their friends, and anyone with a pending request filtered out.
 */
export async function getSuggestions({
  excludeId,
  excludeIds = [],
  limit = 12,
} = {}) {
  if (USE_MOCK) {
    await delay(500);
    return MOCK_DISCOVER.map(normaliseUser).slice(0, limit);
  }

  const everyone = await fetchAllUsers();
  const skip = new Set([excludeId, ...excludeIds].filter(Boolean));

  return everyone.filter((u) => !skip.has(u._id)).slice(0, limit);
}

/**
 * A single profile by id. No /users/:id route, so this reads from the
 * full-user list — which is why that response is cached.
 */
export async function getUserById(userId) {
  if (!userId) return null;

  if (USE_MOCK) {
    await delay(300);
    const found = MOCK_DISCOVER.find((u) => u._id === userId);
    return found ? normaliseUser(found) : null;
  }

  const everyone = await fetchAllUsers();
  return everyone.find((u) => u._id === userId) ?? null;
}

/**
 * The caller's own profile. There is no /users/me, so identity comes from
 * the stored auth user and the counts are derived by the pages that already
 * load journals and friends.
 */
export async function getMe(authUser) {
  if (USE_MOCK) {
    await delay(250);
    return { ...MOCK_USER };
  }
  return authUser ?? null;
}
