import { useEffect, useRef } from "react";

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let scriptLoadPromise = null;

/** Loads the Google Identity Services script once, no matter how many buttons mount. */
const loadGoogleIdentityScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });
  }

  return scriptLoadPromise;
};

/**
 * Renders Google's own "Sign in with Google" button via the Identity
 * Services script (no OAuth npm dependency needed for this). On success,
 * hands the raw ID token up to `onCredential` — the backend verifies it
 * server-side, this component never trusts the token itself.
 *
 * Renders nothing if VITE_GOOGLE_CLIENT_ID isn't configured, so the rest of
 * the auth pages keep working during local setup before Google is wired up.
 */
const GoogleAuthButton = ({ onCredential, text = "continue_with" }) => {
  const containerRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !containerRef.current) return undefined;
    let cancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          width: containerRef.current.offsetWidth || 320,
        });
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, text]);

  if (!clientId) return null;

  return <div ref={containerRef} className="flex w-full justify-center [&>div]:w-full" />;
};

export default GoogleAuthButton;
