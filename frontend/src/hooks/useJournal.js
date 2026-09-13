import { useCallback, useEffect, useMemo, useState } from "react";
import * as journalService from "../services/journalService";
import { computeStreak, isTodayIST } from "../utils/dateUtils";

/**
 * Owns the WRITE → UNLOCK → READ state machine.
 *
 * `hasWrittenToday` is the single boolean the whole product hinges on: it
 * decides whether the friends' feed renders locked or open, and it is derived
 * from the archive rather than stored separately so the two can never drift.
 */
export function useJournal({ auto = true } = {}) {
  const [journals, setJournals] = useState([]);
  const [todayJournal, setTodayJournal] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mine, today] = await Promise.all([
        journalService.getMyJournals(),
        journalService.getTodayJournal(),
      ]);
      setJournals(mine);
      setTodayJournal(today);
      return { mine, today };
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auto) load();
  }, [auto, load]);

  const create = useCallback(async ({ content, isPublic }) => {
    const journal = await journalService.createJournal({ content, isPublic });
    setTodayJournal(journal);
    setJournals((prev) => [journal, ...prev]);
    return journal;
  }, []);

  const editToday = useCallback(async ({ content, isPublic }) => {
    const journal = await journalService.editTodayJournal({ content, isPublic });
    setTodayJournal(journal);
    setJournals((prev) => prev.map((j) => (j._id === journal._id ? journal : j)));
    return journal;
  }, []);

  const stats = useMemo(() => {
    const dates = journals.map((j) => j.journalDate);
    const publicCount = journals.filter((j) => j.isPublic).length;

    return {
      total: journals.length,
      publicCount,
      privateCount: journals.length - publicCount,
      streak: computeStreak(dates),
      // Share of the days since the first entry that actually have one.
      consistency: (() => {
        if (journals.length < 2) return journals.length ? 100 : 0;
        const sorted = [...dates].sort((a, b) => new Date(a) - new Date(b));
        const span =
          Math.round(
            (new Date(sorted[sorted.length - 1]) - new Date(sorted[0])) / 86400000
          ) + 1;
        return Math.round((journals.length / span) * 100);
      })(),
    };
  }, [journals]);

  const hasWrittenToday = Boolean(todayJournal) || journals.some((j) => isTodayIST(j.journalDate));

  return {
    journals,
    todayJournal,
    hasWrittenToday,
    stats,
    loading,
    error,
    reload: load,
    create,
    editToday,
  };
}

export default useJournal;
