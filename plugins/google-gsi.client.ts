export default defineNuxtPlugin(async () => {
    if (window.google?.accounts?.id) return;

    await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject("Failed to load Google GSI");

        document.head.appendChild(script);
    });
});
