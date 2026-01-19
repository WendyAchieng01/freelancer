import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";

export function useGoogleAuth(
    mode: "login" | "register",
    userType?: "client" | "freelancer"
) {
    const authStore = useAuthStore();
    const appStore = useAppStore();

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

            const finalType =
                res?.user_type || userType || res?.user?.user_type || "client";

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

    function renderGoogleButton(targetId: string) {
        if (!process.client) return;

        const config = useRuntimeConfig();
        const clientId = config.public.googleClientId;

        if (!clientId) {
            console.error("Missing Google client ID");
            return;
        }

        const target = document.getElementById(targetId);
        if (!target) return;

        const waitForGoogleReady = () => {
            const googleId = window.google?.accounts?.id;

            // Google object exists but SDK not fully ready yet
            if (!googleId || typeof googleId.initialize !== "function") {
                requestAnimationFrame(waitForGoogleReady);
                return;
            }

            try {
                googleId.initialize({
                    client_id: clientId,
                    callback: handleGoogleResponse,
                });

                googleId.renderButton(target, {
                    theme: "outline",
                    size: "large",
                    text: mode === "login" ? "signin_with" : "signup_with",
                    shape: "rectangular",
                    width: "100%",
                    logo_alignment: "left",
                });

                // ONE-TIME SILENT RELOAD FALLBACK
                setTimeout(() => {
                    if (!target.innerHTML.trim()) {
                        if (!sessionStorage.getItem("google_reload_once")) {
                            sessionStorage.setItem("google_reload_once", "1");
                            location.reload();
                        }
                    }
                }, 1500);

            } catch (err) {
                // if Google  throws once before succeeding
                setTimeout(waitForGoogleReady, 100);
            }
        };

        waitForGoogleReady();
    }

    return { renderGoogleButton };
}
