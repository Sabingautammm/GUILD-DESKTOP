import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUser, FiLoader, FiAlertCircle } from "react-icons/fi";
import { getMemberById } from "../features/members/services/memberApi";
import { ApiError } from "../services/api/client";
import Avatar from "../components/ui/Avatar";
import { resolveMediaUrl } from "../utils/mediaUrl";

export default function MemberDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMemberById(id)
      .then((d) => !cancelled && setMember(d))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load member."))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex justify-center">
        <FiLoader className="animate-spin text-2xl text-gold-400" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <FiAlertCircle className="mx-auto text-3xl text-gold-400" />
        <p className="mt-3 text-sm font-semibold text-cream">{error ?? "Member not found."}</p>
        <button onClick={() => navigate("/guild")} className="mt-4 rounded-full gold-gradient-bg px-4 py-2 text-xs font-bold text-guild-950 hover:brightness-110">
          Back to guilds
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-guild-800 via-guild-850 to-guild-900 p-8 text-cream ring-1 ring-gold-500/30">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold-500/10 blur-2xl" />
        <div className="relative flex items-center gap-5">
          {member.avatar ? (
            <Avatar
              src={resolveMediaUrl(member.avatar)}
              name={member.name}
              className="h-20 w-20 rounded-2xl ring-2 ring-gold-500/40"
              fallbackClassName="gold-gradient-bg text-4xl text-guild-950 gold-glow"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl gold-gradient-bg text-4xl font-bold text-guild-950 gold-glow">
              {member.name?.charAt(0).toUpperCase() || <FiUser />}
            </span>
          )}
          <div>
            <p className="text-2xl font-display">{member.name}</p>
            <p className="text-sm text-gold-300">{member.role}</p>
            <p className="text-xs font-mono text-guild-500 mt-1">UID {member.uid}</p>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-guild-950/60 ring-1 ring-guild-700 p-3">
            <p className="text-lg font-bold text-gold-300">{member.level}</p>
            <p className="text-[10px] uppercase tracking-wide text-guild-500">Level</p>
          </div>
          <div className="rounded-xl bg-guild-950/60 ring-1 ring-guild-700 p-3">
            <p className="text-lg font-bold text-gold-300">{member.status}</p>
            <p className="text-[10px] uppercase tracking-wide text-guild-500">Status</p>
          </div>
          <div className="rounded-xl bg-guild-950/60 ring-1 ring-guild-700 p-3">
            <p className="text-lg font-bold text-gold-300">{new Date(member.joinDate ?? member.createdAt ?? Date.now()).toLocaleDateString()}</p>
            <p className="text-[10px] uppercase tracking-wide text-guild-500">Joined</p>
          </div>
        </div>
      </div>
    </div>
  );
}