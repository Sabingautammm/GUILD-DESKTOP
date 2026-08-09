import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiShield, FiUsers, FiLoader, FiAlertCircle, FiArrowRight, FiEdit3, FiCheck, FiX } from "react-icons/fi";
import { getGuildProfile, getPrivateGuildView, updateGuild, applyToGuild, leaveGuild, disbandGuild } from "../services/api/guildApi";
import { ApiError } from "../services/api/client";
import { useToast } from "../components/toast/ToastProvider";
import { useAuth } from "../features/auth/context/AuthContext";
import { ROLE_LABEL } from "../features/dashboard/data/playerTypes";

export default function GuildPage() {
  const { guildUid } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, membership, role, refresh } = useAuth();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingDisband, setConfirmingDisband] = useState(false);
  const [activeTab, setActiveTab] = useState("players");
  const [editingIntro, setEditingIntro] = useState(false);
  const [editingHistory, setEditingHistory] = useState(false);
  const [introDraft, setIntroDraft] = useState("");
  const [historyDraft, setHistoryDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const amMember = membership && membership.guildUid === guildUid;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    const load = amMember ? getPrivateGuildView(guildUid) : getGuildProfile(guildUid);
    load
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load guild."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [guildUid, amMember]);

  const handleApply = async () => {
    if (!isAuthenticated) return navigate("/login");
    try {
      await toast.promise(applyToGuild(guildUid), {
        loading: "Applying…",
        success: "Application sent",
        successDescription: "An admin will review your request.",
        error: (err) => (err instanceof ApiError ? err.message : "Could not apply."),
      });
      await refresh();
    } catch {
      // toast handles it
    }
  };

  const handleLeave = async () => {
    try {
      await toast.promise(leaveGuild(guildUid), {
        loading: "Leaving guild…",
        success: "You left the guild",
        successDescription: "You are now a free player.",
        error: (err) => (err instanceof ApiError ? err.message : "Could not leave guild."),
      });
      await refresh();
    } catch {
      // toast handles it
    }
  };

  const handleDisband = async () => {
    try {
      await toast.promise(disbandGuild(guildUid), {
        loading: "Disbanding…",
        success: "Guild disbanded",
        successDescription: "Everyone is now a free player.",
        error: (err) => (err instanceof ApiError ? err.message : "Could not disband."),
      });
      await refresh();
      navigate("/");
    } catch {
      // toast handles it
    }
  };

  const canEditGuild = role === "leader" || role === "acting_leader";

  const saveIntro = async () => {
    setSaving(true);
    try {
      await toast.promise(updateGuild(guildUid, { introduction: introDraft.trim() }), {
        loading: "Saving introduction…",
        success: "Guild introduction updated",
        error: (err) => (err instanceof ApiError ? err.message : "Could not save introduction."),
      });
      setEditingIntro(false);
      setData((d) => (d ? { ...d, guild: { ...d.guild, introduction: introDraft.trim() } } : d));
    } catch {
      // toast handled it
    } finally {
      setSaving(false);
    }
  };

  const saveHistory = async () => {
    setSaving(true);
    try {
      await toast.promise(updateGuild(guildUid, { history: historyDraft.trim() }), {
        loading: "Saving history…",
        success: "Guild history updated",
        error: (err) => (err instanceof ApiError ? err.message : "Could not save history."),
      });
      setEditingHistory(false);
      setData((d) => (d ? { ...d, guild: { ...d.guild, history: historyDraft.trim() } } : d));
    } catch {
      // toast handled it
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <FiLoader className="animate-spin text-2xl text-[#B9660B]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FiAlertCircle className="mx-auto text-3xl text-[#B9660B]" />
        <p className="mt-3 text-sm font-semibold text-[#17120D]">{error ?? "Guild not found."}</p>
        <button onClick={() => navigate("/")} className="mt-4 rounded-full bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873]">
          Back home
        </button>
      </div>
    );
  }

  const g = data.guild;
  const roster = data.roster ?? [];
  const leader = roster.find((m) => m.role === "leader");
  const officers = roster.filter((m) => ["officer", "acting_leader"].includes(m.role));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-[#17120D] via-[#3A2712] to-[#B9660B] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#FFD873]/10" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-2xl font-bold text-[#FFD873] ring-1 ring-white/10">
                {g.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <h1 className="text-2xl font-bold">{g.name}</h1>
                <p className="text-sm text-[#FFD873]/80">{g.slogan}</p>
                <p className="text-xs font-mono text-white/50 mt-1">Guild UID {g.guildUid}</p>
              </div>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-[#FFD873] ring-1 ring-white/10">
              {g.visibility === "private" ? "Private" : "Public"} guild
            </span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-white/80">
            <FiUsers className="text-[#FFD873]" />
            <span>
              {roster.length} / {g.memberCap} members
            </span>
            {amMember && (
              <span className="ml-2 rounded-full bg-[#FFD873]/15 px-3 py-1 text-[11px] font-semibold text-[#FFD873]">
                {ROLE_LABEL[membership.role]}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!amMember && isAuthenticated && (
              <button onClick={handleApply} className="rounded-full bg-gradient-to-r from-[#FFD873] via-[#E3A012] to-[#B9660B] px-5 py-2 text-sm font-bold text-[#17120D] hover:brightness-105">
                Apply to join
              </button>
            )}
            {!amMember && !isAuthenticated && (
              <button onClick={() => navigate("/login")} className="rounded-full border border-[#FFD873] px-5 py-2 text-sm font-semibold text-[#FFD873] hover:bg-[#FFD873]/10">
                Sign in to apply
              </button>
            )}
            {amMember && (role === "leader" || role === "acting_leader" || role === "officer") && (
              <button onClick={() => navigate("/admin/members")} className="rounded-full bg-gradient-to-r from-[#FFD873] via-[#E3A012] to-[#B9660B] px-5 py-2 text-sm font-bold text-[#17120D] hover:brightness-105 flex items-center gap-2">
                <FiShield className="text-xs" /> Admin dashboard
              </button>
            )}
            {amMember && membership.role !== "leader" && (
              <button onClick={handleLeave} className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/80 hover:bg-white/10">
                Leave guild
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-full bg-[#17120D] p-1.5">
        {[
          { key: "players", label: "Guild Players" },
          { key: "introduction", label: "Introduction" },
          { key: "history", label: "History" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === t.key
                ? "bg-gradient-to-r from-[#FFD873] via-[#E3A012] to-[#B9660B] text-[#17120D]"
                : "text-[#B3A488] hover:text-[#FBF3E2]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "players" && (
        <>
          <section className="rounded-xl border border-[#EDE1CB] bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45] mb-4">Leadership</h2>
            <div className="flex flex-wrap gap-3">
              {leader && <RoleChip member={leader} label="Leader" />}
              {officers.length > 0 && officers.map((m) => <RoleChip key={m._id} member={m} label={ROLE_LABEL[m.role]} />)}
              {!leader && <p className="text-xs text-slate-400">No leader assigned.</p>}
            </div>
          </section>

          <section className="rounded-xl border border-[#EDE1CB] bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Roster</h2>
              <span className="text-xs text-slate-400">{roster.length} shown</span>
            </div>
            {roster.length === 0 ? (
              <p className="text-xs text-slate-400">No members yet.{amMember && " Invite friends to apply!"}</p>
            ) : (
              <ul className="divide-y divide-[#F3EADA]">
                {roster.map((m) => (
                  <li key={m._id} className="flex items-center justify-between py-3">
                    <button
                      onClick={() => m.userId?._id && navigate(`/members/${m.userId._id}`)}
                      className="flex items-center gap-3 min-w-0 text-left flex-1"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E3A012]/10 text-sm font-bold text-[#B9660B]">
                        {m.userId?.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#17120D] truncate">{m.userId?.name ?? "Player"}</p>
                        <p className="text-[11px] text-slate-400">{ROLE_LABEL[m.role] ?? m.role}</p>
                      </div>
                      <FiArrowRight className="ml-auto text-xs text-slate-300" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {activeTab === "introduction" && (
        <section className="rounded-xl border border-[#EDE1CB] bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Guild Introduction</h2>
            {canEditGuild && !editingIntro && (
              <button
                onClick={() => {
                  setIntroDraft(g.introduction || "");
                  setEditingIntro(true);
                }}
                className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <FiEdit3 /> Edit
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-3">Slogan: {g.slogan}</p>
          {editingIntro ? (
            <div className="space-y-3">
              <textarea
                value={introDraft}
                onChange={(e) => setIntroDraft(e.target.value)}
                rows={5}
                placeholder="Describe your guild — goals, community, activity…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveIntro}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-50"
                >
                  <FiCheck /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditingIntro(false)}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          ) : g.introduction ? (
            <p className="text-sm whitespace-pre-wrap text-[#17120D]">{g.introduction}</p>
          ) : (
            <p className="text-xs text-slate-400">No introduction yet.</p>
          )}
        </section>
      )}

      {activeTab === "history" && (
        <section className="rounded-xl border border-[#EDE1CB] bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6B5B45]">Guild History</h2>
            {canEditGuild && !editingHistory && (
              <button
                onClick={() => {
                  setHistoryDraft(g.history || "");
                  setEditingHistory(true);
                }}
                className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <FiEdit3 /> Edit
              </button>
            )}
          </div>
          {editingHistory ? (
            <div className="space-y-3">
              <textarea
                value={historyDraft}
                onChange={(e) => setHistoryDraft(e.target.value)}
                rows={6}
                placeholder="The story of your guild…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveHistory}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873] hover:opacity-90 disabled:opacity-50"
                >
                  <FiCheck /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditingHistory(false)}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          ) : g.history ? (
            <p className="text-sm whitespace-pre-wrap text-[#17120D]">{g.history}</p>
          ) : (
            <p className="text-xs text-slate-400">No history recorded yet.</p>
          )}
        </section>
      )}

      {membership?.role === "leader" && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">Leader controls</p>
          <p className="text-xs text-red-500 mt-1">
            Disbanding is irreversible — every member (including you) becomes a free player and the guild is archived.
          </p>
          {!confirmingDisband ? (
            <button onClick={() => setConfirmingDisband(true)} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
              Disband guild
            </button>
          ) : (
            <div className="mt-3 flex gap-3">
              <button onClick={handleDisband} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
                Yes, disband permanently
              </button>
              <button onClick={() => setConfirmingDisband(false)} className="rounded-lg border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {(role === "leader" || role === "acting_leader" || role === "officer") && (
        <button onClick={() => navigate("/admin/members")} className="flex items-center gap-2 text-sm font-semibold text-[#B9660B] hover:underline">
          Admin dashboard <FiArrowRight className="text-xs" />
        </button>
      )}
    </div>
  );
}

function RoleChip({ member, label }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#EDE1CB] bg-[#FAF6EE] px-3 py-1.5">
      <FiShield className="text-xs text-[#B9660B]" />
      <span className="text-xs font-semibold text-[#17120D]">{member.userId?.name ?? "Player"}</span>
      <span className="text-[10px] uppercase tracking-wide text-[#6B5B45]">{label}</span>
    </div>
  );
}