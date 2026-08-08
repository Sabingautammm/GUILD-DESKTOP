import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../services/authApi";
import { ApiError } from "../../../services/api/client";
import { useToast } from "../../../components/toast/ToastProvider";
import { useAuth } from "../context/AuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

// When no real VITE_GOOGLE_CLIENT_ID is configured, the backend accepts a mock
// token (NODE_ENV=development) so the whole onboarding flow can be tested
// end-to-end without Google credentials.
const MOCK_GOOGLE_TOKEN = "mock-google-token-for-dev";

function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In."));
    document.head.appendChild(script);
  });
}

export default function SocialLogin() {
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInWithGoogle = async () => {
    if (GOOGLE_CLIENT_ID) {
      await loadGsiScript();
      return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: "popup",
          callback: (response) => {
            if (!response?.credential) {
              reject(new Error("Google sign-in was cancelled."));
            } else {
              resolve(response.credential);
            }
          },
        });
        window.google.accounts.id.prompt();
      });
    }
    return MOCK_GOOGLE_TOKEN;
  };

  const handleGoogle = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const idToken = await signInWithGoogle();
      await toast.promise(googleLogin(idToken), {
        loading: "Connecting to Google…",
        success: "Signed in with Google",
        error: (err) => (err instanceof ApiError ? err.message : "Google sign-in failed."),
      });
      await refresh();
      navigate("/");
    } catch {
      // toast already surfaced the error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full my-4">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {isSubmitting ? <FiLoader className="animate-spin text-red-500" /> : <FaGoogle className="text-red-500" />}
        Continue with Google
      </button>
    </div>
  );
}
