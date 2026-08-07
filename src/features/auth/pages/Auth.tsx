import { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import Overlay from "../components/Overlay";

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-slate-100 px-4 py-8 sm:px-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:h-[560px]">
        {/* Form panels — stacked full-width on mobile, side-by-side halves on desktop */}
        <div className="flex flex-col md:h-full md:flex-row">
          <div
            className={`${
              isSignUp ? "hidden" : "flex"
            } w-full items-center justify-center px-6 py-10 sm:px-10 md:flex md:w-1/2`}
          >
            <LoginForm isSignUp={isSignUp} />
          </div>

          <div
            className={`${
              isSignUp ? "flex" : "hidden"
            } w-full items-center justify-center px-6 py-10 sm:px-10 md:flex md:w-1/2`}
          >
            <SignupForm isSignUp={isSignUp} />
          </div>
        </div>

        {/* Sliding overlay — desktop only, needs the two static halves above to make sense */}
        <div className="hidden md:block">
          <Overlay isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
        </div>

        {/* Mobile equivalent of the overlay's toggle, since the overlay panel is hidden below md */}
        <div className="border-t border-slate-100 px-6 py-4 text-center text-sm text-slate-500 md:hidden">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-medium text-indigo-500 hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-medium text-indigo-500 hover:underline"
              >
                Create an account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;