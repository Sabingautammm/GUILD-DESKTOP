import type { Dispatch, SetStateAction } from "react";
import { FiArrowRight, FiCheck, FiUser } from "react-icons/fi";

interface OverlayProps {
  isSignUp: boolean;
  setIsSignUp: Dispatch<SetStateAction<boolean>>;
}

function Overlay({ isSignUp, setIsSignUp }: OverlayProps) {
  return (
    <div
      className={`absolute top-0 h-full w-1/2 text-white transition-transform duration-[260ms] ease-linear ${
        isSignUp ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
    >
      <div className="relative h-full w-full bg-gradient-to-br from-[#17120D] via-[#3A2712] to-[#B9660B] overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#FFD873]/10" />

        <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />

        <div className="relative h-full flex flex-col items-center justify-center text-center px-10">
          {!isSignUp ? (
            <>
              {/* New User */}

              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/10 flex items-center justify-center mb-6">
                <FiCheck className="text-2xl text-[#FFD873]" />
              </div>

              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#FFD873]/80 mb-2">
                Make it yours
              </p>

              <h2 className="text-2xl font-bold mb-3">New here?</h2>

              <p className="text-sm text-white/70 mb-6 max-w-[220px]">
                Create a ID, Join your Guild, and Reach to new Guild React to Other's people gamplay .
              </p>

              <button
                onClick={() => setIsSignUp(true)}
                className="flex items-center gap-2 rounded-full border border-white/50 px-6 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-white hover:text-[#17120D]"
              >
                Create account
                <FiArrowRight />
              </button>
            </>
          ) : (
            <>
              {/* Existing User */}

              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/10 flex items-center justify-center mb-6">
                <FiUser className="text-2xl text-[#FFD873]" />
              </div>

              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#FFD873]/80 mb-2">
                Good to see you
              </p>

              <h2 className="text-2xl font-bold mb-3">Already have an account?</h2>

              <p className="text-sm text-white/70 mb-6 max-w-[220px]">
                Your Guild are right where you left them.
                Login and back to the flow.
              </p>

              <button
                onClick={() => setIsSignUp(false)}
                className="flex items-center gap-2 rounded-full border border-white/50 px-6 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-white hover:text-[#17120D]"
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Overlay;