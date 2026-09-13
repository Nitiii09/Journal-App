import { useCallback, useEffect, useMemo, useState } from "react";
import { getMessages, getSocket, senderIdOf } from "../services/chatService";
import {
  getConversationMap,
  getLastRead,
  setLastRead,
} from "../utils/storage";
import useAuth from "./useAuth";
import useFriends from "./useFriends";

/** Broadcast so every mounted copy of this hook stays in step. */
const READ_EVENT = "daymark:conversation-read";

/**
 * The conversation list: friends, their room ids, a preview of the last
 * message, and an unread count.
 *
 * Previews need one history request per known conversation — there is no
 * endpoint that summarises them — so results are held in state and only
 * refetched when the set of rooms changes. A socket listener keeps previews
 * current without re-requesting anything.
 */
export function useConversations() {
  const { user } = useAuth();
  const myId = user?.userId;

  const { friends, loading: friendsLoading } = useFriends({ includeRequests: false });

  const [previews, setPreviews] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [readTick, setReadTick] = useState(0);

  /**
   * friendUserId → friendRequestId.
   *
   * `viewFriends` now returns `friendRequestId` directly, which is the real
   * source. The locally cached map — recorded when a request was sent or
   * accepted — is kept only as a fallback for a backend that predates that
   * field, and the API always wins where both exist.
   */
  const cachedIds = useMemo(() => getConversationMap(myId), [myId]);

  const idMap = useMemo(() => {
    const merged = { ...cachedIds };
    friends.forEach((friend) => {
      if (friend.friendRequestId) {
        merged[String(friend._id)] = String(friend.friendRequestId);
      }
    });
    return merged;
  }, [cachedIds, friends]);

  const roomIds = useMemo(
    () => friends.map((f) => idMap[String(f._id)]).filter(Boolean),
    [friends, idMap]
  );

  // A stable string key, so the effect re-runs only when the *set* of rooms
  // changes — not on every render that produces a new array identity.
  //
  // Deliberately not a ref guard: StrictMode invokes effects twice, and a
  // ref would make the second pass bail out while the first pass had already
  // been cancelled by its own cleanup — leaving previews permanently empty.
  const roomKey = useMemo(() => roomIds.slice().sort().join(","), [roomIds]);

  // ---- previews ----
  useEffect(() => {
    if (!roomKey) return undefined;
    const rooms = roomKey.split(",");

    let cancelled = false;
    setLoadingPreviews(true);

    Promise.all(
      rooms.map((roomId) =>
        getMessages(roomId)
          .then((messages) => [roomId, messages])
          // A room that 403s or 404s just has no preview; it shouldn't
          // take the whole list down with it.
          .catch(() => [roomId, []])
      )
    )
      .then((entries) => {
        if (cancelled) return;
        setPreviews(Object.fromEntries(entries));
      })
      .finally(() => {
        if (!cancelled) setLoadingPreviews(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomKey]);

  // ---- keep previews live ----
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onReceive = (incoming) => {
      setPreviews((prev) => {
        const roomId = String(incoming.friendRequestId);
        const existing = prev[roomId] ?? [];
        if (existing.some((m) => m._id === incoming._id)) return prev;
        return { ...prev, [roomId]: [...existing, incoming] };
      });
    };

    socket.on("receive_message", onReceive);
    return () => socket.off("receive_message", onReceive);
  }, []);

  /**
   * This hook runs in more than one place — the layout needs the badge count,
   * the page needs the list — and each copy holds its own state. Marking a
   * conversation read therefore broadcasts, so every instance recomputes
   * rather than only the one that made the call.
   */
  const markRead = useCallback(
    (conversationId) => {
      if (!conversationId) return;
      setLastRead(myId, conversationId, Date.now());
      window.dispatchEvent(new CustomEvent(READ_EVENT));
    },
    [myId]
  );

  useEffect(() => {
    const onRead = () => setReadTick((n) => n + 1);
    window.addEventListener(READ_EVENT, onRead);
    return () => window.removeEventListener(READ_EVENT, onRead);
  }, []);

  const conversations = useMemo(() => {
    // readTick is a dependency so unread counts recompute after markRead.
    void readTick;

    return friends
      .map((friend) => {
        const conversationId = idMap[String(friend._id)] ?? null;
        const messages = conversationId ? (previews[conversationId] ?? []) : [];
        const last = messages[messages.length - 1] ?? null;

        const lastRead = conversationId ? getLastRead(myId, conversationId) : 0;
        const unread = messages.filter(
          (m) =>
            senderIdOf(m) !== String(myId) &&
            new Date(m.createdAt).getTime() > lastRead
        ).length;

        return {
          ...friend,
          conversationId,
          lastMessage: last?.message ?? null,
          lastAt: last?.createdAt ?? null,
          lastFromMe: last ? senderIdOf(last) === String(myId) : false,
          unread,
        };
      })
      // Most recent conversation first; people you can't open sink to the
      // bottom rather than cluttering the top.
      .sort((a, b) => {
        if (!a.conversationId && b.conversationId) return 1;
        if (a.conversationId && !b.conversationId) return -1;
        if (a.lastAt && b.lastAt) return new Date(b.lastAt) - new Date(a.lastAt);
        if (a.lastAt) return -1;
        if (b.lastAt) return 1;
        return a.username.localeCompare(b.username);
      });
  }, [friends, idMap, previews, myId, readTick]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return {
    conversations,
    totalUnread,
    loading: friendsLoading,
    loadingPreviews,
    markRead,
  };
}

export default useConversations;
