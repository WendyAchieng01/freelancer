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
    const { $apiClient } = useNuxtApp();
    const appStore = useAppStore();

    // state
    const profile = ref<IFreelancerProfile | null>(null);
    const isLoading = ref<boolean>(false);

    // helper to validate text fields
    function hasText(value?: string) {
      return !!value && value.trim().length > 0;
    }

    // check each required field
    const completionFields = computed(() => {
      if (!profile.value) return [];

      const p = profile.value;

      return [
        hasText(p.full_name),
        hasText(p.profile?.bio),
        hasText(p.profile?.phone),
        hasText(p.profile?.location),
        typeof p.experience_years === "number" && p.experience_years >= 0,
        Number(p.hourly_rate) > 0,
        hasText(p.portfolio_link),
        hasText(p.availability),
        Array.isArray(p.skills) && p.skills.length > 0,
        Array.isArray(p.languages) && p.languages.length > 0,
      ];
    });

    // calculate completion percentage
    const profileCompletionPercentage = computed(() => {
      const fields = completionFields.value;
      if (!fields.length) return 0;

      const completed = fields.filter(Boolean).length;
      return Math.round((completed / fields.length) * 100);
    });

    // check if profile exists
    const hasProfile = computed(() => !!profile.value);

    // profile is complete only at 100%
    const isProfileComplete = computed(() => {
      return profileCompletionPercentage.value === 100;
    });



    // create freelancer profile
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

    // fetch authenticated freelancer profile
    async function fetchFreelancerProfile() {
      isLoading.value = true;
      try {
        const response = await $apiClient<{ data: IFreelancerProfile }>("/freelance/me", {
          method: "GET",
        });

        const data = response.data;

        // normalize skills & languages to array of strings
        if (data.skills && Array.isArray(data.skills)) {
          data.skills = data.skills
            .map((s: string) => s.split(","))
            .flat()
            .map((s: string) => s.trim());
        } else {
          data.skills = [];
        }

        if (data.languages && Array.isArray(data.languages)) {
          data.languages = data.languages
            .map((l: string) => l.split(","))
            .flat()
            .map((l: string) => l.trim());
        } else {
          data.languages = [];
        }

        profile.value = data;

        // sync auth user state
        if (user.value) {
          user.value.full_name = profile.value.full_name;
          user.value.email = profile.value.profile.user.email;
          user.value.profile_photo_url = profile.value.profile?.profile_pic ?? "";
        }

        console.log("Fetched profile:", profile.value);
        return data;
      } catch (error: any) {
        console.error("Failed to fetch freelancer profile:", error);
        appStore.showSnackBar({ type: "error", message: "Failed to load your profile." });
        return Promise.reject(error);
      } finally {
        isLoading.value = false;
      }
    }

    // update freelancer profile
    async function updateFreelancerProfile(payload: Partial<IFreelancerProfile> | FormData) {
      isLoading.value = true;
      try {
        const isFormData = payload instanceof FormData;

        console.log("Sending update payload:");
        if (isFormData) {
          for (const pair of (payload as FormData).entries()) {
            console.log(pair[0], pair[1]);
          }
        } else {
          console.log(JSON.stringify(payload, null, 2));
        }

        const response = await $apiClient<IFreelancerProfile>("/freelance/me/", {
          method: "PUT",
          body: payload,
          headers: isFormData ? {} : { "Content-Type": "application/json" },
        });

        // fetch again to sync store
        await fetchFreelancerProfile();

        appStore.showSnackBar({ type: "success", message: "Freelancer profile updated successfully!" });
        return response;
      } catch (error: any) {
        console.error("Failed to update freelancer profile:", error);
        appStore.showSnackBar({ type: "error", message: "Failed to update profile." });
        return Promise.reject(error);
      } finally {
        isLoading.value = false;
      }
    }


    // delete freelancer profile
    async function deleteFreelancerProfile(profileId: number) {
      isLoading.value = true;
      try {
        const response = await $apiClient(`/freelance/${profileId}/`, {
          method: "DELETE",
        });

        profile.value = null;

        appStore.showSnackBar({
          type: "success",
          message: "Profile deleted successfully!",
        });

        return response;
      } catch (error: any) {
        console.error("Failed to delete freelancer profile:", error);
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
      isProfileComplete,
      profileCompletionPercentage,
      fetchFreelancerProfile,
      createFreelancerProfile,
      updateFreelancerProfile,
      deleteFreelancerProfile,
    };
  }
);