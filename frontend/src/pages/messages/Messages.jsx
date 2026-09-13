import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Wifi,
  WifiOff,
  Flame,
  BookOpen,
} from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import ConversationList from "../../components/chat/ConversationList";
import MessageThread from "../../components/chat/MessageThread";
import ChatComposer from "../../components/chat/ChatComposer";
import Avatar from "../../components/ui/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";

import useConversations from "../../hooks/useConversations";
import useChat from "../../hooks/useChat";

/**
 * Messages.
 *
 * Mobile is two screens — the list, then the thread — driven by the route.
 * Desktop shows list, thread, and a context panel side by side, per the
 * chat workspace design.
 */
export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const { conversations, loading, markRead } = useConversations();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((c) => c.username.toLowerCase().includes(needle));
  }, [conversations, query]);

  const active = conversations.find((c) => c.conversationId === conversationId) ?? null;
  const { messages, loading: chatLoading, error, connected, send, myId } =
    useChat(conversationId);

  // Opening a thread clears its unread count; so does each new message
  // arriving while it's open.
  useEffect(() => {
    if (conversationId) markRead(conversationId);
  }, [conversationId, messages.length, markRead]);

  // A conversation id in the URL that matches no friend is stale.
  useEffect(() => {
    if (conversationId && !loading && !active) {
      navigate("/messages", { replace: true });
    }
  }, [conversationId, loading, active, navigate]);

  if (loading) {
    return (
      <PageTransition>
        <Loader message="Finding your people…" />
      </PageTransition>
    );
  }

  if (!conversations.length) {
    return (
      <PageTransition className="mx-auto max-w-5xl">
        <EmptyState
          icon={MessageSquare}
          title="No one to write to yet."
          body="Messages open up once you have friends. Add someone first."
          actionLabel="Find people"
          onAction={() => navigate("/discover")}
        />
      </PageTransition>
    );
  }

  const showThreadOnMobile = Boolean(conversationId);

  return (
    <PageTransition className="mx-auto max-w-[90rem]">
      <div className="lg:grid lg:h-[calc(100vh-9rem)] lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[20rem_minmax(0,1fr)_17rem]">
        {/* ---------- Conversation list ---------- */}
        <section
          className={`flex min-h-0 flex-col ${showThreadOnMobile ? "hidden lg:flex" : "flex"}`}
        >
          <header className="mb-5 px-margin-mobile md:px-0">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-journal text-[1.9rem] font-bold leading-tight tracking-tight lg:text-4xl"
            >
              Messages
            </motion.h1>
          </header>

          <ConversationList
            conversations={filtered}
            activeId={conversationId}
            onSelect={(c) => navigate(`/messages/${c.conversationId}`)}
            query={query}
            onQueryChange={setQuery}
            className="min-h-0 flex-1"
          />
        </section>

        {/* ---------- Thread ---------- */}
        <section
          className={`flex min-h-0 flex-col lg:border-x lg:border-outline-variant/60 ${
            showThreadOnMobile ? "flex" : "hidden lg:flex"
          }`}
        >
          {active ? (
            <>
              <header className="flex items-center gap-3 border-b border-outline-variant/60 px-margin-mobile py-3 md:px-8">
                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  aria-label="Back to messages"
                  className="-ml-1 shrink-0 p-1.5 text-on-surface-variant transition-colors hover:text-primary lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={2.4} />
                </button>

                <div className="min-w-0 flex-1 text-center lg:text-left">
                  <h2 className="truncate font-journal text-xl font-bold leading-tight">
                    {active.username}
                  </h2>
                  <p
                    className={`mt-0.5 flex items-center justify-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.1em] lg:justify-start ${
                      connected ? "text-primary" : "text-on-surface-variant/50"
                    }`}
                  >
                    {connected ? (
                      <>
                        <Wifi className="h-2.5 w-2.5" strokeWidth={3} />
                        Connected
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-2.5 w-2.5" strokeWidth={3} />
                        Connecting…
                      </>
                    )}
                  </p>
                </div>

                <Link to={`/friends/${active._id}`} className="shrink-0 xl:hidden">
                  <Avatar
                    username={active.username}
                    size="sm"
                    active={active.wroteToday}
                    className="rounded-full"
                  />
                </Link>
              </header>

              {error ? (
                <div className="flex flex-1 items-center justify-center px-8 py-16 text-center">
                  <p className="max-w-sm font-journal text-lg italic text-on-surface-variant">
                    {error.message}
                  </p>
                </div>
              ) : (
                <MessageThread messages={messages} loading={chatLoading} myId={myId} />
              )}

              <ChatComposer onSend={send} disabled={Boolean(error)} />
            </>
          ) : (
            <div className="hidden flex-1 flex-col items-center justify-center px-8 text-center lg:flex">
              <span className="mb-6 grid h-16 w-16 place-items-center border-2 border-outline-variant/70 text-on-surface-variant/45">
                <MessageSquare className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                Pick someone to write to.
              </h3>
              <p className="mt-3 max-w-xs font-journal text-[17px] italic text-on-surface-variant/70">
                Conversations here are just between the two of you.
              </p>
            </div>
          )}
        </section>

        {/* ---------- Context panel (widest screens only) ---------- */}
        <aside className="hidden min-h-0 flex-col overflow-y-auto pt-4 xl:flex">
          {active ? (
            <div className="flex flex-col items-center px-4 text-center">
              <Avatar
                username={active.username}
                size="2xl"
                active={active.wroteToday}
                className="rounded-full"
              />

              <h3 className="mt-5 font-journal text-2xl font-bold tracking-tight">
                {active.username}
              </h3>

              <p
                className={`mt-1.5 flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.1em] ${
                  active.wroteToday ? "text-tertiary" : "text-on-surface-variant/50"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active.wroteToday ? "bg-tertiary-bright" : "bg-on-surface-variant/40"
                  }`}
                />
                {active.wroteToday ? "Wrote today" : "Hasn't written today"}
              </p>

              <div className="mt-7 grid w-full grid-cols-2 gap-3">
                {[
                  { value: active.streak ?? 0, label: "Day streak", icon: Flame },
                  { value: messages.length, label: "Messages", icon: MessageSquare },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-outline-variant/60 bg-surface-lowest px-3 py-4"
                  >
                    <stat.icon
                      className="mx-auto mb-2 h-3.5 w-3.5 text-primary"
                      strokeWidth={2.4}
                    />
                    <p className="font-display text-2xl font-extrabold leading-none tabular-nums text-primary">
                      {stat.value}
                    </p>
                    <p className="label-caps mt-1.5 text-on-surface-variant/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                to={`/friends/${active._id}`}
                className="group mt-6 flex w-full items-center justify-between rounded-lg border border-outline-variant px-4 py-3 font-display text-label-caps uppercase transition-colors hover:border-primary hover:text-primary"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" strokeWidth={2.4} />
                  Their journal
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  strokeWidth={2.6}
                />
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </PageTransition>
  );
}
