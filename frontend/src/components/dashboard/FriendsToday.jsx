import FriendActivity from "../friends/FriendActivity";

/**
 * Dashboard wrapper around FriendActivity, backed by
 * GET /api/journals/friends/written-today.
 */
export default function FriendsToday({ friends, loading, className }) {
  return <FriendActivity friends={friends} loading={loading} className={className} />;
}
