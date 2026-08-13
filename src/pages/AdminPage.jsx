import { Routes, Route, NavLink } from "react-router-dom";
import { FiUsers, FiClock, FiActivity, FiShield, FiImage, FiSearch } from "react-icons/fi";
import { useAuth } from "../features/auth/context/AuthContext";
import MembersTab from "../features/admin/MembersTab";
import GuildPlayersTab from "../features/admin/GuildPlayersTab";
import PendingTab from "../features/admin/PendingTab";
import ActivityTab from "../features/admin/ActivityTab";
import TransferTab from "../features/admin/TransferTab";
import MediaTab from "../features/admin/MediaTab";

const tabs = [
  { key: "members", label: "Members", icon: FiUsers, path: "/admin/members" },
  { key: "guild", label: "Guild Players", icon: FiSearch, path: "/admin/guild-players" },
  { key: "media", label: "Media", icon: FiImage, path: "/admin/media" },
  { key: "pending", label: "Pending Actions", icon: FiClock, path: "/admin/pending" },
  { key: "activity", label: "Activity", icon: FiActivity, path: "/admin/activity" },
  { key: "transfer", label: "Leadership", icon: FiShield, path: "/admin/transfer" },
];

export default function AdminPage() {
  const { role } = useAuth();
  const canLead = role === "leader" || role === "acting_leader";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/30">
          <FiShield className="text-lg" />
        </span>
        <div>
          <h1 className="text-xl font-display text-cream">Admin Dashboard</h1>
          <p className="text-xs text-guild-500">Your role: {role?.replace("_", " ")}</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto rounded-full bg-guild-900 p-1.5 mb-6 ring-1 ring-guild-700">
        {tabs.map((t) => (
          <NavLink
            key={t.key}
            to={t.path}
            className={({ isActive }) =>
              `flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                isActive ? "gold-gradient-bg text-guild-950" : "text-guild-400 hover:text-cream"
              }`
            }
          >
            <t.icon className="text-sm" />
            {t.label}
          </NavLink>
        ))}
      </nav>

      {!canLead && (
        <p className="mb-4 rounded-lg bg-guild-800/80 border border-gold-500/30 px-4 py-3 text-xs text-gold-300">
          As an Officer you can act on kick/join/re-apply via the consensus queue and moderate media directly.
        </p>
      )}

        <Routes>
          <Route path="/" element={<MembersTab />} />
          <Route path="/members" element={<MembersTab />} />
          <Route path="/guild-players" element={<GuildPlayersTab />} />
          <Route path="/media" element={<MediaTab />} />
          <Route path="/pending" element={<PendingTab />} />
          <Route path="/activity" element={<ActivityTab />} />
          <Route path="/transfer" element={<TransferTab />} />
          <Route path="*" element={<MembersTab />} />
        </Routes>
    </div>
  );
}