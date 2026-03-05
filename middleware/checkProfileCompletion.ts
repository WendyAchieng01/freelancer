import { useAuthStore } from "~/store/auth";
import { useFreelancerProfileStore } from "~/store/freelancer/profile";


export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore();
    const freelancerStore = useFreelancerProfileStore();

    if (!authStore.isLoggedIn) return;
    if (authStore.user?.user_type !== "freelancer") return;

    // Allow portfolio page
    if (to.path.startsWith("/freelancer/portfolio")) return;

    if (!freelancerStore.profile) {
        try {
            await freelancerStore.fetchFreelancerProfile();
        } catch {
            return navigateTo("/freelancer/portfolio");
        }
    }

    if (!freelancerStore.isProfileComplete) {
        return navigateTo("/freelancer/portfolio");
    }
});