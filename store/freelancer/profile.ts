import type {
  IFreelancerProfile,
  IFreelancerProfileCreatePayload,
  IFreelancerProfileUpdatePayload,
} from "~/types/freelancer.d";
import { useAppStore } from "~/store/app";
import { useAuthStore } from "../auth";

export const useFreelancerProfileStore = defineStore(
  "freelancerProfile",
  () => {
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);

    // State
    const profile = ref<IFreelancerProfile | null>(null);
    const isLoading = ref<boolean>(false);

    // Getters
    const hasProfile = computed(() => !!profile.value);

    const { $apiClient } = useNuxtApp();
    const appStore = useAppStore();

    // Actions

    /**
     * Fetches the authenticated freelancer's profile.
     */
    async function fetchFreelancerProfile() {
      isLoading.value = true;
      try {
        const response = await $apiClient<{ data: IFreelancerProfile }>(
          `/freelance/me`,
          {
            method: "GET",
          }
        );
        profile.value = response.data;

        // update the auth state user
        if (user.value) {
          user.value.full_name = profile.value.full_name;
          user.value.email = profile.value.profile.user.email;
          user.value.profile_photo_url = profile.value.profile?.profile_pic ?? '';
        }
        return response.data;
      } catch (error: any) {
        console.error("Failed to fetch freelancer profile:", error);
        appStore.showSnackBar({
          type: "error",
          message: "Failed to load your profile.",
        });
        return Promise.reject(error);
      } finally {
        isLoading.value = false;
      }
    }

    /**
     * Creates an initial freelancer profile.
     * @param payload The profile data to create.
     */
    async function createFreelancerProfile(
      payload: IFreelancerProfileCreatePayload
    ) {
      isLoading.value = true;
      try {
        const response = await $apiClient<IFreelancerProfile>(
          "/freelance/create/",
          {
            method: "POST",
            body: payload,
          }
        );
        profile.value = response;
        appStore.showSnackBar({
          type: "success",
          message: "Freelancer profile created successfully!",
        });
        return response;
      } catch (error: any) {
        console.error("Failed to create freelancer profile:", error);
        appStore.showSnackBar({
          type: "error",
          message: "Failed to create profile.",
        });
        return Promise.reject(error);
      } finally {
        isLoading.value = false;
      }
    }

    /**
     * Updates the authenticated freelancer's profile.
     * @param profileId The ID of the freelancer profile to update.
     * @param payload The partial profile data to update.
     */
    async function updateFreelancerProfile(
      payload: Partial<IFreelancerProfileUpdatePayload> | FormData
    ) {
      isLoading.value = true;
      try {
        const isFormData = payload instanceof FormData;

        const response = await $apiClient<IFreelancerProfile>(
          `/freelance/me/`,
          {
            method: "PUT",
            body: payload,
            headers: isFormData
              ? {}
              : { "Content-Type": "application/json" },
          }
        );

        await fetchFreelancerProfile();

        appStore.showSnackBar({
          type: "success",
          message: "Freelancer profile updated successfully!",
        });

        return response;
      } catch (error: any) {
        console.error("Failed to update freelancer profile:", error);
        appStore.showSnackBar({
          type: "error",
          message: "Failed to update profile.",
        });
        return Promise.reject(error);
      } finally {
        isLoading.value = false;
      }
    }


    /**
     * Deletes the authenticated freelancer's profile.
     * @param profileId The ID of the freelancer profile to update.
     */
    async function deleteFreelancerProfile(profileId: number) {
      isLoading.value = true;
      try {
        const response = await $apiClient(`/freelance/${profileId}/`, {
          method: "DELETE",
        });
        appStore.showSnackBar({
          type: "success",
          message: "Profile deleted successfully!",
        });
        return response;
      } catch (error: any) {
        console.error(
          `Failed to update freelancer profile with ID ${profileId}:`,
          error
        );
        appStore.showSnackBar({
          type: "error",
          message: "Failed to delete profile.",
        });
        return Promise.reject(error);
      } finally {
        isLoading.value = false;
      }
    }

    return {
      profile,
      isLoading,
      hasProfile,
      fetchFreelancerProfile,
      createFreelancerProfile,
      updateFreelancerProfile,
      deleteFreelancerProfile,
    };
  }
);
