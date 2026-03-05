import { useAppStore } from "~/store/app";
import { useStorage, StorageSerializers } from "@vueuse/core";
import type {
  IUser,
  IAuthResponse,
  ILoginPayload,
  IRegisterPayload,
  IPasswordChangePayload,
  IPasswordResetRequestPayload,
  IPasswordResetConfirmPayload,
  ITokenRefreshResponse,
} from "~/types/auth.d";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = useStorage<IUser | null>("my-user", null, undefined, {
    serializer: StorageSerializers.object,
  });
  const accessToken = useStorage<string | null>("accessToken", null);
  const refreshToken = useStorage<string | null>("refreshToken", null);
  const isLoading = ref<boolean>(false);

  // Getters
  const isLoggedIn = computed(() => !!accessToken.value && !!user.value);

  const { $apiClient } = useNuxtApp();
  const appStore = useAppStore();

  // Actions
  async function login(payload: ILoginPayload) {
    isLoading.value = true;
    try {
      const response = await $apiClient<IAuthResponse>("/auth/login/", {
        method: "POST",
        body: { ...payload },
      });

      accessToken.value = response.access;
      refreshToken.value = response.refresh;

      let responseUser;
      if (response.user.profile_data?.client_profile)
        responseUser = response.user.profile_data.client_profile.profile.user;
      else if (response.user.profile_data?.freelancer_profile)
        responseUser =
          response.user.profile_data.freelancer_profile.profile.user;
      else responseUser = response.user.profile_data;

      let profileURL;
      if (response.user_type == "client")
        profileURL =
          response.user.profile_data.client_profile.profile.profile_pic;
      else if (response.user_type == "freelancer")
        profileURL =
          response.user.profile_data.freelancer_profile.profile.profile_pic;

      const config = useRuntimeConfig();
      user.value = {
        id: responseUser.id,
        email: responseUser.email,
        username: responseUser.username,
        user_type: response.user_type,
        full_name: `${responseUser.first_name} ${responseUser.last_name}`,
        is_verified: false,
        profile_photo_url: `${config.public.mediaBaseUrl}${profileURL}`,
      };

      appStore.showSnackBar({
        type: "success",
        message: "Logged in successfully!",
      });

      return response;
    } catch (error: any) {
      isLoading.value = false;
      return Promise.reject(error);
    }
  }

  async function register(payload: IRegisterPayload) {
    isLoading.value = true;
    try {
      const response = await $apiClient("/auth/register/", {
        method: "POST",
        body: {
          ...payload,
          password1: payload.password,
          password2: payload.password_confirmation,
        },
      });

      appStore.showSnackBar({
        type: "success",
        message: "Registration successful! Verification email sent.",
      });
      return response;
    } catch (error: any) {
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      if (refreshToken.value) {
        await $apiClient("/auth/logout/", {
          method: "POST",
          body: { refresh: refreshToken.value },
        });
        appStore.showSnackBar({
          type: "success",
          message: "Logged out successfully!",
        });

        navigateTo("/auth/login");
      } else {
        appStore.showSnackBar({
          type: "info",
          message: "No active session to log out.",
        });
      }
    } catch (error: any) {
      // Even if logout fails on backend, clear frontend state
      appStore.showSnackBar({
        type: "error",
        message: "Logout failed on server, but session cleared locally.",
      });
      console.error("Logout API Error:", error);
    } finally {
      // Clear state and local storage regardless of API success/failure
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      user.value = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      isLoading.value = false;
    }
  }

  async function refreshAuthToken() {
    // This action typically runs silently in the background
    if (!refreshToken.value) {
      console.warn(
        "No refresh token available. Cannot refresh authentication."
      );
      return;
    }
    try {
      const response = await $apiClient<ITokenRefreshResponse>(
        "/auth/token/refresh/",
        {
          method: "POST",
          body: { refresh: refreshToken.value },
        }
      );
      accessToken.value = response.access;
      refreshToken.value = response.refresh || refreshToken.value;

      localStorage.setItem("accessToken", accessToken.value);
      localStorage.setItem("refreshToken", refreshToken.value);
      console.log("Access token refreshed successfully.");
    } catch (error: any) {
      console.error("Failed to refresh access token:", error);
      appStore.showSnackBar({
        type: "error",
        message: "Session expired. Please log in again.",
      });
      logout();
      return Promise.reject(error);
    }
  }

  async function changePassword(payload: IPasswordChangePayload) {
    isLoading.value = true;
    try {
      const response = await $apiClient("/auth/password-change/", {
        method: "POST",
        body: {
          token: accessToken.value,
          uid: user.value?.username,
          new_password1: payload.new_password,
          new_password2: payload.confirm_new_password,
        },
      });
      appStore.showSnackBar({
        type: "success",
        message: "Password updated successfully!",
      });
      return response;
    } catch (error: any) {
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function requestPasswordReset(payload: IPasswordResetRequestPayload) {
    isLoading.value = true;
    try {
      const response = await $apiClient("/auth/password-reset/", {
        method: "POST",
        body: { email: payload.email },
      });
      appStore.showSnackBar({
        type: "success",
        message: "Password reset email sent.",
      });
      return response;
    } catch (error: any) {
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function confirmPasswordReset(payload: IPasswordResetConfirmPayload) {
    isLoading.value = true;
    try {
      const response = await $apiClient(`/auth/password-change-confirm/`, {
        method: "POST",
        body: {
          uid: payload.uid,
          token: payload.token,
          new_password1: payload.new_password,
          new_password2: payload.new_password_confirm,
        },
      });
      appStore.showSnackBar({
        type: "success",
        message: "Password reset successful!",
      });
      return response;
    } catch (error: any) {
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function resendVerificationEmail(email: string) {
    isLoading.value = true;
    try {
      const response = await $apiClient(`/auth/resend-verification/`, {
        method: "POST",
        body: { email: email },
      });
      appStore.showSnackBar({
        type: "success",
        message: "Verification email resent.",
      });
      return response;
    } catch (error: any) {
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  function checkAuth() {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (storedAccessToken && storedRefreshToken) {
      accessToken.value = storedAccessToken;
      refreshToken.value = storedRefreshToken;
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser);
        } catch (e) {
          console.error("Failed to parse stored user data:", e);
          user.value = null;
        }
      }
    } else {
      logout();
    }
  }


  async function googleAuth(idToken: string, userType?: "client" | "freelancer") {
    isLoading.value = true;
    try {
      // Prepare body (include userType only if provided)
      const body: any = { id_token: idToken };
      if (userType) body.user_type = userType;

      const response = await $apiClient<IAuthResponse>("/oauth2callback/", {
        method: "POST",
        body,
      });

      // Save tokens
      accessToken.value = response.access;
      refreshToken.value = response.refresh;

      console.log("FULL BACKEND RESPONSE:", response);

      // Extract user data (simplified)
      const responseUser = response.user;
      const config = useRuntimeConfig();

      user.value = {
        id: responseUser.id,
        email: responseUser.email,
        username: responseUser.username,
        user_type: responseUser.user_type,
        full_name: `${responseUser.first_name || ""} ${responseUser.last_name || ""}`.trim(),
        is_verified: true,
        profile_photo_url: responseUser.profile_photo
          ? `${config.public.mediaBaseUrl}${responseUser.profile_photo}`
          : null,
      };

      // Choose message
      const message = response.is_new
        ? "Account created successfully with Google!"
        : "Logged in successfully with Google!";

      appStore.showSnackBar({
        type: "success",
        message,
      });

      return response;
    } catch (error: any) {
      console.error("Google auth failed:", error);
      appStore.showSnackBar({
        type: "error",
        message: "Google authentication failed. Please try again.",
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  }


  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isLoggedIn,
    login,
    register,
    logout,
    refreshAuthToken,
    changePassword,
    requestPasswordReset,
    confirmPasswordReset,
    resendVerificationEmail,
    checkAuth,
    googleAuth,
  };
});
