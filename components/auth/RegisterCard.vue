<template>
  <div>
    <h1 class="text-h4 font-weight-medium">Create an account</h1>

    <!-- Step 1: Create Account Form -->
    <v-form v-if="step === 'create'" class="mt-5" @submit.prevent="createAccount">
      <template #default>
        <v-text-field
          v-model="createForm.user.username"
          label="Username"
          placeholder="Enter your username"
          :rules="[required]"
          :error-messages="createFormErrors.user?.username"
        />
        <v-text-field
          v-model="createForm.user.email"
          label="Email Address"
          placeholder="Enter your email address"
          type="email"
          :rules="[required, emailFormat]"
          :error-messages="createFormErrors.user?.email"
        />
        <div class="d-flex ga-sm-2 flex-column flex-sm-row">
          <v-text-field
            v-model="createForm.user.first_name"
            label="First Name"
            placeholder="Enter your first name"
            type="text"
            :rules="[required]"
            :error-messages="createFormErrors.user?.first_name"
          />
          <v-text-field
            v-model="createForm.user.last_name"
            label="Last Name"
            placeholder="Enter your last name"
            type="text"
            :rules="[required]"
            :error-messages="createFormErrors.user?.last_name"
          />
        </div>
        <v-text-field
          v-model="createForm.password"
          label="Password"
          placeholder="Enter your password"
          :type="showPassword ? 'text' : 'password'"
          :rules="passwordRules"
          :append-inner-icon="
            showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-eye-outline'
          "
          :error-messages="createFormErrors.password"
          @click:append-inner="showPassword = !showPassword"
        />
        <v-text-field
          v-model="createForm.password_confirmation"
          label="Confirm Password"
          placeholder="Re-nter your password"
          :type="showPassword ? 'text' : 'password'"
          :rules="[mustMatch(() => createForm.password, 'Passwords')]"
          :append-inner-icon="
            showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
          :error-messages="createFormErrors.password_confirmation"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-btn
          text="Create Account"
          class="mt-5 text-subtitle-2"
          size="large"
          type="submit"
          block
          :loading="authStore.isLoading"
        />
      </template>
    </v-form>

    <!-- Step 2: Edit Email & Resend Verification -->
    <div v-else class="mt-5">
      <h2 class="text-h5 font-weight-medium">Verify Your Email</h2>
      <p>Please check your email for the verification link. If you do not find it in your inbox, kindly review your spam or junk folder. 
        <br>Should the email address be incorrect, you may edit it below:</br></p>

      <v-form @submit.prevent="resendVerification" class="mt-5">
        <v-text-field
          v-model="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          :rules="[required, emailFormat]"
        />
        <v-btn type="submit" color="primary" :loading="loading" class="mt-3">
          Resend Verification Email
        </v-btn>
      </v-form>
    </div>

    <!-- social auth -->
    <v-row no-gutters class="mt-7" v-if="step === 'create'">
      <div class="d-flex w-100 align-center ga-3">
        <v-divider />
        <p>Or</p>
        <v-divider />
      </div>
    </v-row>

    <div class="mt-5" id="googleBtn" style="width: 100%;" v-if="step === 'create'"></div>

    <p class="text-subtitle-1 mt-5">
      Already have an account?
      <NuxtLink to="/auth/login" class="font-weight-medium">Login</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";
import type { IRegisterPayload } from "~/types/auth";
import { useGoogleAuth } from "~/composables/useGoogleAuth";
import axios from "axios";

const { accountType } = defineProps<{
  accountType: "client" | "freelancer";
}>();

const showPassword = ref(false);
const authStore = useAuthStore();
const appStore = useAppStore();
const { renderGoogleButton } = useGoogleAuth("register", accountType);

const step = ref<'create'|'verify'>('create'); // Step tracker
const email = ref('');
const loading = ref(false);

// Form helpers
const {
  form: createForm,
  reset: resetCreateForm,
  errors: createFormErrors,
  setErrors,
  clearErrors,
} = useForm<IRegisterPayload>({
  user: { username: "", email: "", first_name: "", last_name: "" },
  user_type: accountType,
  password: "",
  password_confirmation: "",
});

// Validation rules
const required = (v: string) => !!v || "This field is required";
const emailFormat = (v: string) => /\S+@\S+\.\S+/.test(v) || "Invalid email";

async function createAccount() {
  clearErrors();

  try {
    await authStore.register({ ...createForm });
    appStore.showSnackBar({
      message: "Account created successfully! Please verify your email.",
      type: "success",
    });
    email.value = createForm.user.email;
    resetCreateForm();
    step.value = 'verify'; // Move to email edit/resend step
  } catch (error: any) {
    const backendErrors = error.response?._data;
    if (backendErrors) {
      setErrors(backendErrors);
      const generalErrorMessage =
        backendErrors.detail ||
        backendErrors.non_field_errors?.[0] ||
        "Failed to create account. Please check your inputs.";
      appStore.showSnackBar({ message: generalErrorMessage, type: "error" });
    } else {
      appStore.showSnackBar({
        message: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  }
}

async function resendVerification() {
  if (!email.value) return;
  loading.value = true;

  try {
    await authStore.resendVerificationEmail(email.value);

    appStore.showSnackBar({
      message: "Verification email sent successfully!",
      type: "success",
    });
  } catch (err: any) {
    appStore.showSnackBar({
      message: err.response?.data?.detail || "Failed to resend verification.",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
}


// Wait for Google SDK
onMounted(() => {
  const initGoogle = () => {
    if (window.google?.accounts?.id) {
      renderGoogleButton("googleBtn");
    } else {
      setTimeout(initGoogle, 100);
    }
  };
  initGoogle();
});
</script>
