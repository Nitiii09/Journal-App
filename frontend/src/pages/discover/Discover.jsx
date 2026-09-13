import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Clock, Users, Search } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import FriendSearch from "../../components/friends/FriendSearch";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { SkeletonFriendCard } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";

import { getSuggestions } from "../../services/userService";
import useAuth from "../../hooks/useAuth";
import useFriends from "../../hooks/useFriends";
import { staggerContainer, staggerItem } from "../../animations/staggerAnimations";

/**
 * People you aren't connected to yet.
 *
 * There's no suggestions endpoint, so this reads GET /api/users/all and
 * filters out yourself, your friends, and anyone with a pending request in
 * either direction.
 */
export default function Discover() {
  const { user } = useAuth();
  const { connectedIds, sendRequest, loading: friendsLoading } = useFriends();

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentIds, setSentIds] = useState([]);
  const [pendingId, setPendingId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPeople(
        await getSuggestions({
          excludeId: user?.userId,
          excludeIds: connectedIds,
          limit: 18,
        })
      );
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, connectedIds]);

  // Wait for the friends/requests lists before filtering, or the first paint
  // would suggest people you're already connected to.
  useEffect(() => {
    if (!friendsLoading) load();
  }, [friendsLoading, load]);

  const handleSend = async (person) => {
    setPendingId(person._id);
    try {
      await sendRequest(person._id);
      setSentIds((prev) => [...prev, person._id]);
      toast.success("Request sent.", `@${person.username} will see it shortly.`);
    } catch (err) {
      toast.error("Couldn't send that.", err.message);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <PageTransition className="mx-auto max-w-7xl">
      <header className="mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="font-display text-[2rem] font-bold uppercase leading-[1.05] tracking-[-0.025em] sm:text-4xl lg:text-5xl"
        >
          Find your
          <br />
          <span className="text-primary">circle.</span>
        </motion.h1>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <p className="max-w-lg font-journal text-journal-body italic text-on-surface-variant">
            People who show up most days. Small circles read better than large ones.
          </p>

          <Button
            icon={Search}
            variant="outline"
            onClick={() => setSearchOpen(true)}
            className="ml-auto"
          >
            Search by name
          </Button>
        </div>

        <div className="mt-7 h-px w-full bg-outline-variant" />
      </header>

      {error ? (
        <ErrorState error={error} onRetry={load} />
      ) : loading ? (
        <div className="grid gap-gutter sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonFriendCard key={i} />
          ))}
        </div>
      ) : people.length === 0 ? (
        <EmptyState
          icon={Users}
          title="You've found everyone."
          body="There's no one left to add right now. Search by username if someone new joins."
          actionLabel="Search by name"
          onAction={() => setSearchOpen(true)}
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.08)}
          initial="initial"
          animate="animate"
          className="grid gap-gutter sm:grid-cols-2 xl:grid-cols-3"
        >
          {people.map((person) => {
            const sent = sentIds.includes(person._id) || person.relationship === "request_sent";

            return (
              <motion.article
                key={person._id}
                variants={staggerItem}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                className="relative overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-lowest p-6 transition-colors duration-200 hover:border-outline-variant"
              >
                <div>
                  <div className="mb-6 flex items-start gap-4">
                    <Avatar username={person.username} size="lg" />
                    <div className="min-w-0 flex-1 pt-1.5">
                      <h3 className="truncate font-display text-lg font-bold tracking-tight">
                        @{person.username}
                      </h3>
                      <p className="mt-1.5 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/50">
                        Not in your circle
                      </p>
                    </div>
                  </div>

                  {sent ? (
                    <Badge
                      tone="secondary"
                      icon={Clock}
                      className="w-full justify-center py-3"
                    >
                      Request sent
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      icon={UserPlus}
                      loading={pendingId === person._id}
                      onClick={() => handleSend(person)}
                      className="w-full"
                    >
                      Send request
                    </Button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}

      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        eyebrow="Find someone"
        title="Search by username"
        size="lg"
      >
        <FriendSearch
          onSendRequest={async (found) => {
            await sendRequest(found._id);
            toast.success("Request sent.", `@${found.username} will see it shortly.`);
          }}
        />
      </Modal>
    </PageTransition>
  );
}
