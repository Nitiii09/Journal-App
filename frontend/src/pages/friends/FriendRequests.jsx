import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, Send, Clock } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import FriendRequestCard from "../../components/friends/FriendRequestCard";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Loader from "../../components/ui/Loader";
import { toast } from "../../components/ui/Toast";
import SunMark from "../../components/ui/SunMark";
import useFriends from "../../hooks/useFriends";
import { staggerContainer, staggerItem } from "../../animations/staggerAnimations";
import { formatRelative } from "../../utils/formatDate";
import { LOADING_MESSAGES } from "../../utils/constants";

function Tab({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-2 px-1 pb-3 font-display text-label-caps uppercase transition-colors"
    >
      {active && (
        <motion.span
          layoutId="requests-tab"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="absolute inset-x-0 bottom-0 h-0.5 bg-primary"
        />
      )}
      <Icon
        className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-on-surface-variant/60"}`}
        strokeWidth={2.6}
      />
      <span className={active ? "text-primary" : "text-on-surface-variant/70"}>
        {label}
      </span>
      {count > 0 && (
        <span
          className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold ${
            active ? "bg-primary text-on-primary" : "bg-surface-high text-on-surface-variant"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function FriendRequests() {
  const navigate = useNavigate();
  const { requests, sentRequests, loading, error, reload, accept, reject } =
    useFriends();
  const [tab, setTab] = useState("incoming");

  const handleAccept = async (requestId, username) => {
    await accept(requestId);
    toast.success("You're connected.", `@${username} can read your public days now.`);
  };

  const handleReject = async (requestId, username) => {
    await reject(requestId);
    toast.info("Request declined.", `@${username} won't be notified.`);
  };

  if (loading) {
    return (
      <PageTransition>
        <Loader message={LOADING_MESSAGES.requests} />
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

  return (
    <PageTransition className="mx-auto max-w-5xl">
      <header className="mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="font-display text-[2rem] font-bold uppercase leading-[1.05] tracking-[-0.025em] sm:text-4xl lg:text-5xl"
        >
          People
          <br />
          knocking.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-7 flex items-center gap-3 font-journal text-journal-body italic text-on-surface-variant"
        >
          <SunMark className="h-5 w-5 shrink-0 text-primary" />
          {requests.length > 0
            ? `${requests.length} friend ${requests.length === 1 ? "request" : "requests"} waiting for you.`
            : "Nobody at the door right now."}
        </motion.p>

        <div className="mt-8 flex items-end gap-7 border-b border-outline-variant/70">
          <Tab
            active={tab === "incoming"}
            onClick={() => setTab("incoming")}
            icon={Inbox}
            label="Incoming"
            count={requests.length}
          />
          <Tab
            active={tab === "sent"}
            onClick={() => setTab("sent")}
            icon={Send}
            label="Sent"
            count={sentRequests.length}
          />
        </div>
      </header>

      {tab === "incoming" ? (
        requests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No one's knocking."
            body="Your inbox is peaceful. When someone wants to read your days, they'll show up here."
            actionLabel="Find people"
            onAction={() => navigate("/discover")}
          />
        ) : (
          <motion.div
            variants={staggerContainer(0.09)}
            initial="initial"
            animate="animate"
            className="grid gap-gutter md:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {requests.map((request) => (
                <FriendRequestCard
                  key={request._id}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )
      ) : sentRequests.length === 0 ? (
        <EmptyState
          icon={Send}
          title="You haven't reached out."
          body="Requests you send will wait here until they're answered."
          actionLabel="Find people"
          onAction={() => navigate("/discover")}
        />
      ) : (
        <motion.ul
          variants={staggerContainer(0.07)}
          initial="initial"
          animate="animate"
          className="divide-y divide-outline-variant/60 border-t border-outline-variant"
        >
          <AnimatePresence mode="popLayout">
            {sentRequests.map((request) => (
              <motion.li
                key={request._id}
                variants={staggerItem}
                exit={{ opacity: 0, x: -40, height: 0 }}
                className="flex flex-wrap items-center gap-4 py-5"
              >
                <Avatar username={request.receiverId?.username ?? ""} size="md" />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold tracking-tight">
                    @{request.receiverId?.username}
                  </p>
                  <p className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/50">
                    Sent {formatRelative(request.createdAt).toLowerCase()} · awaiting reply
                  </p>
                </div>

                {/* Read-only: the API has no cancel route — only the
                    receiver can act on a request, via accept or reject. */}
                <Badge tone="secondary" size="sm" icon={Clock} className="shrink-0">
                  Pending
                </Badge>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </PageTransition>
  );
}
