import { useCallback, useEffect, useRef, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { googleLogin, googleLoginCode } from "../services/authApi";
import { ApiError } from "../../../services/api/client";
import { useToast } from "../../../components/toast/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { start, cancel, onUrl, onInvalidUrl } from "@fabianlars/tauri-plugin-oauth";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

// When no real VITE_GOOGLE_CLIENT_ID is configured, the backend accepts a mock
// token (NODE_ENV=development) so the whole onboarding flow can be tested
// end-to-end without Google credentials.
const MOCK_GOOGLE_TOKEN = "mock-google-token-for-dev";

// Desktop login runs in the SYSTEM BROWSER (RFC 8252 loopback): the app starts
// a local server, opens Google in the browser, and Google redirects back to
// this loopback URL. This exact origin MUST be registered as an "Authorized
// redirect URI" on the web OAuth client in Google Cloud Console.
const OAUTH_REDIRECT_PORT = 53856;
const OAUTH_REDIRECT_URI = `http://127.0.0.1:${OAUTH_REDIRECT_PORT}`;

// LoginForm + SignupForm both mount this component. GSI's initialize() must
// only ever run once per page load, so guard it at module level.
let _gsiInitialized = false;

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

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// True when running inside the Tauri desktop shell (WebView2 on Windows).
// Tauri 2 ALWAYS injects window.__TAURI_INTERNALS__ (the IPC bridge), while
// window.__TAURI__ exists only when app.withGlobalTauri is enabled in
// tauri.conf.json. Checking only __TAURI__ made this return false in packaged
// builds — GSI then loaded inside the WebView and Google blocked the OAuth,
// showing its own "sign in" page instead of the system-browser loopback flow.
function isTauri() {
  if (typeof window === "undefined") return false;
  return window.__TAURI_INTERNALS__ !== undefined || window.__TAURI__ !== undefined;
}

function generateState() {
  const array = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export default function SocialLogin() {
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gsiButtonReady, setGsiButtonReady] = useState(false);
  const [gsiInitError, setGsiInitError] = useState(false);
  const googleBtnRef = useRef(null);
  const busyRef = useRef(false);
  const gsiInitializedRef = useRef(false);

  // Shared tail for every sign-in path: post to the backend, refresh identity,
  // and land on the home page. Takes the API call itself so the caller controls
  // the payload (idToken vs authorization code).
  const completeLogin = useCallback(
    async (loginPromise) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setIsSubmitting(true);
      try {
        await toast.promise(
          Promise.resolve(loginPromise),
          {
            loading: "Connecting to Google…",
            success: "Signed in with Google",
            error: (err) => (err instanceof ApiError ? err.message : "Google sign-in failed."),
          }
        );
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

  const handleCredentialResponse = useCallback(
    (credential) => completeLogin(googleLogin(credential)),
    [completeLogin]
  );

  // Keep the GSI callback pointing at the latest handler without re-init.
  const cbRef = useRef(handleCredentialResponse);
  cbRef.current = handleCredentialResponse;

  const initializeGSI = useCallback(async () => {
    // In the Tauri shell we never load GSI into the WebView — login happens in
    // the system browser instead (handleDesktopGoogleSignIn).
    if (!GOOGLE_CLIENT_ID || gsiInitializedRef.current || isTauri()) return;

    try {
      await loadGsiScript();
      if (!window.google?.accounts?.id) return;

      gsiInitializedRef.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) cbRef.current(response.credential);
        },
        // Mobile-friendly: use popup UX instead of redirect
        ux_mode: "popup",
        // Allow the button to be re-rendered
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render button if ref is available
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          type: "standard",
          size: "large",
          width: "100%",
          max_width: 400,
          text: "continue_with",
          locale: navigator.language || "en",
        });
        setGsiButtonReady(true);
      }
    } catch (err) {
      console.warn("[SocialLogin] GSI initialization failed:", err);
      setGsiInitError(true);
    }
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let isMounted = true;
    initializeGSI().catch(() => {
      if (isMounted) setGsiInitError(true);
    });

    return () => {
      isMounted = false;
    };
  }, [initializeGSI]);

  const handleMockLogin = async () => {
    if (busyRef.current) return;
    setIsSubmitting(true);
    try {
      await handleCredentialResponse(MOCK_GOOGLE_TOKEN);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePopupLogin = useCallback(async () => {
    if (busyRef.current || !GOOGLE_CLIENT_ID) return;
    busyRef.current = true;
    setIsSubmitting(true);

    try {
      await loadGsiScript();
      if (!window.google?.accounts?.id) throw new Error("GSI not loaded");

      // The GSI callback already routes through cbRef.current
      // (handleCredentialResponse), which performs the actual login. We only
      // need prompt() to confirm the popup was displayed — if it wasn't,
      // reject immediately so the button never hangs in a loading state.
      await new Promise((resolve, reject) => {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error("not-displayed"));
          } else if (notification.getMomentType() === "display") {
            // Popup shown — the credential callback will fire and complete
            // the login via handleCredentialResponse. Resolve here; spinner
            // state is managed by handleCredentialResponse's busyRef.
            resolve();
          }
        });
      });
    } catch (err) {
      console.warn("[SocialLogin] Popup login failed:", err);
      toast.error(
        "Google sign-in popup couldn't open. Allow popups for this site, then try the Google button above."
      );
    } finally {
      busyRef.current = false;
      setIsSubmitting(false);
    }
  }, [toast]);

  // Tauri/Windows: sign in with the SYSTEM browser. The app starts a loopback
  // server, opens Google's account chooser in the browser, and Google redirects
  // back to http://127.0.0.1:53856 with an authorization code. The code is then
  // exchanged by the backend, which sets the session cookies in the app.
  const handleDesktopGoogleSignIn = useCallback(async () => {
    if (busyRef.current || !GOOGLE_CLIENT_ID) return;
    busyRef.current = true;
    setIsSubmitting(true);

    let cleanups = [];
    let serverPort = null;

    try {
      serverPort = await start({ ports: [OAUTH_REDIRECT_PORT] });

      const state = generateState();
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: OAUTH_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        state,
        prompt: "select_account",
        access_type: "offline",
      });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Open Google's account chooser in the system default browser. Tauri
      // intercepts window.open and launches the browser; the user logs in there
      // and Google redirects back to the loopback server below.
      window.open(authUrl, "_blank");

      // Wait for Google to redirect the browser back to the loopback server.
      const redirectedUrl = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Sign-in timed out. Please try again.")), 5 * 60 * 1000);

        onUrl((url) => {
          clearTimeout(timeout);
          resolve(url);
        })
          .then((unlisten) => cleanups.push(unlisten))
          .catch(() => {});

        onInvalidUrl((err) => {
          clearTimeout(timeout);
          reject(new Error(err));
        })
          .then((unlisten) => cleanups.push(unlisten))
          .catch(() => {});
      });
      cleanups.forEach((unlisten) => {
        try {
          unlisten();
        } catch {
          // listener already torn down
        }
      });
      cleanups = [];

      const parsed = new URL(redirectedUrl);
      const returnedState = parsed.searchParams.get("state");
      const code = parsed.searchParams.get("code");

      if (!code) {
        throw new Error(parsed.searchParams.get("error") || "No sign-in code returned from Google.");
      }
      if (returnedState !== state) {
        throw new Error("Sign-in verification failed. Please try again.");
      }

      await cancel(serverPort);
      serverPort = null;

      await completeLogin(googleLoginCode(code, OAUTH_REDIRECT_URI));
    } catch (err) {
      console.warn("[SocialLogin] Desktop Google sign-in failed:", err);
      busyRef.current = false;
      setIsSubmitting(false);
      toast.error(err?.message || "Google sign-in failed. Try again.");
    } finally {
      cleanups.forEach((unlisten) => {
        try {
          unlisten();
        } catch {
          // noop
        }
      });
      if (serverPort !== null) {
        try {
          await cancel(serverPort);
        } catch {
          // server already gone
        }
      }
      busyRef.current = false;
      setIsSubmitting(false);
    }
  }, [completeLogin, toast]);

  // Mobile: use popup-based flow for better compatibility
  const isMobile = isMobileDevice();
  const isDesktop = isTauri();

  return (
    <div className="flex flex-col items-center gap-3 w-full my-4">
      {GOOGLE_CLIENT_ID ? (
        isDesktop ? (
          /* Desktop: one button that sends the user to the system browser. */
          <button
            type="button"
            onClick={handleDesktopGoogleSignIn}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full max-w-[400px] min-h-[48px] rounded-lg gold-gradient-bg px-4 py-3 text-sm font-bold text-guild-950 hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_4px_14px_-4px_rgba(227,160,18,0.5)]"
          >
            {isSubmitting ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FaGoogle className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Continue with Google</span>
            <span className="sm:hidden">Google</span>
          </button>
        ) : (
          <>
            {/* GSI button container — always mounted so renderButton always has
                a target. Hidden (but present) until GSI finishes initializing;
                the custom popup button shows below while it loads or if GSI
                fails. */}
            <div
              ref={googleBtnRef}
              className={`justify-center w-full min-w-[280px] ${gsiButtonReady ? "flex" : "hidden"}`}
              aria-label="Continue with Google"
              style={{ maxWidth: "100%" }}
            />

            {/* Fallback custom button while GSI initializes or after a failure */}
            {(!gsiButtonReady || gsiInitError) && (
              <button
                type="button"
                onClick={handlePopupLogin}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full max-w-[400px] min-h-[48px] rounded-lg border border-gold-500/50 bg-gold-500/10 px-4 py-3 text-sm font-semibold text-gold-300 hover:bg-gold-500/20 hover:border-gold-500 disabled:opacity-50 transition-all"
                aria-label="Continue with Google"
              >
                {isSubmitting ? (
                  <FiLoader className="animate-spin text-gold-400" />
                ) : (
                  <FaGoogle className="text-red-400" style={{ fontSize: "1.25rem" }} />
                )}
                <span className="hidden sm:inline">Continue with Google</span>
                <span className="sm:hidden">Google</span>
              </button>
            )}

            {/* Mobile hint */}
            {isMobile && gsiButtonReady && (
              <p className="text-[11px] text-guild-500 text-center px-4">
                Tap the button above to sign in with Google
              </p>
            )}
          </>
        )
      ) : (
        <button
          type="button"
          onClick={handleMockLogin}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full max-w-[400px] min-h-[48px] rounded-lg border border-guild-600 px-4 py-3 text-sm font-semibold text-guild-300 hover:bg-guild-800 hover:border-gold-500/40 disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? <FiLoader className="animate-spin text-red-400" /> : <FaGoogle className="text-red-400" style={{ fontSize: "1.25rem" }} />}
          <span className="hidden sm:inline">Continue with Google</span>
          <span className="sm:hidden">Google</span>
        </button>
      )}

      <p className="text-center text-[11px] text-guild-600 px-4">
        By continuing you agree to the GUILD terms. Leaders verify ownership after signing in.
      </p>
    </div>
  );
}