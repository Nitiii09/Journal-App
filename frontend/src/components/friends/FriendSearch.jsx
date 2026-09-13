import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Clock, Users, Loader2 } from "lucide-react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import useDebounce from "../../hooks/useDebounce";
import useAuth from "../../hooks/useAuth";
import useFriends from "../../hooks/useFriends";
import { searchUsers } from "../../services/userService";
import { staggerContainer, staggerItem } from "../../animations/staggerAnimations";

/**
 * Add-friend search, backed by GET /api/users/search?username=
 *
 * The endpoint returns bare { userId, username } with no relationship info,
 * so the caller's friends and pending requests are cross-referenced here to
 * decide what each row should offer. Without that the UI would show "Send
 * request" for people you're already friends with, and the API would answer
 * with a 409.
 */

const STATES = {
  friends: { label: "Already friends", icon: Users, tone: "tertiary" },
  request_sent: { label: "Request sent", icon: Clock, tone: "secondary" },
  request_received: { label: "Wants to add you", icon: UserPlus, tone: "primary" },
};

export default function FriendSearch({ onSendRequest }) {
  const { user } = useAuth();
  const { friends, requests, sentRequests } = useFriends();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [sentIds, setSentIds] = useState([]);
  const [pendingId, setPendingId] = useState(null);

  const debounced = useDebounce(query, 350);

  // id → relationship, built once per change rather than per row.
  const relationships = useMemo(() => {
    const map = {};
    friends.forEach((f) => {
      map[String(f._id)] = "friends";
    });
    requests.forEach((r) => {
      map[String(r.senderId?._id ?? r.senderId)] = "request_received";
    });
    sentRequests.forEach((r) => {
      map[String(r.receiverId?._id ?? r.receiverId)] = "request_sent";
    });
    return map;
  }, [friends, requests, sentRequests]);

  useEffect(() => {
    let cancelled = false;
    const trimmed = debounced.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setSearching(true);
    setError(null);

    searchUsers(trimmed, { excludeId: user?.userId })
      .then((found) => {
        if (!cancelled) setResults(found);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, user?.userId]);

  const handleSend = async (found) => {
    setPendingId(found._id);
    try {
      await onSendRequest?.(found);
      setSentIds((prev) => [...prev, found._id]);
    } finally {
      setPendingId(null);
    }
  };

  const trimmed = query.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < 2;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/55"
          strokeWidth={2.2}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username…"
          aria-label="Search for a user by username"
          className="rule-input pl-7 font-sans text-[15px]"
          autoFocus
        />
        {searching && (
          <Loader2 className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      <div className="min-h-[9rem]">
        <AnimatePresence>
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-l-2 border-error bg-error-container/30 px-4 py-3 font-annotation text-xs text-error"
            >
              {error.message ?? "Search failed. Try again."}
            </motion.p>
          ) : tooShort ? (
            <motion.p
              key="short"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-10 text-center font-journal text-[15px] italic text-on-surface-variant/55"
            >
              Keep typing — at least two characters.
            </motion.p>
          ) : results.length > 0 ? (
            <motion.ul
              key="results"
              variants={staggerContainer(0.05)}
              initial="initial"
              animate="animate"
              className="divide-y divide-outline-variant/60"
            >
              {results.map((found) => {
                const relationship = sentIds.includes(found._id)
                  ? "request_sent"
                  : relationships[String(found._id)];
                const state = STATES[relationship];

                return (
                  <motion.li
                    key={found._id}
                    variants={staggerItem}
                    className="flex items-center gap-4 py-4"
                  >
                    <Avatar username={found.username} size="md" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-bold tracking-tight">
                        @{found.username}
                      </p>
                    </div>

                    {state ? (
                      <Badge
                        tone={state.tone}
                        icon={state.icon}
                        size="sm"
                        className="shrink-0"
                      >
                        {state.label}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={UserPlus}
                        loading={pendingId === found._id}
                        onClick={() => handleSend(found)}
                        className="shrink-0"
                      >
                        Send request
                      </Button>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : (
            trimmed.length >= 2 &&
            !searching && (
              <motion.p
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 text-center font-journal text-lg italic text-on-surface-variant/60"
              >
                No one here by that name.
              </motion.p>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
