import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Users, Search } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import FriendGrid from "../../components/friends/FriendGrid";
import FriendSearch from "../../components/friends/FriendSearch";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ErrorState from "../../components/ui/ErrorState";
import { toast } from "../../components/ui/Toast";
import useFriends from "../../hooks/useFriends";

export default function Friends() {
  const { friends, activeToday, loading, error, reload, sendRequest } = useFriends({
    includeRequests: false,
  });
  const [addOpen, setAddOpen] = useState(false);

  const handleSendRequest = async (user) => {
    try {
      await sendRequest(user._id);
      toast.success("Request sent.", `@${user.username} will see it shortly.`);
    } catch (err) {
      toast.error("Couldn't send that.", err.message);
      throw err;
    }
  };

  if (error) {
    return (
      <PageTransition>
        <ErrorState error={error} onRetry={reload} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-7xl">
      <header className="relative mb-9 lg:mb-12">
        <span
          className="watermark absolute -left-3 -top-8 hidden text-[10rem] lg:block"
          aria-hidden="true"
        >
          ✳
        </span>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="font-display text-[2rem] font-bold uppercase leading-[1.05] tracking-[-0.025em] sm:text-4xl lg:text-5xl"
          >
            Your people.
          </motion.h1>

          {/* Mobile: one compact line. Desktop: badges with room to breathe. */}
          <p className="mt-3 flex items-center gap-2 font-annotation text-sm text-on-surface-variant lg:hidden">
            <Users className="h-4 w-4 text-primary" strokeWidth={2.4} />
            {loading ? (
              "…"
            ) : (
              <>
                {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
                <span className="text-outline">•</span>
                <span className="text-primary">{activeToday} Active Today</span>
              </>
            )}
          </p>

          <div className="mt-7 hidden flex-wrap items-center gap-4 lg:flex">
            <Badge tone="secondary">
              {loading ? "…" : `${friends.length} friends`}
            </Badge>
            <Badge tone="tertiary" dot>
              {loading ? "…" : `${activeToday} active today`}
            </Badge>

            <Button
              icon={UserPlus}
              onClick={() => setAddOpen(true)}
              className="ml-auto"
            >
              Add friend
            </Button>
          </div>

          {/* Mobile search opens the same add-friend flow. */}
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-7 flex w-full items-center gap-3 border-b-2 border-outline-variant pb-2.5 text-left lg:hidden"
          >
            <Search className="h-5 w-5 shrink-0 text-on-surface-variant" strokeWidth={2} />
            <span className="font-journal text-journal-body text-on-surface-variant/50">
              Find a friend…
            </span>
          </button>

          <div className="mt-7 hidden h-0.5 w-full bg-on-surface lg:block" />
        </div>
      </header>

      <FriendGrid
        friends={friends}
        loading={loading}
        onAddFriend={() => setAddOpen(true)}
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        eyebrow="Add someone"
        title="Who should be reading your days?"
        size="lg"
      >
        <FriendSearch onSendRequest={handleSendRequest} />
      </Modal>
    </PageTransition>
  );
}
