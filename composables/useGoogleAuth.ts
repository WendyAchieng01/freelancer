import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";

export function useGoogleAuth(
    mode: "login" | "register",
    userType?: "client" | "freelancer"
) {
    const authStore = useAuthStore();
    const appStore = useAppStore();
    const config = useRuntimeConfig();

    // ENV first, fallback to hardcoded
    const CLIENT_ID =
        config.public?.googleClientId ||
        "777181770887-2klnijg1daapgb2ujpb6d92hrh7fhiq2.apps.googleusercontent.com";

    async function handleGoogleResponse(response: any) {
        console.log("Google callback response received");

        const id_token = response?.credential;

        if (!id_token) {
            appStore.showSnackBar({
                message: "Google did not return a token. Please try again.",
                type: "error",
            });
            return;
        }

        try {
            const res = await authStore.googleAuth(
                id_token,
                mode === "register" ? userType : undefined
            );

            // Chrome-safe, backend-safe extraction
            const finalType =
                res?.user_type ||
                res?.user?.user_type ||
                userType ||
                "client";

            appStore.showSnackBar({
                message: res?.is_new
                    ? "Account created successfully with Google!"
                    : "Logged in successfully with Google!",
                type: "success",
            });

            navigateTo(
                finalType === "client"
                    ? "/client/dashboard"
                    : "/freelancer/dashboard"
            );

        } catch (err: any) {
            console.error("Google auth failed:", err);

            const msg =
                err?.response?._data?.error ||
                err?.response?._data?.detail ||
                "Google authentication failed. Please try again.";

            appStore.showSnackBar({
                message: msg,
                type: "error",
            });
        }
    }


    function initGoogle(targetId: string) {
        const googleId = window.google?.accounts?.id;
        const target = document.getElementById(targetId);

        if (!googleId || !target) return false;

        googleId.initialize({
            client_id: CLIENT_ID,
            callback: handleGoogleResponse,
        });

        googleId.renderButton(target, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: mode === "login" ? "signin_with" : "signup_with",
            shape: "rectangular",
            logo_alignment: "left",
        });

        return true;
    }

    function renderGoogleButton(targetId: string) {
        if (!process.client) return;

        // Try immediately
        if (initGoogle(targetId)) return;

        // Wait for Google SDK script to load
        const interval = setInterval(() => {
            if (initGoogle(targetId)) {
                clearInterval(interval);
            }
        }, 100);

        // Safety timeout
        setTimeout(() => clearInterval(interval), 10_000);
    }

    return { renderGoogleButton };
}
