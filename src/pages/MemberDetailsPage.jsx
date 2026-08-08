import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUser, FiLoader, FiAlertCircle } from "react-icons/fi";
import { getMemberById } from "../features/members/services/memberApi";
import { ApiError } from "../services/api/client";

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
        <FiLoader className="animate-spin text-2xl text-[#B9660B]" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <FiAlertCircle className="mx-auto text-3xl text-[#B9660B]" />
        <p className="mt-3 text-sm font-semibold text-[#17120D]">{error ?? "Member not found."}</p>
        <button onClick={() => navigate("/guild")} className="mt-4 rounded-full bg-[#17120D] px-4 py-2 text-xs font-semibold text-[#FFD873]">
          Back to guilds
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl bg-gradient-to-br from-[#17120D] via-[#3A2712] to-[#B9660B] p-8 text-white">
        <div className="flex items-center gap-5">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-4xl font-bold text-[#FFD873] ring-1 ring-white/10">
            {member.name?.charAt(0).toUpperCase() || <FiUser />}
          </span>
          <div>
            <p className="text-2xl font-bold">{member.name}</p>
            <p className="text-sm text-[#FFD873]/80">{member.role}</p>
            <p className="text-xs font-mono text-white/50 mt-1">UID {member.uid}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-lg font-bold">{member.level}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/50">Level</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-lg font-bold">{member.status}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/50">Status</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-lg font-bold">{new Date(member.joinDate).toLocaleDateString()}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/50">Joined</p>
          </div>
        </div>
      </div>
    </div>
  );
}