import api from "./api";
import { USE_MOCK } from "../utils/constants";
import { MOCK_USER, delay } from "./mockData";
import { usernameExists, searchUsers } from "./userService";

/**
 * Note on the field name: the backend expects the *plaintext* password under
 * the key `passwordHash` (it hashes server-side). That naming is the API's,
 * not ours — the UI collects a normal "password" and maps it here so the
 * oddity stays contained to this one file.
 */

export async function signup({ username, password }) {
  if (USE_MOCK) {
    await delay(700);
    if (password.length < 6) {
      throw { status: 400, message: "Password must be at least 6 characters." };
    }
    return {
      token: "mock.jwt.token",
      user: { userId: `u_${username}`, username },
    };
  }

  const { data } = await api.post("/auth/signup", {
    username,
    passwordHash: password,
  });
  return { token: data.token, user: data.user };
}

export async function login({ username, password }) {
  if (USE_MOCK) {
    await delay(700);
    if (!username || !password) {
      throw { status: 400, message: "Both fields are required." };
    }
    return {
      token: "mock.jwt.token",
      user: { ...MOCK_USER, username },
    };
  }

  const { data } = await api.post("/auth/login", {
    username,
    passwordHash: password,
  });

  // The login endpoint currently omits `username` from its response, so we
  // fall back to what the user just typed rather than showing "undefined".
  return {
    token: data.token,
    user: { ...data.user, username: data.user?.username ?? username },
  };
}

/**
 * Live availability for the signup field.
 *
 * The backend has no /auth/check-username route, so this is built on
 * GET /api/users/search — which happens to require no token, exactly what a
 * not-yet-registered user needs. Rules below mirror the server's own signup
 * validation so the field can never say "available" for a name signup rejects.
 *
 * Always resolves to { available, reason, message, suggestions }; a network
 * failure resolves rather than throws, because someone mid-typing shouldn't
 * see a form error just because the check couldn't run.
 */

const MIN_USERNAME = 3;
const MAX_USERNAME = 20;
// Server allows letters, numbers and underscore only — no dots.
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

const SUFFIXES = ["writes", "daily", "journals", "notes", "pages", "today"];

function buildCandidates(base) {
  const room = MAX_USERNAME - base.length;
  const out = [];

  SUFFIXES.forEach((word) => {
    if (room >= word.length + 1) out.push(`${base}_${word}`);
    if (room >= word.length) out.push(`${base}${word}`);
  });

  [1, 2, 7, 21, 99].forEach((n) => {
    const len = String(n).length;
    if (room >= len) out.push(`${base}${n}`);
    if (room >= len + 1) out.push(`${base}_${n}`);
  });

  return [...new Set(out)].filter(
    (c) => c.length >= MIN_USERNAME && c.length <= MAX_USERNAME
  );
}

export async function checkUsername(username) {
  const trimmed = (username ?? "").trim();

  if (!trimmed) {
    return { available: false, reason: "empty", message: "Pick a username.", suggestions: [] };
  }
  if (trimmed.length < MIN_USERNAME) {
    return {
      available: false,
      reason: "too_short",
      message: `At least ${MIN_USERNAME} characters.`,
      suggestions: [],
    };
  }
  if (trimmed.length > MAX_USERNAME) {
    return {
      available: false,
      reason: "too_long",
      message: `At most ${MAX_USERNAME} characters.`,
      suggestions: [],
    };
  }
  if (!USERNAME_PATTERN.test(trimmed)) {
    return {
      available: false,
      reason: "invalid",
      message: "Letters, numbers and underscores only.",
      suggestions: [],
    };
  }

  if (USE_MOCK) {
    await delay(320);
    const taken = ["rahul", "maya", "admin", "test"];
    if (!taken.includes(trimmed.toLowerCase())) {
      return { available: true, message: "Available.", suggestions: [] };
    }
    return {
      available: false,
      reason: "taken",
      message: "That username is already taken.",
      suggestions: [`${trimmed}_writes`, `${trimmed}_daily`, `${trimmed}21`],
    };
  }

  try {
    if (!(await usernameExists(trimmed))) {
      return { available: true, message: "Available.", suggestions: [] };
    }

    // Taken. Offer alternatives, verified free rather than guessed: one
    // substring search on the base name tells us every existing username
    // that could collide with any candidate.
    const candidates = buildCandidates(trimmed);
    const neighbours = await searchUsers(trimmed);
    const taken = new Set(neighbours.map((u) => u.username.toLowerCase()));

    const suggestions = candidates
      .filter((c) => !taken.has(c.toLowerCase()))
      .slice(0, 5);

    return {
      available: false,
      reason: "taken",
      message: "That username is already taken.",
      suggestions,
    };
  } catch {
    // Couldn't reach the server — stay silent and let submit be the gate.
    return { available: null, reason: "unknown", message: "", suggestions: [] };
  }
}

export async function logout() {
  if (USE_MOCK) {
    await delay(220);
    return { success: true };
  }
  const { data } = await api.post("/auth/logout");
  return data;
}
