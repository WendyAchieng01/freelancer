<template>
  <div>
    <div class="py-10 rounded-t-lg" style="background-color: #b0c0d0" />

    <!-- Header -->
    <div class="d-flex justify-space-between mt-5">
      <v-list-item>
        <template #prepend>
          <v-avatar v-if="user" size="large" @click.stop="profileInput.click()">
            <v-img :src="profileURL" class="position-relative">
              <v-overlay
                contained
                :model-value="true"
                opacity="0.6"
                content-class="d-flex align-center justify-center h-100 w-100"
              >
                <v-icon icon="mdi-pencil-outline" color="white" size="small" />
              </v-overlay>
            </v-img>
          </v-avatar>

          <!-- profile picture input -->
          <v-file-input
            ref="profileInput"
            v-model="detailsForm.profile_picture"
            class="d-none"
            accept="image/*"
          />
        </template>

        <template #title>
          <div class="d-flex ga-2 align-center">
            <p class="text-subtitle-1">
              {{ user?.full_name }}
            </p>
            <v-icon icon="mdi-circle-small" />
            <p class="text-subtitle-1">
              <v-icon icon="mdi-star" color="yellow-darken-2" size="small" />
              {{ profileStore.profile?.rating }}
            </p>
          </div>
        </template>

        <template #subtitle>
          <div class="d-flex ga-2 align-center">
            <p>
              Freelancer
              <v-icon icon="mdi-circle-small" />
              <v-icon icon="mdi-check-decagram" color="green-darken-2" />
              Verified
            </p>
          </div>
        </template>
      </v-list-item>
    </div>

    <!-- Profile Completion Bar -->
    <v-card class="mt-5 pa-4">
      <div class="d-flex justify-space-between align-center">
        <p class="text-subtitle-1">Profile Completion</p>
        <p class="text-subtitle-2 font-weight-bold">
          {{ profileStore.profileCompletionPercentage }}%
        </p>
      </div>

      <v-progress-linear
        :model-value="profileStore.profileCompletionPercentage"
        height="12"
        rounded
        bg-color="#f3e8ff"
        color="#4B42FF"
        class="mt-2"
      >
      </v-progress-linear>

      <v-alert
        v-if="!profileStore.isProfileComplete"
        type="warning"
        variant="tonal"
        class="mt-3"
      >
        Complete your profile to start applying for jobs.
      </v-alert>
    </v-card>

    <v-row class="mt-5">
      <v-col>
        <v-form>
          <!-- Full Name (read-only) -->
          <p class="text-subtitle-1">Full Name</p>
          <v-text-field
            :model-value="profileStore.profile?.full_name"
            readonly
          />

          <!-- Bio -->
          <p class="text-subtitle-1">Bio</p>
          <v-textarea
            v-model="detailsForm.bio"
            auto-grow
            :error-messages="detailsFormErrors.bio"
          />

          <!-- Phone -->
          <p class="text-subtitle-1">Phone Number</p>
          <v-text-field
            v-model="detailsForm.phone"
            :error-messages="detailsFormErrors.phone"
          />

          <!-- Location -->
          <p class="text-subtitle-1">Location</p>
          <v-text-field
            v-model="detailsForm.location"
            :error-messages="detailsFormErrors.location"
          />

          <!-- Years of Experience -->
          <p class="text-subtitle-1">Years of Experience</p>
          <v-text-field
            v-model.number="detailsForm.experience_years"
            type="number"
            :error-messages="detailsFormErrors.experience_years"
          />

          <!-- Hourly Rate -->
          <p class="text-subtitle-1">Hourly Rate ($)</p>
          <v-text-field
            v-model.number="detailsForm.hourly_rate"
            type="number"
            :error-messages="detailsFormErrors.hourly_rate"
          />

          <!-- Portfolio Link -->
          <p class="text-subtitle-1">Portfolio Link</p>
          <v-text-field
            v-model="detailsForm.portfolio_link"
            :error-messages="detailsFormErrors.portfolio_link"
          />

          <!-- Availability -->
          <p class="text-subtitle-1">Availability</p>
          <v-select
            v-model="detailsForm.availability"
            :items="availabilityItems"
            item-title="title"
            item-value="value"
            :error-messages="detailsFormErrors.availability"
          />

          <!-- Skills (from backend meta) -->
          <p class="text-subtitle-1">Skills</p>
          <v-autocomplete
            v-model="detailsForm.skills"
            :items="skillItems"
            item-title="text"
            item-value="id"
            multiple
            chips
            closable-chips
            :error-messages="detailsFormErrors.skills"
          />


          <!-- Languages (from backend meta) -->
          <p class="text-subtitle-1">Languages</p>
          <v-autocomplete
            v-model="detailsForm.languages"
            :items="languageItems"
            item-title="text"
            item-value="id"
            multiple
            chips
            closable-chips
            :error-messages="detailsFormErrors.languages"
          />



          <div class="d-flex justify-end mt-4">
            <v-btn
              text="Save"
              :loading="profileStore.isLoading"
              :disabled="!detailsFormDirty"
              @click="saveDetails"
            />
          </div>
        </v-form>
      </v-col>
    </v-row>
  </div>
</template>



<script setup lang="ts">
import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";
import { useFreelancerProfileStore } from "~/store/freelancer/profile";
import { useFreelancerReviewsStore } from "~/store/freelancer/reviews";
import { useMetaStore } from "~/store/client/meta";

definePageMeta({ layout: "freelancer" });

const authStore = useAuthStore();
const appStore = useAppStore();
const profileStore = useFreelancerProfileStore();
const metaStore = useMetaStore();

const { user } = storeToRefs(authStore);
const { skills: skillItems, languages: languageItems } = storeToRefs(metaStore);

// form
const {
  form: detailsForm,
  errors: detailsFormErrors,
  isDirty: detailsFormDirty,
  clearErrors,
  setErrors,
} = useForm({
  bio: "",
  phone: "",
  location: "",
  experience_years: 0,
  hourly_rate: 0,
  portfolio_link: "",
  availability: "full_time",
  skills: [] as number[],
  languages: [] as number[],
  profile_picture: null as File | null,
});

const profileInput = ref<HTMLInputElement>();

// fetch profile + meta
onMounted(async () => {
  try {
    await metaStore.fetchMeta();
    const profileData = await profileStore.fetchFreelancerProfile();

    if (profileData) {
      detailsForm.bio = profileData.profile.bio;
      detailsForm.phone = profileData.profile.phone;
      detailsForm.location = profileData.profile.location;
      detailsForm.experience_years = profileData.experience_years;
      detailsForm.hourly_rate = profileData.hourly_rate;
      detailsForm.portfolio_link = profileData.portfolio_link;
      detailsForm.availability = profileData.availability;

      // Map values to IDs for autocomplete
      detailsForm.skills = profileData.skills
      .map(name => metaStore.skills.find(s => s.value.toLowerCase() === name.toLowerCase())?.id)
      .filter(Boolean);

    detailsForm.languages = profileData.languages
      .map(name => metaStore.languages.find(l => l.value.toLowerCase() === name.toLowerCase())?.id)
      .filter(Boolean);

    }
  } catch (error) {
    appStore.showSnackBar({ type: "error", message: "Failed to load profile data" });
  }
});

// availability options
const availabilityItems = [
  { title: "Full Time", value: "full_time" },
  { title: "Part Time", value: "part_time" },
  { title: "Weekends Only", value: "weekends" },
  { title: "Not Available", value: "not_available" },
];

// profile image preview
const config = useRuntimeConfig();
const profileURL = computed(() => {
  if (detailsForm.profile_picture instanceof File) {
    return URL.createObjectURL(detailsForm.profile_picture);
  }
  if (profileStore.profile?.profile?.profile_pic) {
    return `${config.public.mediaBaseUrl}${profileStore.profile.profile.profile_pic}`;
  }
  return profileImage(
    user.value?.full_name.split(" ")[0] ?? "",
    user.value?.full_name.split(" ")[1] ?? ""
  );
});

// convert to FormData
function toFormData(obj: Record<string, any>) {
  const fd = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      // convert array of IDs to comma-separated backend values
      if (key === "skills") {
        const skillValues = value
          .map((id: number) => metaStore.skills.find(s => s.id === id)?.value)
          .filter(Boolean);
        fd.append(key, skillValues.join(","));
      } else if (key === "languages") {
        const languageValues = value
          .map((id: number) => metaStore.languages.find(l => l.id === id)?.value)
          .filter(Boolean);
        fd.append(key, languageValues.join(","));
      }
    } else if (value instanceof File) {
      fd.append(key, value);
    } else {
      fd.append(key, value);
    }
  });

  return fd;
}

// save profile
async function saveDetails() {
  clearErrors();

  try {
    // convert to payload
    const payload = toFormData(detailsForm as any);

    // log payload to check what is being sent
    console.log("Sending payload:");
    for (const pair of payload.entries()) {
      console.log(pair[0], pair[1]);
    }

    await profileStore.updateFreelancerProfile(payload);
    await profileStore.fetchFreelancerProfile();

    appStore.showSnackBar({ type: "success", message: "Profile saved successfully!" });
  } catch (error: any) {
    console.error("Update error:", error);
    const backendErrors = error.response?._data;
    if (backendErrors) {
      setErrors(backendErrors);
      appStore.showSnackBar({
        type: "error",
        message: backendErrors.detail || backendErrors.non_field_errors?.[0] || "Unable to save profile",
      });
    }
  }
}

// reviews
const reviewStore = useFreelancerReviewsStore();
const { receivedReviews: reviews } = storeToRefs(reviewStore);
onMounted(async () => await reviewStore.fetchReceivedReviews());
</script>
