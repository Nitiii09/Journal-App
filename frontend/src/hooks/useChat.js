import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSocket,
  getMessages,
  senderIdOf,
} from "../services/chatService";
import useAuth from "./useAuth";

/**
 * One conversation: history over REST, live messages over the socket.
 *
 * The server broadcasts to everyone in the room including the sender, so
 * sent messages arrive back through `receive_message` rather than being
 * appended locally. An optimistic placeholder covers the gap in between and
 * is reconciled when the real one lands.
 */
export function useChat(friendRequestId) {
  const { user } = useAuth();
  const myId = user?.userId;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(Boolean(friendRequestId));
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);

  const pendingRef = useRef([]);

  // ---- history ----
  useEffect(() => {
    if (!friendRequestId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMessages(friendRequestId)
      .then((history) => {
        if (!cancelled) setMessages(history);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [friendRequestId]);

  // ---- socket ----
  useEffect(() => {
    if (!friendRequestId) return undefined;

    const socket = getSocket();
    if (!socket) return undefined;

    const onConnect = () => {
      setConnected(true);
      socket.emit("join_chat", { friendRequestId });
    };
    const onDisconnect = () => {
      setConnected(false);
      setJoined(false);
    };
    const onJoined = (payload) => {
      if (payload?.friendRequestId === friendRequestId) setJoined(true);
    };
    const onChatError = (payload) => {
      setError({ status: 403, message: payload?.message ?? "Chat error" });
    };

    const onReceive = (incoming) => {
      if (String(incoming.friendRequestId) !== String(friendRequestId)) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === incoming._id)) return prev;

        // Replace our optimistic copy if this is the echo of it.
        const optimisticIndex = prev.findIndex(
          (m) =>
            m.pending &&
            m.message === incoming.message &&
            senderIdOf(m) === senderIdOf(incoming)
        );

        if (optimisticIndex !== -1) {
          const next = [...prev];
          next[optimisticIndex] = incoming;
          return next;
        }
        return [...prev, incoming];
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat_joined", onJoined);
    socket.on("chat_error", onChatError);
    socket.on("receive_message", onReceive);

    // Already connected when this mounted — join now rather than waiting
    // for a "connect" that has already fired.
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat_joined", onJoined);
      socket.off("chat_error", onChatError);
      socket.off("receive_message", onReceive);
      setJoined(false);
    };
  }, [friendRequestId]);

  const send = useCallback(
    (text) => {
      const trimmed = (text ?? "").trim();
      if (!trimmed || !friendRequestId) return false;

      const socket = getSocket();
      if (!socket) return false;

      const optimistic = {
        _id: `pending_${Date.now()}_${pendingRef.current.length}`,
        friendRequestId,
        senderId: myId,
        message: trimmed,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      pendingRef.current.push(optimistic._id);
      setMessages((prev) => [...prev, optimistic]);

      socket.emit("send_message", { friendRequestId, message: trimmed });
      return true;
    },
    [friendRequestId, myId]
  );

  return { messages, loading, error, connected, joined, send, myId };
}

export default useChat;
