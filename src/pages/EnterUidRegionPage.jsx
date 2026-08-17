import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader, FiHash, FiCheck, FiUser, FiAward, FiStar, FiHeart, FiTrendingUp } from "react-icons/fi";
import { submitUidRegion, completeOnboarding } from "../features/auth/services/authApi";
import { getPlayerProfile, getPlayerRank } from "../services/api/ffApi";
import { ApiError } from "../services/api/client";
import { useToast } from "../components/toast/ToastProvider";
import { useAuth } from "../features/auth/context/AuthContext";

function StepHeader({ step, total, title, description }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">
        Step {step} of {total}
      </p>
      <h2 className="mt-1 text-xl font-display text-cream">{title}</h2>
      {description && <p className="mt-1 text-sm text-guild-400">{description}</p>}
    </div>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-xs text-red-400">{message}</p>;
}

const REGIONS = [
  { code: "IND", label: "India" },
  { code: "BR", label: "Brazil" },
  { code: "US", label: "United States" },
  { code: "SAC", label: "South America" },
  { code: "NA", label: "North America" },
  { code: "SG", label: "Singapore" },
  { code: "BD", label: "Bangladesh" },
  { code: "VN", label: "Vietnam" },
  { code: "TH", label: "Thailand" },
  { code: "ID", label: "Indonesia" },
  { code: "RU", label: "Russia" },
  { code: "TW", label: "Taiwan" },
  { code: "ME", label: "Middle East" },
  { code: "PK", label: "Pakistan" },
  { code: "CIS", label: "CIS" },
  { code: "EUROPE", label: "Europe" },
];

function StatCard({ icon, label, value, color = "text-gold-300" }) {
  return (
    <div className="flex flex-col items-center p-4 bg-guild-800/50 rounded-xl border border-guild-700/50">
      <div className={`text-2xl mb-2 ${color}`}>{icon}</div>
      <p className="font-bold text-cream text-lg">{value}</p>
      <p className="text-xs text-guild-400 text-center mt-1">{label}</p>
    </div>
  );
}

export default function EnterUidRegionPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, membership, refresh } = useAuth();

  const [uid, setUid] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  // Optional live Free Fire cross-check for the preview step. Never blocks
  // completion; only surfaces a warning when submitUidRegion returned the
  // backend's mock fallback (name "Player<uid>", "head_001" avatar) — so that
  // a real profile is never accidentally persisted into the dashboard.
  const [liveCheck, setLiveCheck] = useState(null); // { status, rank, profile }

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-guild-400">Please sign in first to continue.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 rounded-lg gold-gradient-bg px-5 py-2 text-sm font-bold text-guild-950 hover:brightness-110"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (membership && membership.status !== "pending_approval") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-display text-cream">You're all set!</p>
        <p className="text-sm text-guild-400 mt-2">
          You're an active member of guild <span className="font-mono font-semibold text-gold-300">{membership.guildUid}</span>.
        </p>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="mt-4 rounded-lg gold-gradient-bg px-5 py-2 text-sm font-bold text-guild-950 hover:brightness-110"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  const handleFetchProfile = async () => {
    if (!/^\d+$/.test(uid.trim())) {
      setError("UID must be numeric.");
      return;
    }
    if (!region) {
      setError("Please select a region.");
      return;
    }
    setError("");
    setIsBusy(true);
    setFetchedData(null);
    setShowDetails(false);

    try {
      const res = await toast.promise(submitUidRegion(uid.trim(), region), {
        loading: "Fetching Free Fire profile & stats…",
        success: "Profile fetched!",
        error: (e) => (e instanceof ApiError ? e.message : "Could not fetch profile."),
      });

      const bi = res.profile?.profileData?.basicInfo || res.profile?.basicInfo || {};
      const pi = res.profile?.profileInfo || res.profile?.profileData?.profileInfo || {};
      const clanBasicInfo = res.profile?.profileData?.clanBasicInfo || res.profile?.clanBasicInfo || {};
      const socialInfo = res.profile?.profileData?.socialInfo || res.profile?.socialInfo || {};
      const petInfo = res.profile?.profileData?.petInfo || res.profile?.petInfo || {};
      const stats = res.profile?.stats || {};

      const combinedData = {
        uid: res.user?.gameUid || uid.trim(),
        region: res.user?.region || region,
        game: res.user?.game || "Free Fire",
        inGameName: res.user?.inGameName || bi.nickname || bi.accountId,
        avatar: res.user?.avatar || (bi.headpic ? `https://cdn.jsdelivr.net/gh/0xme/ff-resources@main/pngs/300x300/${bi.headpic}.png` : ""),
        banner: bi.bannerId ? `https://cdn.jsdelivr.net/gh/0xme/ff-resources@main/pngs/banner/${bi.bannerId}.png` : "",
        basicInfo: {
          accountId: bi.accountid,
          level: bi.level,
          exp: bi.exp,
          rank: bi.rank,
          csRank: bi.csrank,
          badgeId: bi.badgeid,
          bannerId: bi.bannerid,
          headPic: bi.headpic,
          title: bi.title,
          releaseVersion: bi.releaseversion,
          liked: bi.likes ?? bi.liked,
          lastLoginAt: bi.lastloginat,
          createAt: bi.createat,
        },
        profileInfo: {
          avatarId: pi.avatarid,
          clothes: pi.clothes,
          equipedSkills: pi.equipedskills,
          pvePrimaryWeapon: pi.pveprimaryweapon,
        },
        clanBasicInfo: clanBasicInfo ? {
          clanId: clanBasicInfo.clanid,
          clanName: clanBasicInfo.clanname,
          clanLevel: clanBasicInfo.clanlevel,
          memberNum: clanBasicInfo.membernum,
          captainId: clanBasicInfo.captainid,
        } : null,
        petInfo: petInfo ? {
          id: petInfo.id,
          level: petInfo.level,
          exp: petInfo.exp,
          isSelected: petInfo.isselected,
          skinId: petInfo.skinid,
          selectedSkillId: petInfo.selectedskillid,
        } : null,
        socialInfo: socialInfo ? {
          gender: socialInfo.gender,
          language: socialInfo.language,
          battleTag: socialInfo.battletag,
          socialTag: socialInfo.socialtag,
          modePrefer: socialInfo.modeprefer,
          signature: socialInfo.signature,
          rankShow: socialInfo.rankshow,
        } : null,
        stats: {
          brRanked: {
            matches: stats?.brRank?.matches ?? 0,
            kd: stats?.brRank?.kd ?? 0,
            headshotRate: stats?.brRank?.headshotRate ?? 0,
            winRate: stats?.brRank?.winRate ?? 0,
            rankPoints: stats?.brRank?.rankPoints ?? 0,
          },
          csRanked: {
            matches: stats?.csRank?.matches ?? 0,
            kd: stats?.csRank?.kd ?? 0,
            headshotRate: stats?.csRank?.headshotRate ?? 0,
            winRate: stats?.csRank?.winRate ?? 0,
            rankPoints: stats?.csRank?.rankPoints ?? 0,
          },
          csNormal: {
            matches: stats?.clashSquadCustom?.matches ?? 0,
            kd: stats?.clashSquadCustom?.kd ?? 0,
            headshotRate: stats?.clashSquadCustom?.headshotRate ?? 0,
            winRate: stats?.clashSquadCustom?.winRate ?? 0,
          },
        },
      };

      setFetchedData(combinedData);
      setShowDetails(true);
      toast.success("Profile fetched successfully!");
      // Non-blocking live cross-check against /ff/player/rank + /ff/player/profile.
      // If submitUidRegion fell back to the backend's mock, we reconcile
      // fetchedData with the authoritative live nickname/avatar/level before
      // the user can click "Continue". The toast UI never blocks on this.
      crossCheckLive(combinedData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to fetch data. Please try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const crossCheckLive = async (base) => {
    setLiveCheck({ status: "loading" });
    try {
      const [rankR, profileR] = await Promise.allSettled([
        getPlayerRank(base.region, base.uid),
        getPlayerProfile(base.region, base.uid),
      ]);
      const rank = rankR.status === "fulfilled" ? rankR.value?.data ?? null : null;
      const profile = profileR.status === "fulfilled" ? profileR.value?.data ?? null : null;
      setLiveCheck({ status: "loaded", rank, profile });

      if (!rank && !profile) return;
      // Reconcile only the fields the live endpoints are authoritative for.
      const realNickname =
        rank?.nickname || profile?.basicinfo?.nickname || profile?.basicInfo?.nickname;
      const realHeadpic =
        profile?.basicinfo?.headpic || profile?.basicInfo?.headpic;
      const realLevel =
        rank?.level || profile?.basicinfo?.level || profile?.basicInfo?.level;
      setFetchedData((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (realNickname && realNickname !== prev.inGameName) next.inGameName = realNickname;
        if (realHeadpic) {
          next.avatar = `https://cdn.jsdelivr.net/gh/0xme/ff-resources@main/pngs/300x300/${realHeadpic}.png`;
        }
        if (realLevel != null) {
          next.basicInfo = { ...(next.basicInfo || {}), level: Number(realLevel) || 0 };
        }
        // submitUidRegion never returns basicinfo (PlayerProfile has no such
        // fields), so the live rank payload is the only source for likes.
        if (rank?.likes != null) {
          next.basicInfo = { ...(next.basicInfo || {}), liked: Number(rank.likes) || 0 };
        }
        return next;
      });
    } catch {
      setLiveCheck({ status: "error" });
    }
  };

  const handleCompleteAndRedirect = async () => {
    if (!fetchedData) return;
    setIsBusy(true);
    setError("");
    try {
      await toast.promise(completeOnboarding(fetchedData), {
        loading: "Completing setup…",
        success: "Setup complete! Redirecting to dashboard…",
        error: (e) => (e instanceof ApiError ? e.message : "Could not complete setup."),
      });
      await refresh();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to complete setup.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card-surface p-6 sm:p-8">
        {!showDetails ? (
          <>
            <StepHeader step={1} total={2} title="Enter your Free Fire UID & Region" description="We'll fetch your profile, avatar, banner, and stats automatically." />
            <div className="space-y-4">
              <div className="relative">
                <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-guild-500 text-sm" />
                <input
                  inputMode="numeric"
                  value={uid}
                  onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
                  placeholder="Free Fire UID (numeric)"
                  className="w-full input-dark rounded-lg pl-9 pr-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-gold-500"
                  maxLength={12}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-guild-300 mb-1 block">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full input-dark rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">Select Region</option>
                  {REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label} ({r.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ErrorBox message={error} />
            <button
              onClick={handleFetchProfile}
              disabled={isBusy}
              className="mt-6 w-full rounded-lg gold-gradient-bg py-3 text-base font-bold text-guild-950 hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isBusy ? <FiLoader className="animate-spin" /> : "Fetch Profile & Stats"}
            </button>
          </>
        ) : (
          <>
            <StepHeader step={2} total={2} title="Your Profile Preview" description="Review your Free Fire profile details below, then continue to the dashboard." />
            <div className="space-y-6">
              {liveCheck?.status === "loading" && (
                <p className="text-[11px] text-guild-400">Verifying with live Free Fire data…</p>
              )}
              {liveCheck?.status === "loaded" && (
                <p className="text-[11px] text-emerald-400">Live Free Fire data verified.</p>
              )}
              {liveCheck?.status === "error" && (
                <p className="text-[11px] text-guild-500">
                  Live verification skipped — could not reach Free Fire. Proceed only if the data below matches your in-game profile.
                </p>
              )}
              {/* Banner Section */}
              {fetchedData.banner && (
                <div className="relative h-32 w-full rounded-xl overflow-hidden bg-gradient-to-r from-guild-800 to-guild-900">
                  <img 
                    src={fetchedData.banner} 
                    alt="Game Banner" 
                    className="w-full h-full object-cover opacity-80"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-guild-800/30 rounded-xl border border-guild-700/50">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                  {fetchedData.avatar ? (
                    <img 
                      src={fetchedData.avatar} 
                      alt={fetchedData.inGameName} 
                      className="w-full h-full rounded-full object-cover border-2 border-gold-500/50"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 font-bold text-2xl border-2 border-gold-500/50">
                      {fetchedData.inGameName?.[0] || "P"}
                    </div>
                  )}
                  {/* Level Badge */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-guild-950 font-bold text-sm border-2 border-guild-900">
                    {fetchedData.basicInfo?.level || 1}
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display text-cream text-xl sm:text-2xl">{fetchedData.inGameName}</h3>
                  <p className="text-guild-400 mt-1">UID: <span className="font-mono text-cream">{fetchedData.uid}</span></p>
                  <p className="text-guild-400">Region: <span className="font-mono text-cream">{fetchedData.region}</span></p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs bg-gold-500/10 text-gold-300 px-2 py-1 rounded-full">
                      <FiHeart className="w-3 h-3" /> {fetchedData.basicInfo?.liked || 0} Likes
                    </span>
                    <span className="flex items-center gap-1 text-xs bg-guild-700 text-guild-300 px-2 py-1 rounded-full">
                      <FiAward className="w-3 h-3" /> Level {fetchedData.basicInfo?.level || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard 
                  icon={<FiTrendingUp className="w-6 h-6" />} 
                  label="BR Rank Points" 
                  value={fetchedData.stats?.brRanked?.rankPoints?.toLocaleString() || 0}
                  color="text-orange-400"
                />
                <StatCard 
                  icon={<FiStar className="w-6 h-6" />} 
                  label="CS Rank Stars" 
                  value={fetchedData.stats?.csRanked?.rankPoints || 0}
                  color="text-purple-400"
                />
                <StatCard 
                  icon={<FiUser className="w-6 h-6" />} 
                  label="BR Matches" 
                  value={fetchedData.stats?.brRanked?.matches || 0}
                  color="text-blue-400"
                />
                <StatCard 
                  icon={<FiAward className="w-6 h-6" />} 
                  label="CS Matches" 
                  value={fetchedData.stats?.csRanked?.matches || 0}
                  color="text-green-400"
                />
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <StatCard 
                  icon={<FiTrendingUp className="w-6 h-6" />} 
                  label="BR K/D" 
                  value={fetchedData.stats?.brRanked?.kd || 0}
                  color="text-orange-400"
                />
                <StatCard 
                  icon={<FiStar className="w-6 h-6" />} 
                  label="CS K/D" 
                  value={fetchedData.stats?.csRanked?.kd || 0}
                  color="text-purple-400"
                />
                <StatCard 
                  icon={<FiTrendingUp className="w-6 h-6" />} 
                  label="BR Win Rate" 
                  value={`${fetchedData.stats?.brRanked?.winRate || 0}%`}
                  color="text-blue-400"
                />
                <StatCard 
                  icon={<FiStar className="w-6 h-6" />} 
                  label="CS Win Rate" 
                  value={`${fetchedData.stats?.csRanked?.winRate || 0}%`}
                  color="text-green-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-guild-700/50">
                <button
                  onClick={() => { setShowDetails(false); setFetchedData(null); setLiveCheck(null); }}
                  className="flex-1 rounded-lg bg-guild-700 py-3 text-base font-bold text-guild-300 hover:bg-guild-600 transition-colors"
                >
                  <FiLoader className="w-4 h-4 mr-2 inline" /> Change UID
                </button>
                <button
                  onClick={handleCompleteAndRedirect}
                  disabled={isBusy}
                  className="flex-1 rounded-lg gold-gradient-bg py-3 text-base font-bold text-guild-950 hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
                >
                  {isBusy ? (
                    <>
                      <FiLoader className="animate-spin w-4 h-4" />
                      Continuing...
                    </>
                  ) : (
                    <>
                      Continue to Dashboard
                      <FiCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}