import { motion } from "framer-motion";
import { Users } from "lucide-react";
import FriendCard from "./FriendCard";
import EmptyState from "../ui/EmptyState";
import { SkeletonFriendCard } from "../ui/Skeleton";
import { staggerContainer } from "../../animations/staggerAnimations";

export default function FriendGrid({ friends = [], loading = false, onAddFriend }) {
  // Two columns from the smallest screen up — the mobile design pairs cards
  // rather than stacking them full-width.
  const gridClass = "grid grid-cols-2 gap-3 sm:gap-gutter xl:grid-cols-3";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonFriendCard key={i} />
        ))}
      </div>
    );
  }

  if (!friends.length) {
    return (
      <EmptyState
        icon={Users}
        title="Your people aren't here yet."
        body="Daymark is quiet on your own. Send a request and start reading each other's days."
        actionLabel="Add a friend"
        onAction={onAddFriend}
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="initial"
      animate="animate"
      className={gridClass}
    >
      {friends.map((friend, index) => (
        <FriendCard key={friend._id} friend={friend} index={index} />
      ))}
    </motion.div>
  );
}
