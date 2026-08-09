import { useCallback, useEffect, useRef, useState } from "react";
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

// LoginForm + SignupForm both mount this component. GSI's initialize() must
// only ever run once per page load, so guard it at module level.
let gsiInitialized = false;

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
  const busyRef = useRef(false);

  const handleCredentialResponse = useCallback(
    async (credential) => {
      if (busyRef.current) return;
      busyRef.current = true;
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
        busyRef.current = false;
        setIsSubmitting(false);
      }
    },
    [navigate, refresh, toast]
  );

  // Keep the GSI callback pointing at the latest handler without re-init.
  const cbRef = useRef(handleCredentialResponse);
  cbRef.current = handleCredentialResponse;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let isMounted = true;
    loadGsiScript()
      .then(() => {
        if (!isMounted || !window.google?.accounts?.id || !googleBtnRef.current) return;

        if (!gsiInitialized) {
          gsiInitialized = true;
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              if (response?.credential) cbRef.current(response.credential);
            },
          });
        }

        // Render a REAL Google button. The user clicks it directly, so Google
        // opens a proper popup (works without 3rd-party cookies in Brave/Safari).
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          type: "standard",
          size: "large",
          width: 320,
          text: "continue_with",
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMockLogin = async () => {
    if (busyRef.current) return;
    setIsSubmitting(true);
    try {
      await handleCredentialResponse(MOCK_GOOGLE_TOKEN);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full my-4">
      {GOOGLE_CLIENT_ID ? (
        <div ref={googleBtnRef} className="flex justify-center w-full" aria-label="Continue with Google" />
      ) : (
        <button
          type="button"
          onClick={handleMockLogin}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isSubmitting ? <FiLoader className="animate-spin text-red-500" /> : <FaGoogle className="text-red-500" />}
          Continue with Google
        </button>
      )}
    </div>
  );
}