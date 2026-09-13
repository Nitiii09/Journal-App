import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import JournalReader from "../../components/journal/JournalReader";
import Loader from "../../components/ui/Loader";
import ErrorState from "../../components/ui/ErrorState";
import useJournal from "../../hooks/useJournal";
import useAuth from "../../hooks/useAuth";
import { isTodayIST } from "../../utils/dateUtils";
import { LOADING_MESSAGES } from "../../utils/constants";

/**
 * Reads one of the user's own entries. There is no GET /journals/:id route,
 * so the entry is selected out of the archive already in memory — which also
 * means no extra request when arriving from the timeline.
 */
export default function JournalViewPage() {
  const { journalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { journals, loading, error, reload } = useJournal();

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
        <ErrorState error={error} onRetry={reload} />
      </PageTransition>
    );
  }

  const journal = journals.find((j) => j._id === journalId);

  if (!journal) {
    return (
      <PageTransition>
        <ErrorState
          error={{ status: 404, message: "That entry isn't in your archive." }}
          onRetry={() => navigate("/journal")}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Link
        to="/journal"
        className="mb-10 inline-flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.6} />
        Your story
      </Link>

      <JournalReader
        journal={journal}
        author={user?.username}
        canEdit={isTodayIST(journal.journalDate)}
        onEdit={() => navigate("/journal/write")}
      />
    </PageTransition>
  );
}
