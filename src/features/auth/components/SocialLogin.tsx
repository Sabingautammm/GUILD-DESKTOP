import { FaGoogle, FaGithub, } from "react-icons/fa";

function SocialLogin() {
  return (
    <>
      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-[11px] text-slate-400">
          or continue with
        </span>

        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
        >
          <FaGoogle />
          Google
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
        >
          <FaGithub />
          GitHub
        </button>

      
      </div>
    </>
  );
}

export default SocialLogin;