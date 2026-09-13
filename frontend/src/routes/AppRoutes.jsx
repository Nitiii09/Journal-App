import { Routes, Route } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import MyJournal from "../pages/journal/MyJournal";
import JournalEditorPage from "../pages/journal/JournalEditorPage";
import JournalViewPage from "../pages/journal/JournalViewPage";
import Friends from "../pages/friends/Friends";
import FriendProfile from "../pages/friends/FriendProfile";
import FriendRequests from "../pages/friends/FriendRequests";
import Discover from "../pages/discover/Discover";
import Messages from "../pages/messages/Messages";
import Profile from "../pages/profile/Profile";
import NotFound from "../pages/NotFound";

/**
 * No AnimatePresence here. Wrapping <Routes> in a `mode="wait"` presence
 * deadlocks on auth redirects: the outgoing tree renders a <Navigate /> —
 * nothing to animate out — and the incoming page never gets swapped in,
 * leaving a blank screen. Page transitions live inside AppLayout instead,
 * around the <Outlet />, where every child really is a motion element.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="/journal" element={<MyJournal />} />
          <Route path="/journal/write" element={<JournalEditorPage />} />
          <Route path="/journal/:journalId" element={<JournalViewPage />} />

          <Route path="/friends" element={<Friends />} />
          <Route path="/friends/:friendId" element={<FriendProfile />} />
          <Route path="/requests" element={<FriendRequests />} />

          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />

          <Route path="/discover" element={<Discover />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
