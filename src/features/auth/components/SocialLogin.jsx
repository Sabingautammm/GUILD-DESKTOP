import { useRef, useEffect, useState, useCallback } from "react";
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
  const googleBtnRef = useRef(null);

  const handleCredentialResponse = useCallback(async (credential) => {
    setIsSubmitting(true);
    try {
      await toast.promise(googleLogin(credential), {
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
  }, [navigate, refresh, toast]);

  // Render Google's button into a hidden container, then click it
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadGsiScript().then(() => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) handleCredentialResponse(response.credential);
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        text: "continue_with",
        size: "large",
        shape: "rectangular",
      });
    });
  }, [handleCredentialResponse]);

  const signInWithGoogle = async () => {
    if (isSubmitting) return;

    // Dev-only: mock token when no client ID configured
    if (!GOOGLE_CLIENT_ID) {
      setIsSubmitting(true);
      try {
        await handleCredentialResponse(MOCK_GOOGLE_TOKEN);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Production: click the rendered Google button (opens a real popup, not One Tap)
    // This works in Brave/Safari where 3P cookie-based One Tap is blocked.
    if (googleBtnRef.current) {
      const btn = googleBtnRef.current.querySelector("div[role='button']");
      if (btn) btn.click();
    }
  };

  return (
    <div className="flex items-center justify-center w-full my-4">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {isSubmitting ? <FiLoader className="animate-spin text-red-500" /> : <FaGoogle className="text-red-500" />}
        Continue with Google
      </button>
      {/* Hidden container for Google's rendered button — opens a real popup (not One Tap) */}
      <div ref={googleBtnRef} className="sr-only" aria-hidden="true" />
    </div>
  );
}
