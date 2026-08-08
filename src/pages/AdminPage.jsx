import { Routes, Route, NavLink } from "react-router-dom";
import { FiUsers, FiClock, FiActivity, FiShield, FiImage } from "react-icons/fi";
import { useAuth } from "../features/auth/context/AuthContext";
import MembersTab from "../features/admin/MembersTab";
import PendingTab from "../features/admin/PendingTab";
import ActivityTab from "../features/admin/ActivityTab";
import TransferTab from "../features/admin/TransferTab";
import MediaTab from "../features/admin/MediaTab";

const tabs = [
  { key: "members", label: "Members", icon: FiUsers, path: "/admin/members" },
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
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3A012]/10 text-[#B9660B]">
          <FiShield className="text-lg" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[#17120D]">Admin Dashboard</h1>
          <p className="text-xs text-slate-500">Your role: {role?.replace("_", " ")}</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto rounded-full bg-[#17120D] p-1.5 mb-6">
        {tabs.map((t) => (
          <NavLink
            key={t.key}
            to={t.path}
            className={({ isActive }) =>
              `flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                isActive ? "bg-gradient-to-r from-[#FFD873] via-[#E3A012] to-[#B9660B] text-[#17120D]" : "text-[#B3A488] hover:text-[#FBF3E2]"
              }`
            }
          >
            <t.icon className="text-sm" />
            {t.label}
          </NavLink>
        ))}
      </nav>

      {!canLead && (
        <p className="mb-4 rounded-lg bg-[#FFFBEF] border border-[#E3A012]/30 px-4 py-3 text-xs text-[#8a5200]">
          As an Officer you can act on kick/join/re-apply via the consensus queue and moderate media directly.
        </p>
      )}

      <Routes>
        <Route path="/" element={<MembersTab />} />
        <Route path="/members" element={<MembersTab />} />
        <Route path="/media" element={<MediaTab />} />
        <Route path="/pending" element={<PendingTab />} />
        <Route path="/activity" element={<ActivityTab />} />
        <Route path="/transfer" element={<TransferTab />} />
        <Route path="*" element={<MembersTab />} />
      </Routes>
    </div>
  );
}