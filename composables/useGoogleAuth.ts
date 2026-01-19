import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";


export function useGoogleAuth(mode: "login" | "register") {
    const config = useRuntimeConfig();
    const clientId = config.public.googleClientId;

    function renderGoogleButton(targetId: string) {
        if (!process.client) return;

        if (!clientId) {
            console.error("Missing Google client ID");
            return;
        }

        const target = document.getElementById(targetId);
        if (!target) {
            console.error(`Google target #${targetId} not found`);
            return;
        }

        // Wait until Google SDK is actually available
        const interval = setInterval(() => {
            const googleId = window.google?.accounts?.id;

            if (!googleId) return;

            clearInterval(interval);

            // Prevent double init
            if (target.dataset.rendered === "true") return;
            target.dataset.rendered = "true";

            googleId.initialize({
                client_id: clientId,
                callback: (res) => {
                    console.log("Google response:", res);
                },
            });

            googleId.renderButton(target, {
                theme: "outline",
                size: "large",
                width: "100%",
                text: mode === "login" ? "signin_with" : "signup_with",
                shape: "rectangular",
                logo_alignment: "left",
            });
        }, 100);

        // safety stop (no infinite loop)
        setTimeout(() => clearInterval(interval), 10_000);
    }

    return { renderGoogleButton };
}

