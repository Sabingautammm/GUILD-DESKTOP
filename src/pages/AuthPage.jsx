import { useState } from "react";
import LoginForm from "../features/auth/components/LoginForm";
import SignupForm from "../features/auth/components/SignupForm";
import Overlay from "../features/auth/components/Overlay";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-slate-100 px-4 py-8 sm:px-6">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl md:h-[560px]">
        <div className="flex flex-col md:h-full md:flex-row">
          <div className={`${isSignUp ? "hidden" : "flex"} w-full items-center justify-center px-6 py-10 sm:px-10 md:flex md:w-1/2`}>
            <LoginForm isSignUp={isSignUp} />
          </div>

          <div className={`${isSignUp ? "flex" : "hidden"} w-full items-center justify-center px-6 py-10 sm:px-10 md:flex md:w-1/2`}>
            <SignupForm isSignUp={isSignUp} />
          </div>
        </div>

        <div className="hidden md:block">
          <Overlay isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-center text-sm text-slate-500 md:hidden">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setIsSignUp(false)} className="font-medium text-indigo-500 hover:underline">
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button type="button" onClick={() => setIsSignUp(true)} className="font-medium text-indigo-500 hover:underline">
                Create an account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
