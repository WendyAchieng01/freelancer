import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";




export function useGoogleAuth(mode: "login" | "register") {
    const config = useRuntimeConfig();
    const clientId = config.public.googleClientId;


    function renderGoogleButton(targetId: string) {
        if (!process.client) return;

        const target = document.getElementById(targetId);
        if (!target) return;

        const googleId = window.google?.accounts?.id;
        if (!googleId) return;

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
        });
    }

    return { renderGoogleButton };
}

