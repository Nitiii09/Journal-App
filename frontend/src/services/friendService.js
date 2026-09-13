import api from "./api";
import { USE_MOCK } from "../utils/constants";
import { MOCK_FRIENDS, MOCK_REQUESTS, delay } from "./mockData";

let mockFriends = [...MOCK_FRIENDS];
let mockRequests = [...MOCK_REQUESTS];

/**
 * The API accepts only `receiverId` — there is no username form — so a user
 * object or an id string are both reduced to an id here.
 */
export async function sendFriendRequest(target) {
  const receiverId =
    typeof target === "object" && target !== null ? target._id : target;

  if (USE_MOCK) {
    await delay(600);
    if (!receiverId) {
      throw { status: 400, message: "receiverId is required" };
    }
    if (mockFriends.some((f) => f._id === receiverId)) {
      throw { status: 409, message: "You are already friends" };
    }
    return { _id: `req_${Date.now()}`, receiverId, status: "pending" };
  }

  const { data } = await api.post("/friends/request", { receiverId });
  return data.friendRequest;
}

/**
 * GET /friends/requests returns BOTH directions — requests sent to you and
 * requests you sent. Splitting them here turns that into the two lists the
 * UI actually needs, and prevents the Requests page offering an "Accept"
 * button on your own outgoing request (which the API answers with a 404).
 *
 * Returns { incoming, sent }.
 */
export async function getFriendRequests(myUserId) {
  if (USE_MOCK) {
    await delay(550);
    return { incoming: mockRequests, sent: [] };
  }

  const { data } = await api.get("/friends/requests");
  const all = data.requests ?? [];

  const idOf = (value) =>
    value && typeof value === "object" ? String(value._id) : String(value);

  const me = String(myUserId ?? "");

  return {
    incoming: all.filter((r) => idOf(r.receiverId) === me),
    sent: all.filter((r) => idOf(r.senderId) === me),
  };
}

export async function acceptFriendRequest(requestId) {
  if (USE_MOCK) {
    await delay(500);
    const request = mockRequests.find((r) => r._id === requestId);
    if (!request) throw { status: 404, message: "Friend request not found" };

    mockRequests = mockRequests.filter((r) => r._id !== requestId);
    mockFriends = [
      {
        _id: request.senderId._id,
        username: request.senderId.username,
        streak: 0,
        wroteToday: false,
        joinedAt: new Date().toISOString(),
      },
      ...mockFriends,
    ];
    return { ...request, status: "accepted" };
  }

  const { data } = await api.patch(`/friends/request/${requestId}/accept`);
  return data.friendRequest;
}

export async function rejectFriendRequest(requestId) {
  if (USE_MOCK) {
    await delay(450);
    mockRequests = mockRequests.filter((r) => r._id !== requestId);
    return { message: "Friend request rejected" };
  }

  const { data } = await api.delete(`/friends/request/${requestId}/reject`);
  return data;
}

export async function getFriends() {
  if (USE_MOCK) {
    await delay(600);
    return mockFriends;
  }

  const { data } = await api.get("/friends/viewFriends");
  return data.friends ?? [];
}

/**
 * The API has no cancel/withdraw route — only the RECEIVER can act on a
 * request, via /accept or /reject. Sent requests are therefore shown
 * read-only, and the UI does not offer a withdraw action it cannot perform.
 */
export const CAN_CANCEL_REQUESTS = false;

export function __resetMockFriends() {
  mockFriends = [...MOCK_FRIENDS];
  mockRequests = [...MOCK_REQUESTS];
}
