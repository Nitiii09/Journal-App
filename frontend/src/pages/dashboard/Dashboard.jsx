import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import WelcomeHero from "../../components/dashboard/WelcomeHero";
import DailyStatus from "../../components/dashboard/DailyStatus";
import DailyPrompt from "../../components/dashboard/DailyPrompt";
import StreakCard from "../../components/dashboard/StreakCard";
import FriendsToday from "../../components/dashboard/FriendsToday";
import LockedJournalFeed from "../../components/journal/LockedJournalFeed";
import JournalCard from "../../components/journal/JournalCard";
import JournalReaderModal from "../../components/journal/JournalReaderModal";
import { SkeletonJournalCard } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { SunDivider } from "../../components/ui/SunMark";

import useAuth from "../../hooks/useAuth";
import useJournal from "../../hooks/useJournal";
import useFriends from "../../hooks/useFriends";
import { getFriendsTodayJournals } from "../../services/journalService";
import { staggerContainer } from "../../animations/staggerAnimations";
import { BookOpen } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { todayJournal, journals, stats, hasWrittenToday, loading, error, reload } =
    useJournal();
  const { friends, loading: friendsLoading } = useFriends({ includeRequests: false });

  const [feed, setFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const feedRef = useRef(null);

  // Index of the entry open in the reader, or null. Storing the index (not
  // the entry) lets the reader page through the feed with prev/next.
  const [readingIndex, setReadingIndex] = useState(null);

  // Friends' entries are only fetched once the gate is actually open —
  // requesting earlier would just collect 403s.
  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    setFeedError(null);
    try {
      setFeed(await getFriendsTodayJournals());
    } catch (err) {
      // 403 here means "not written yet", which the locked view already says.
      if (err.status !== 403) setFeedError(err);
      setFeed([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasWrittenToday) loadFeed();
  }, [hasWrittenToday, loadFeed]);

  const scrollToFeed = () => {
    feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (error) {
    return (
      <PageTransition>
        <ErrorState error={error} onRetry={reload} className="mt-8" />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-7xl">
      <WelcomeHero username={user?.username} />

      <DailyPrompt className="mb-12 mt-8" />

      {/* Status + streak, deliberately asymmetric. */}
      <div className="grid gap-gutter lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <DailyStatus journal={todayJournal} onReadFriends={scrollToFeed} />
        <StreakCard streak={stats.streak} journals={journals} />
      </div>

      <FriendsToday friends={friends} loading={friendsLoading} className="mt-16" />

      <SunDivider className="my-16" />

      {/* The gate. */}
      <div ref={feedRef} className="scroll-mt-24">
        {!hasWrittenToday ? (
          <LockedJournalFeed friendCount={friends.filter((f) => f.wroteToday).length} />
        ) : (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-9"
            >
              <span className="mb-5 inline-flex items-center gap-2 border border-primary/30 bg-primary-fixed/50 px-3.5 py-1.5 font-display text-label-caps uppercase text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.6} />
                Today unlocked
              </span>

              <h2 className="font-display text-[1.9rem] font-bold uppercase leading-tight tracking-[-0.02em] md:text-4xl">
                Their day,
                <br />
                <span className="font-journal text-[2rem] font-bold normal-case italic text-primary md:text-[2.75rem]">
                  in fragments.
                </span>
              </h2>

              <p className="mt-6 border-l-[3px] border-primary pl-5 font-journal text-journal-body italic text-on-surface-variant">
                A window into the people who matter.
              </p>
            </motion.div>

            {feedError ? (
              <ErrorState error={feedError} onRetry={loadFeed} />
            ) : feedLoading ? (
              <div className="grid gap-gutter md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonJournalCard key={i} />
                ))}
              </div>
            ) : feed.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Nobody has written yet today."
                body="You're first. Check back this evening — the circle usually fills up after dark."
              />
            ) : (
              <motion.div
                variants={staggerContainer(0.1)}
                initial="initial"
                animate="animate"
                className="grid items-start gap-gutter md:grid-cols-2 xl:grid-cols-3"
              >
                {feed.map((journal, i) => (
                  <JournalCard
                    key={journal._id}
                    journal={journal}
                    mode="feed"
                    onClick={() => setReadingIndex(i)}
                    className={i % 3 === 1 ? "md:mt-8" : ""}
                  />
                ))}
              </motion.div>
            )}
          </section>
        )}
      </div>

      {readingIndex !== null && feed[readingIndex] && (
        <JournalReaderModal
          journal={feed[readingIndex]}
          onClose={() => setReadingIndex(null)}
          onPrev={() => setReadingIndex((i) => Math.max(0, i - 1))}
          onNext={() => setReadingIndex((i) => Math.min(feed.length - 1, i + 1))}
          hasPrev={readingIndex > 0}
          hasNext={readingIndex < feed.length - 1}
        />
      )}
    </PageTransition>
  );
}
