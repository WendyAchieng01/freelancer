<template>
  <div>
    <h1 class="text-h4 font-weight-medium">Login to your account</h1>

    <v-form
      class="mt-5"
      :disabled="authStore.isLoading"
      @submit.prevent="loginUser"
    >
      <template #default>
        <v-text-field
          v-model="loginForm.username"
          label="Email Address"
          placeholder="Enter your email address"
          type="email"
          :rules="[required, emailFormat]"
          :error-messages="loginFormErrors.email"
        />
        <v-text-field
          v-model="loginForm.password"
          label="Password"
          placeholder="Enter your password"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="
            showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
          :rules="[required]"
          :error-messages="loginFormErrors.password"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-alert
          v-if="loginFormErrors.non_field_errors || loginFormErrors.detail"
          type="error"
          variant="tonal"
          class="my-3"
          density="compact"
          :text="
            loginFormErrors.non_field_errors?.[0] || loginFormErrors.detail?.[0]
          "
        />

        <div class="d-flex justify-space-between mt-2 align-center">
          <v-checkbox label="Remember Me?" hide-details color="primary" />
          <p class="text-subtitle-1 text-primary">
            <NuxtLink href="/auth/forgot-password" class="text-decoration-none">
              Forgot Password
            </NuxtLink>
          </p>
        </div>

        <v-btn
          text="Login"
          class="mt-5 text-subtitle-2"
          size="large"
          type="submit"
          block
          :loading="authStore.isLoading"
        />
      </template>
    </v-form>

    <!-- Divider -->
    <v-row no-gutters class="mt-7">
      <div class="d-flex w-100 align-center ga-3">
        <v-divider />
        <p>Or</p>
        <v-divider />
      </div>
    </v-row>

    <!-- Google Login Button -->
    <div id="googleLoginBtn" class="mt-5" style="width: 100%;"></div>


    <p class="text-subtitle-1 mt-5">
      Don't have an account?
      <NuxtLink to="/auth/register" class="font-weight-medium">
        Sign Up
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~/store/app";
import { useAuthStore } from "~/store/auth";
import type { ILoginPayload } from "~/types/auth";
import { useGoogleAuth } from "~/composables/useGoogleAuth";

definePageMeta({
  layout: "auth",
});

const showPassword = ref(false);
const authStore = useAuthStore();
const appStore = useAppStore();

// Initialize useForm composable
const {
  form: loginForm,
  errors: loginFormErrors,
  setErrors,
  clearErrors,
} = useForm<ILoginPayload>({
  username: "",
  password: "",
  remember_me: false,
});

onMounted(() => {
  if (!import.meta.client) return;

  const alreadyReloaded = sessionStorage.getItem("gsi_hydrated");

  if (alreadyReloaded) return;

  // wait for Google render attempt
  setTimeout(() => {
    const googleBtn = document.getElementById("googleLoginBtn");

    if (!googleBtn || !googleBtn.innerHTML.trim()) {
      sessionStorage.setItem("gsi_hydrated", "1");
      location.reload();
    }
  }, 1200); // time to wait for google
});


async function loginUser() {
  clearErrors();

  try {
    const response = await authStore.login(loginForm);
    const responseUser = response.user.profile_data;

    appStore.showSnackBar({ message: "Login successful!", type: "success" });
    if (response.user_type === "freelancer")
      navigateTo(`/freelancer/dashboard`, { replace: true });
    else if (responseUser?.client_profile?.slug)
      navigateTo(`/client/dashboard`, { replace: true });
    else navigateTo("/client/onboarding", { replace: true });
  } catch (error: any) {
    const backendErrors = error.response?._data;

    if (backendErrors) {
      setErrors(backendErrors);

      const generalErrorMessage =
        backendErrors.detail ||
        backendErrors.non_field_errors?.[0] ||
        "Login failed. Please check your credentials.";
      appStore.showSnackBar({ message: generalErrorMessage, type: "error" });
    } else {
      appStore.showSnackBar({
        message: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  }
}


// Google Auth
const { renderGoogleButton } = useGoogleAuth("login");

onMounted(() => {
  renderGoogleButton("googleLoginBtn");
});


</script>
