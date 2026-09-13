import api from "./api";
import { USE_MOCK } from "../utils/constants";
import { getStartOfISTDay, isTodayIST } from "../utils/dateUtils";
import {
  MOCK_MY_JOURNALS,
  MOCK_FRIENDS_TODAY,
  MOCK_FRIENDS,
  MOCK_FRIEND_JOURNALS,
  fallbackFriendJournals,
  MOCK_USER,
  delay,
} from "./mockData";

/**
 * Mirrors the eight journal endpoints exactly. In mock mode the module keeps
 * an in-memory copy of the archive so writing today's entry genuinely changes
 * the app's state — the unlock mechanic is real, just not persisted.
 */
let mockArchive = [...MOCK_MY_JOURNALS];

export async function createJournal({ content, isPublic = true }) {
  if (USE_MOCK) {
    await delay(650);

    if (mockArchive.some((j) => isTodayIST(j.journalDate))) {
      throw { status: 409, message: "You already have a journal for this day" };
    }

    const now = new Date().toISOString();
    const journal = {
      _id: `j_${Date.now()}`,
      userId: MOCK_USER.userId,
      content,
      isPublic,
      journalDate: getStartOfISTDay().toISOString(),
      createdAt: now,
      updatedAt: now,
    };
    mockArchive = [journal, ...mockArchive];
    return journal;
  }

  const { data } = await api.post("/journals/create", { content, isPublic });
  return data.journal;
}

export async function editTodayJournal({ content, isPublic }) {
  if (USE_MOCK) {
    await delay(550);
    const index = mockArchive.findIndex((j) => isTodayIST(j.journalDate));
    if (index === -1) {
      throw { status: 404, message: "You don't have a journal for today" };
    }

    const updated = {
      ...mockArchive[index],
      ...(content !== undefined && { content }),
      ...(isPublic !== undefined && { isPublic }),
      updatedAt: new Date().toISOString(),
    };
    mockArchive = mockArchive.map((j, i) => (i === index ? updated : j));
    return updated;
  }

  const payload = {};
  if (content !== undefined) payload.content = content;
  if (isPublic !== undefined) payload.isPublic = isPublic;

  const { data } = await api.patch("/journals/today/edit", payload);
  return data.journal;
}

export async function getMyJournals() {
  if (USE_MOCK) {
    await delay(600);
    return [...mockArchive].sort(
      (a, b) => new Date(b.journalDate) - new Date(a.journalDate)
    );
  }

  const { data } = await api.get("/journals/mine");
  return data.journals ?? [];
}

/** Returns null rather than throwing on 404 — "no entry yet" is a normal state. */
export async function getTodayJournal() {
  if (USE_MOCK) {
    await delay(450);
    return mockArchive.find((j) => isTodayIST(j.journalDate)) ?? null;
  }

  try {
    const { data } = await api.get("/journals/today");
    return data.journal;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

/** Gated server-side: 403 until the caller has written today. */
export async function getFriendsTodayJournals() {
  if (USE_MOCK) {
    await delay(700);
    if (!mockArchive.some((j) => isTodayIST(j.journalDate))) {
      throw {
        status: 403,
        message: "Write today's journal to unlock your friends' entries",
      };
    }
    return MOCK_FRIENDS_TODAY;
  }

  const { data } = await api.get("/journals/friends/today");
  return data.journals ?? [];
}

/** Who wrote today — names only, no content. Same 403 gate. */
export async function getFriendsWrittenToday() {
  if (USE_MOCK) {
    await delay(400);
    if (!mockArchive.some((j) => isTodayIST(j.journalDate))) {
      throw { status: 403, message: "Write today's journal to unlock this list" };
    }
    return MOCK_FRIENDS.filter((f) => f.wroteToday).map((f) => ({
      userId: f._id,
      username: f.username,
      isPublic: true,
    }));
  }

  const { data } = await api.get("/journals/friends/written-today");
  return data.friendsWrittenToday ?? [];
}

export async function getFriendJournals(friendId) {
  if (USE_MOCK) {
    await delay(650);
    return MOCK_FRIEND_JOURNALS[friendId] ?? fallbackFriendJournals(friendId);
  }

  const { data } = await api.get(`/journals/friend/${friendId}`);
  return data.journals ?? [];
}

export async function getFriendTodayJournal(friendId) {
  if (USE_MOCK) {
    await delay(500);
    if (!mockArchive.some((j) => isTodayIST(j.journalDate))) {
      throw {
        status: 403,
        message: "Write today's journal to unlock your friends' entries",
      };
    }
    return MOCK_FRIENDS_TODAY.find((j) => j.userId._id === friendId) ?? null;
  }

  try {
    const { data } = await api.get(`/journals/friend/${friendId}/today`);
    return data.journal;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

/** Test hook: reset the in-memory archive back to its seeded state. */
export function __resetMockArchive() {
  mockArchive = [...MOCK_MY_JOURNALS];
}
