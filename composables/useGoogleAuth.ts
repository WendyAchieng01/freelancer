import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";

export function useGoogleAuth(mode: "login" | "register", userType?: "client" | "freelancer") {
    const authStore = useAuthStore();
    const appStore = useAppStore();

    // 1Callback for Google OAuth
    async function handleGoogleResponse(response: any) {
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

            appStore.showSnackBar({
                message: res.is_new
                    ? "Account created successfully with Google!"
                    : "Logged in successfully with Google!",
                type: "success",
            });

            const finalType = res?.user_type || userType || "client";

            navigateTo(
                finalType === "client"
                    ? "/client/dashboard"
                    : "/freelancer/dashboard"
            );
        } catch (err: any) {
            const backendErrMsg =
                err?.response?._data?.error ||
                err?.response?._data?.detail ||
                "Google authentication failed. Please try again.";

            appStore.showSnackBar({
                message: backendErrMsg,
                type: "error",
            });
        }
    }

    //Render Google button
    function renderGoogleButton(targetId: string) {
        if (!process.client) return;

        const config = useRuntimeConfig();
        const clientId = config.public.googleClientId;

        if (!clientId) {
            console.error("Google Client ID is missing!");
            return;
        }

        const target = document.getElementById(targetId);
        if (!target) return;

        const googleId = window.google?.accounts?.id;
        if (!googleId) {
            console.error("Google SDK not loaded yet.");
            return;
        }

        // Initialize & render button
        googleId.initialize({
            client_id: clientId,
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
    }

    return { renderGoogleButton };
}
