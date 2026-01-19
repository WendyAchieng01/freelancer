import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";

export function useGoogleAuth(mode: "login" | "register") {
    const config = useRuntimeConfig();
    const clientId = "777181770887-2klnijg1daapgb2ujpb6d92hrh7fhiq2.apps.googleusercontent.com";

    const initGoogle = (targetId: string) => {
        const googleId = window.google?.accounts?.id;
        const target = document.getElementById(targetId);


        if (!googleId || !target) return false;

        googleId.initialize({
            client_id: clientId,
            callback: (res: any) => {
                console.log("Google response:", res);
            },
        });

        googleId.renderButton(target, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: mode === "login" ? "signin_with" : "signup_with",
        });

        return true;
    };

    function renderGoogleButton(targetId: string) {
        if (!process.client) return;

        // Try immediately
        const success = initGoogle(targetId);

        // If it failed (script not ready), wait for the script to load
        if (!success) {
            const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
            if (script) {
                script.addEventListener("load", () => initGoogle(targetId));
            }
        }
    }

    return { renderGoogleButton };
}