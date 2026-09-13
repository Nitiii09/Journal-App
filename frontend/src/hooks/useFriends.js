import { useCallback, useEffect, useMemo, useState } from "react";
import * as friendService from "../services/friendService";
import * as journalService from "../services/journalService";
import { invalidateUserCache } from "../services/userService";
import { setConversationId } from "../utils/storage";
import useAuth from "./useAuth";

/**
 * Friends, pending requests (both directions), and who has written today.
 *
 * The API's /friends/requests returns incoming AND outgoing together, so the
 * split happens in friendService and both lists come back from one call.
 */
export function useFriends({ auto = true, includeRequests = true } = {}) {
  const { user } = useAuth();
  const myId = user?.userId;

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [writtenToday, setWrittenToday] = useState([]);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tasks = [friendService.getFriends()];
      if (includeRequests) tasks.push(friendService.getFriendRequests(myId));

      const [friendList, requestGroups] = await Promise.all(tasks);

      setFriends(friendList);
      setRequests(requestGroups?.incoming ?? []);
      setSentRequests(requestGroups?.sent ?? []);

      // 403 here is expected and meaningful — it means "you haven't written
      // today", not a failure. Swallow it and leave the list empty.
      try {
        setWrittenToday(await journalService.getFriendsWrittenToday());
      } catch (gateError) {
        if (gateError.status !== 403) throw gateError;
        setWrittenToday([]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [includeRequests, myId]);

  useEffect(() => {
    if (auto) load();
  }, [auto, load]);

  const accept = useCallback(
    async (requestId) => {
      // Capture the room id before it becomes unreachable — once accepted,
      // no endpoint returns this request again.
      const incoming = requests.find((r) => r._id === requestId);
      const senderId = incoming?.senderId?._id ?? incoming?.senderId;
      if (senderId) setConversationId(myId, senderId, requestId);

      const request = await friendService.acceptFriendRequest(requestId);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      setFriends(await friendService.getFriends());
      invalidateUserCache();
      return request;
    },
    [requests, myId]
  );

  const reject = useCallback(async (requestId) => {
    await friendService.rejectFriendRequest(requestId);
    setRequests((prev) => prev.filter((r) => r._id !== requestId));
  }, []);

  const sendRequest = useCallback(
    async (target) => {
      const request = await friendService.sendFriendRequest(target);

      // The id survives acceptance unchanged, so recording it now means the
      // chat room is known if they accept later.
      const receiverId = request?.receiverId?._id ?? request?.receiverId;
      if (receiverId && request?._id) {
        setConversationId(myId, receiverId, request._id);
      }

      // Re-read so the Sent list reflects the new request immediately.
      const groups = await friendService.getFriendRequests(myId);
      setSentRequests(groups.sent);
      return request;
    },
    [myId]
  );

  // Merge the "wrote today" list into each friend record so cards need one prop.
  const enriched = useMemo(() => {
    const writtenIds = new Set(writtenToday.map((w) => String(w.userId)));
    return friends.map((friend) => ({
      ...friend,
      wroteToday: writtenIds.has(String(friend._id)),
    }));
  }, [friends, writtenToday]);

  const activeToday = enriched.filter((f) => f.wroteToday).length;

  /** Ids the caller is already connected to or has a request with. */
  const connectedIds = useMemo(
    () => [
      ...friends.map((f) => String(f._id)),
      ...requests.map((r) =>
        String(r.senderId?._id ?? r.senderId)
      ),
      ...sentRequests.map((r) =>
        String(r.receiverId?._id ?? r.receiverId)
      ),
    ],
    [friends, requests, sentRequests]
  );

  return {
    friends: enriched,
    requests,
    sentRequests,
    writtenToday,
    activeToday,
    connectedIds,
    loading,
    error,
    reload: load,
    accept,
    reject,
    sendRequest,
  };
}

export default useFriends;
