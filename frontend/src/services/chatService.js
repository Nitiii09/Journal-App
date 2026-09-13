import { io } from "socket.io-client";
import api from "./api";
import { API_URL } from "../utils/constants";
import { getToken } from "../utils/storage";

/**
 * Realtime chat over Socket.IO.
 *
 * Server events (see the backend's socket/chatSocket.js):
 *   emit  join_chat      { friendRequestId }
 *   emit  send_message   { friendRequestId, message }
 *   on    chat_joined    { friendRequestId }
 *   on    receive_message{ _id, friendRequestId, senderId, message, createdAt }
 *   on    chat_error     { message }
 *
 * A conversation is keyed by `friendRequestId` — the id of the *accepted*
 * FriendRequest that made the two people friends. That id is what the room
 * name is built from, and it is also the path segment for message history.
 */

// The socket connects to the server root, not the /api path the REST client uses.
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

let socket = null;

/** One shared connection for the whole app; reconnects if the token changed. */
export function getSocket() {
  const token = getToken();
  if (!token) return null;

  if (socket && socket.auth?.token !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      // Prefer a real websocket, but let Engine.IO fall back to polling on
      // networks that block upgrades.
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Render's free tier sleeps; the first connect can take a while.
      timeout: 30000,
      autoConnect: true,
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/** Message history for a conversation. */
export async function getMessages(friendRequestId) {
  if (!friendRequestId) return [];
  const { data } = await api.get(`/messages/${friendRequestId}`);
  return data.messages ?? [];
}

/** Normalise a message's sender to a plain id — it may arrive populated. */
export function senderIdOf(message) {
  const raw = message?.senderId;
  return raw && typeof raw === "object" ? String(raw._id) : String(raw ?? "");
}

export function senderNameOf(message) {
  const raw = message?.senderId;
  return raw && typeof raw === "object" ? raw.username : null;
}
