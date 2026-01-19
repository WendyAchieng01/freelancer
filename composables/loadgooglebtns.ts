let googleScriptPromise: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
    if (process.server) return Promise.resolve();

    if (window.google?.accounts?.id) {
        return Promise.resolve();
    }

    if (!googleScriptPromise) {
        googleScriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;

            script.onload = () => resolve();
            script.onerror = () => reject("Google script failed to load");

            document.head.appendChild(script);
        });
    }

    return googleScriptPromise;
}
