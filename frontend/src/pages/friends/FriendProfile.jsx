import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Flame, Lock, ArrowRight } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import JournalTimeline from "../../components/journal/JournalTimeline";
import JournalCard from "../../components/journal/JournalCard";
import JournalReaderModal from "../../components/journal/JournalReaderModal";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { SunDivider } from "../../components/ui/SunMark";
import FriendStatus from "../../components/friends/FriendStatus";

import useJournal from "../../hooks/useJournal";
import { getFriendJournals, getFriendTodayJournal } from "../../services/journalService";
import { getUserById } from "../../services/userService";
import { LOADING_MESSAGES } from "../../utils/constants";
import { isTodayIST } from "../../utils/dateUtils";

/**
 * A friend's public archive.
 *
 * Two separate calls, because the backend gates them differently:
 *  - GET /journals/friend/:id       → all public entries, friendship only
 *  - GET /journals/friend/:id/today → today's entry, ALSO requires that the
 *                                      viewer has written their own day
 */
export default function FriendProfile() {
  const { friendId } = useParams();
  const { hasWrittenToday } = useJournal();

  const [friend, setFriend] = useState(null);
  const [journals, setJournals] = useState([]);
  const [todayEntry, setTodayEntry] = useState(null);
  const [todayLocked, setTodayLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reading, setReading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the profile directly rather than looking it up in the friends
      // list — otherwise opening this URL in a new tab has no name to show.
      const [profile, entries] = await Promise.all([
        getUserById(friendId),
        getFriendJournals(friendId),
      ]);

      setFriend(profile);
      setJournals(entries);

      try {
        setTodayEntry(await getFriendTodayJournal(friendId));
        setTodayLocked(false);
      } catch (gateError) {
        // 403 = you haven't written today. Expected, not an error.
        if (gateError.status === 403) setTodayLocked(true);
        else throw gateError;
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [friendId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageTransition>
        <Loader message={LOADING_MESSAGES.journal} />
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <ErrorState error={error} onRetry={load} />
      </PageTransition>
    );
  }

  const username = friend?.username ?? "this friend";
  const entryLabel = journals.length === 1 ? "entry" : "entries";
  // Today's entry is shown separately, so keep it out of the archive list.
  const archive = journals.filter((j) => !isTodayIST(j.journalDate));

  return (
    <PageTransition className="mx-auto max-w-5xl">
      <Link
        to="/friends"
        className="mb-10 inline-flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.6} />
        Your people
      </Link>

      <header className="mb-14 flex flex-col items-start gap-7 sm:flex-row sm:items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
        >
          <Avatar username={username} size="2xl" active={friend?.wroteToday} />
          <span className="absolute -bottom-2 -right-4 rotate-[-6deg] px-2 py-1 font-display text-[11px] font-bold text-on-secondary">
            @{username}
          </span>
        </motion.div>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[1.9rem] font-bold uppercase leading-tight tracking-[-0.02em] md:text-4xl">
            {username}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant">
              <BookOpen className="h-3.5 w-3.5" strokeWidth={2.4} />
              {journals.length} public {entryLabel}
            </span>

            {friend?.streak > 0 && (
              <span className="flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant">
                <Flame className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
                {friend.streak} day streak
              </span>
            )}

            <FriendStatus wroteToday={Boolean(friend?.wroteToday)} />
          </div>
        </div>
      </header>

      {/* Today, gated */}
      <section className="mb-14">
        <h2 className="mb-6 font-display text-xl font-bold uppercase tracking-tight">
          Today
        </h2>

        {todayLocked || !hasWrittenToday ? (
          <div className="relative overflow-hidden border border-outline-variant/60 bg-surface-low px-6 py-14 text-center">
            <span className="mx-auto mb-6 grid h-14 w-14 place-items-center border-2 border-primary bg-surface-lowest text-primary">
              <Lock className="h-6 w-6" strokeWidth={2.2} />
            </span>

            <h3 className="font-display text-xl font-bold uppercase tracking-tight">
              Write yours first.
            </h3>
            <p className="mx-auto mt-4 max-w-sm font-journal text-journal-body italic text-on-surface-variant">
              {username}&rsquo;s page for today stays closed until you&rsquo;ve marked
              your own.
            </p>

            <Button
              as={Link}
              to="/journal/write"
              iconRight={ArrowRight}
              className="mt-8"
            >
              Write today
            </Button>
          </div>
        ) : todayEntry ? (
          <JournalCard
            journal={todayEntry}
            mode="feed"
            authorName={username}
            onClick={() => setReading(todayEntry)}
          />
        ) : (
          <div className="border border-dashed border-outline-variant px-6 py-12 text-center">
            <p className="font-journal text-journal-body italic text-on-surface-variant/70">
              {username} hasn&rsquo;t posted a public entry today.
            </p>
          </div>
        )}
      </section>

      <SunDivider className="mb-14" />

      <section>
        <h2 className="mb-8 font-display text-xl font-bold uppercase tracking-tight">
          Earlier
        </h2>

        {archive.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nothing earlier to read."
            body={`${username} hasn't made any older entries public.`}
          />
        ) : (
          <JournalTimeline
            journals={archive}
            linkable={false}
            onSelect={setReading}
          />
        )}
      </section>

      {reading && (
        <JournalReaderModal
          journal={reading}
          authorName={username}
          onClose={() => setReading(null)}
        />
      )}
    </PageTransition>
  );
}
