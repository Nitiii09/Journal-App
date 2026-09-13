import { TOKEN_KEY, USER_KEY, THEME_KEY } from "./constants";

/**
 * Thin, defensive wrapper around localStorage — Safari private mode and
 * disabled-storage settings both throw on access, and a journal app should
 * never white-screen because of that.
 */

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — fall through to in-memory session */
  }
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

export const getToken = () => safeGet(TOKEN_KEY);
export const setToken = (token) => safeSet(TOKEN_KEY, token);
export const clearToken = () => safeRemove(TOKEN_KEY);

export function getUser() {
  const raw = safeGet(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    safeRemove(USER_KEY);
    return null;
  }
}

export const setUser = (user) => safeSet(USER_KEY, JSON.stringify(user));
export const clearUser = () => safeRemove(USER_KEY);

export const getStoredTheme = () => safeGet(THEME_KEY);
export const setStoredTheme = (theme) => safeSet(THEME_KEY, theme);

/**
 * friendUserId → friendRequestId map.
 *
 * Chat rooms are keyed by the id of the accepted FriendRequest, but no API
 * returns that id once a request has been accepted: `viewFriends` drops it
 * and `/friends/requests` only lists pending ones.
 *
 * The id *is* visible at two moments though — when you send a request, and
 * when you accept one — and accepting only flips `status`, so the id stays
 * the same. Recording it at those two points covers every friendship formed
 * from either side once this is live. Friendships that predate it have no
 * cached id, and the UI says so rather than guessing.
 *
 * Scoped per signed-in user so two accounts on one device don't collide.
 */
const CONVERSATION_KEY = "daymark_conversations";

function readConversations() {
  const raw = safeGet(CONVERSATION_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    safeRemove(CONVERSATION_KEY);
    return {};
  }
}

export function getConversationId(ownerId, friendUserId) {
  if (!ownerId || !friendUserId) return null;
  return readConversations()?.[String(ownerId)]?.[String(friendUserId)] ?? null;
}

export function setConversationId(ownerId, friendUserId, friendRequestId) {
  if (!ownerId || !friendUserId || !friendRequestId) return;
  const all = readConversations();
  const mine = all[String(ownerId)] ?? {};
  mine[String(friendUserId)] = String(friendRequestId);
  all[String(ownerId)] = mine;
  safeSet(CONVERSATION_KEY, JSON.stringify(all));
}

export function getConversationMap(ownerId) {
  if (!ownerId) return {};
  return readConversations()?.[String(ownerId)] ?? {};
}

/**
 * Last-read timestamps, for unread counts.
 *
 * The Message model has no read state, so "unread" can only be tracked on
 * the client: the moment a thread is opened is recorded, and anything newer
 * from the other person counts as unread.
 */
const READ_KEY = "daymark_last_read";

function readReceipts() {
  const raw = safeGet(READ_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    safeRemove(READ_KEY);
    return {};
  }
}

export function getLastRead(ownerId, conversationId) {
  if (!ownerId || !conversationId) return 0;
  return readReceipts()?.[String(ownerId)]?.[String(conversationId)] ?? 0;
}

export function setLastRead(ownerId, conversationId, when = Date.now()) {
  if (!ownerId || !conversationId) return;
  const all = readReceipts();
  const mine = all[String(ownerId)] ?? {};
  mine[String(conversationId)] = when;
  all[String(ownerId)] = mine;
  safeSet(READ_KEY, JSON.stringify(all));
}

export function clearSession() {
  clearToken();
  clearUser();
  // Conversation ids are deliberately kept — they are not secrets, and
  // losing them on logout would permanently orphan those chats.
}
