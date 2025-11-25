import { defineStore } from "pinia";
import { ref } from "vue";
import type { IContactFormPayload } from "~/types/freelancer"; 
import { useAppStore } from "~/store/app";

export const useContactStore = defineStore("contact", () => {
    const isLoading = ref(false);

    const { $apiClient } = useNuxtApp();
    const appStore = useAppStore();

    async function submitContactForm(payload: IContactFormPayload) {
        isLoading.value = true;
        try {
            const response = await $apiClient("/contact/", {
                method: "POST",
                body: payload,
            });

            appStore.showSnackBar({
                type: "success",
                message: "Message sent successfully! Please check your email for our response, including your spam folder.",
            });

            return response;
        } catch (error: any) {
            appStore.showSnackBar({
                type: "error",
                message: "Failed to send message. Please try again.",
            });
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    return { isLoading, submitContactForm };
});
