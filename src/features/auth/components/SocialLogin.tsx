import { FaGoogle, FaGithub } from "react-icons/fa";

function SocialLogin() {
  return (
    <>
      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-[#EDE1CB]" />

        <span className="text-[11px] text-[#B3A488]">or continue with</span>

        <div className="h-px flex-1 bg-[#EDE1CB]" />
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-[#EDE1CB] py-2 text-xs text-[#4A3B27] transition-colors duration-200 hover:bg-[#FAF6EE] hover:border-[#E3A012]/40"
        >
          <FaGoogle />
          Google
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-[#EDE1CB] py-2 text-xs text-[#4A3B27] transition-colors duration-200 hover:bg-[#FAF6EE] hover:border-[#E3A012]/40"
        >
          <FaGithub />
          GitHub
        </button>
      </div>
    </>
  );
}

export default SocialLogin;