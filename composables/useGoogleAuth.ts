import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";

export function useGoogleAuth(mode: "login" | "register", userType?: "client" | "freelancer") {
    const authStore = useAuthStore();
    const appStore = useAppStore();

    async function handleGoogleResponse(response: any) {
        console.log("Google callback response:", response);
        const id_token = response?.credential;
        const user_type = userType;

        if (!id_token) {
            console.error("No id_token received from Google");
            appStore.showSnackBar({
                message: "Google did not return a token. Please try again.",
                type: "error",
            });
            return;
        }

        try {
            // Unified function — backend handles login/signup automatically
            const res = await authStore.googleAuth(id_token, mode === "register" ? user_type : undefined);

            // Only one snackbar (store already shows it, so this is optional)
            appStore.showSnackBar({
                message: res.is_new
                    ? "Account created successfully with Google!"
                    : "Logged in successfully with Google!",
                type: "success",
            });

            // Determine redirect target
            const finalType = res?.user_type || user_type || res?.user?.user_type || "client";

            navigateTo(
                finalType === "client" ? "/client/dashboard" : "/freelancer/dashboard"
            );
        } catch (err: any) {
            console.error("Google auth failed:", err);
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

        const waitForGoogle = () => {
            const googleId = window.google?.accounts?.id;

            if (!googleId || typeof googleId.initialize !== "function") {
                requestAnimationFrame(waitForGoogle);
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

                // silent one-time reload
                setTimeout(() => {
                    if (!target.innerHTML.trim()) {
                        if (!sessionStorage.getItem("google_reload_once")) {
                            sessionStorage.setItem("google_reload_once", "1");
                            location.reload();
                        }
                    }
                }, 1500);

            } catch (e) {
                console.warn("Google init failed, retrying…", e);
                setTimeout(waitForGoogle, 100);
            }
        };

        waitForGoogle();
    }



    return { renderGoogleButton };  
}