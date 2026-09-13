import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileStats from "../../components/profile/ProfileStats";
import ProfileSettings from "../../components/profile/ProfileSettings";
import JournalCalendar from "../../components/journal/JournalCalendar";
import Loader from "../../components/ui/Loader";
import Badge from "../../components/ui/Badge";
import { SunDivider } from "../../components/ui/SunMark";

import useAuth from "../../hooks/useAuth";
import useJournal from "../../hooks/useJournal";
import useFriends from "../../hooks/useFriends";
import { excerpt, formatShort } from "../../utils/formatDate";
import { staggerContainer, staggerItem } from "../../animations/staggerAnimations";

export default function Profile() {
  const { user } = useAuth();
  const { journals, stats, loading } = useJournal();
  const { friends } = useFriends({ includeRequests: false });

  if (loading) {
    return (
      <PageTransition>
        <Loader message="Gathering your record…" />
      </PageTransition>
    );
  }

  const recent = journals.slice(0, 5);

  return (
    <PageTransition className="mx-auto max-w-6xl">
      <ProfileHeader user={user} streak={stats.streak} className="mb-14" />

      <ProfileStats stats={stats} friendCount={friends.length} className="mb-16" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-gutter">
        <section>
          <h2 className="mb-8 font-display text-xl font-bold uppercase tracking-tight">
            Recent activity
          </h2>

          {recent.length === 0 ? (
            <p className="border border-dashed border-outline-variant px-6 py-12 text-center font-journal text-journal-body italic text-on-surface-variant/70">
              Nothing written yet.
            </p>
          ) : (
            <motion.ul
              variants={staggerContainer(0.07)}
              initial="initial"
              animate="animate"
              className="divide-y divide-outline-variant/50 border-t border-outline-variant"
            >
              {recent.map((journal) => (
                <motion.li key={journal._id} variants={staggerItem}>
                  <Link
                    to={`/journal/${journal._id}`}
                    className="group flex items-start gap-5 py-6"
                  >
                    <span className="w-16 shrink-0 pt-0.5 font-display text-sm font-bold uppercase tracking-wider text-primary">
                      {formatShort(journal.journalDate)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-journal text-[17px] leading-relaxed text-on-surface">
                        {excerpt(journal.content, 130)}
                      </p>
                      <Badge
                        tone={journal.isPublic ? "secondary" : "neutral"}
                        size="sm"
                        className="mt-3"
                      >
                        {journal.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>

                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-on-surface-variant/40 transition-all group-hover:translate-x-1 group-hover:text-primary"
                      strokeWidth={2.4}
                    />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}

          {journals.length > recent.length && (
            <Link
              to="/journal"
              className="mt-8 inline-flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
            >
              All {journals.length} entries
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.6} />
            </Link>
          )}
        </section>

        <aside>
          <div className="lg:sticky lg:top-24">
            <JournalCalendar journals={journals} />
          </div>
        </aside>
      </div>

      <SunDivider className="my-16" />

      <ProfileSettings />
    </PageTransition>
  );
}
