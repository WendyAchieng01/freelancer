<template>
  <div>
    <div class="py-10 rounded-t-lg" style="background-color: #b0c0d0" />

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

          <!-- change profile picture input -->
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
            <p class="text-subtitle-1 align-center">
              <v-icon
                icon="mdi-star"
                color="yellow-darken-2"
                size="small"
                class="mb-1"
              />
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

      <!-- <v-btn text="Share Profile" /> -->
    </div>

    <!-- email verification alert -->
    <v-alert
      v-if="false"
      icon="mdi-information-outline"
      variant="tonal"
      type="warning"
      class="mt-5"
    >
      <p>
        Account verification required
        <NuxtLink
          class="text-success font-weight-bold text-decoration-underline"
        >
          Verify Now!
        </NuxtLink>
      </p>
    </v-alert>

    <v-row class="mt-5">
      <v-col>
        <v-form>
          <template #default>
            <!-- Bio -->
            <p class="text-subtitle-1 d-flex align-center ga-2">
              <span> Bio (500 max words) </span>
              <v-icon
                icon="mdi-pencil-outline"
                color="primary"
                class="mb-1"
                size="small"
              />
            </p>
            <v-textarea
              v-model="detailsForm.bio"
              density="comfortable"
              auto-grow
              :error-messages="detailsFormErrors.bio"
              type="text"
            />

            <!-- phone number -->
            <p class="text-subtitle-1">Phone Number</p>
            <v-text-field
              v-model="detailsForm.phone"
              :error-messages="detailsFormErrors.phone"
              type="tel"
            />

            <!-- location -->
            <p class="text-subtitle-1">Location</p>
            <v-text-field
              v-model="detailsForm.location"
              :error-messages="detailsFormErrors.location"
              type="address"
            />

            <!-- YOE -->
            <p class="text-subtitle-1">Years of Experience</p>
            <v-text-field
              v-model.number="detailsForm.experience_years"
              :error-messages="detailsFormErrors.experience_years"
              type="number"
            />

            <!-- Availability -->
            <p class="text-subtitle-1">Availability</p>
            <v-select
              v-model="detailsForm.availability"
              :error-messages="detailsFormErrors.availability"
              :items="availabilityItems"
            />

            <!-- Availability -->
            <p class="text-subtitle-1">Skills</p>
            <v-autocomplete
              v-model="detailsForm.skills"
              multiple
              chips
              closable-chips
              placeholder="Select a skill"
              :items="skillItems"
              item-title="text"
              item-value="value"
              :error-messages="detailsFormErrors.skills"
            />

            <!-- Language -->
            <p class="text-subtitle-1 mt-3">Language</p>
            <v-autocomplete
              v-model="detailsForm.languages"
              label="Select a skill"
              :items="['English', 'Swahili', 'French', 'Spanish']"
              multiple
              chips
              closable-chips
              :error-messages="detailsFormErrors.languages"
            />

            <div class="d-flex justify-end">
              <v-btn
                text="Save"
                class="mt-3"
                :disabled="!detailsFormDirty"
                :loading="profileStore.isLoading"
                @click="saveDetails"
              />
            </div>

            <div class="d-flex ga-2">
              <v-img
                v-for="n in portfolios"
                :key="n"
                src="https://images.unsplash.com/photo-1505238680356-667803448bb6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                gradient="to-bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4)"
                class="rounded"
                @click="portfolioDialog = true"
              >
                <div class="d-flex justify-end pa-4">
                  <v-btn
                    icon="mdi-dots-vertical"
                    rounded="circle"
                    size="x-small"
                    color="white"
                  />
                </div>
              </v-img>
            </div>

            <!-- work experience -->
            <p v-if="workExperience.length" class="text-subtitle-1 mt-5">
              Nilltech work experience
            </p>
            <p
              v-if="workExperience.length"
              class="text-body-2 text-medium-emphasis"
            >
              Your work experience gets automatically updated when you complete
              jobs on your dashboard
            </p>

            <v-card
              v-for="n in workExperience"
              :key="n"
              class="mt-3"
              subtitle="Jan 2025 - Present"
              flat
            >
              <template #title>
                <div class="d-flex justify-space-between">
                  <p class="text-subtitle-1">Employment 1</p>
                  <div class="d-flex ga-2">
                    <v-icon
                      icon="mdi-delete-circle-outline"
                      size="small"
                      color="primary"
                    />
                    <v-icon
                      icon="mdi-pencil-circle-outline"
                      size="small"
                      color="primary"
                      @click="editWorkExperienceDialog = true"
                    />
                  </div>
                </div>
              </template>
              <template #text>
                Conducted interviews and surveys with employees from various
                departments to gather insights on pain points, needs, and goals.
                Analyzed usage data from the existing portal to identify areas
                with high bounce rates or low engagement. Collaborated with HR,
                IT, and leadership to align the project with business objectives
                and employee needs.
              </template>
            </v-card>

            <!-- reviews -->
            <div class="d-flex justify-space-between align-center mt-5">
              <p class="text-h6">Reviews</p>
              <v-btn
                text="View More"
                variant="text"
                append-icon="mdi-chevron-right"
                to="/freelancer/portfolio/reviews"
              />
            </div>

            <p v-if="!reviews.length" class="text-subtitle-1">No Reviews</p>

            <v-card
              v-for="review in reviews"
              :key="review.id"
              :title="review.reviewer"
              subtitle="Client"
              flat
            >
              <template #text>
                <div class="d-flex align-center ga-2 mb-2">
                  <p class="text-subtitle-1">Rating:</p>
                  <v-rating
                    :size="25"
                    :model-value="review.rating"
                    active-color="yellow-darken-2"
                  />
                </div>
                {{ review.comment }}
              </template>
            </v-card>
          </template>
        </v-form>
      </v-col>
    </v-row>

    <!-- portfolio dialog -->
    <AppDialog
      v-model="portfolioDialog"
      title="Your Portfolio"
      subtitle="Media"
      action-button-text="Save"
    >
      <v-img
        src="https://images.unsplash.com/photo-1505238680356-667803448bb6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      <p class="text-subtitle-1 mt-3">Description</p>
      <v-textarea
        model-value="The objective of this project is to redesign the user experience (UX) of the [Product Name] mobile app to improve user satisfaction, enhance usability, and increase engagement. The current version of the app has received feedback indicating difficulty in navigation, confusing interface elements, and lack of intuitive flow."
      />

      <p class="text-subtitle-1">Role</p>
      <v-text-field model-value="UI/UX Designer" />

      <p class="text-subtitle-1">Link <v-icon icon="mdi-content-copy" /></p>
      <v-text-field model-value="www.portfolio.com" />
    </AppDialog>

    <!-- edit work experience dialog -->
    <AppDialog
      v-model="editWorkExperienceDialog"
      title="Edit Work Experience"
      subtitle="Work Experience"
      action-button-text="Save"
    >
      <p class="text-subtitle-1">Company Name</p>
      <v-text-field model-value="Portfolio" />
      <p class="text-subtitle-1">Country</p>
      <v-text-field model-value="Kenya" />
      <p class="text-subtitle-1">Role</p>
      <v-text-field model-value="UI/UX Designer" />
      <p class="text-subtitle-1">Add Link</p>
      <v-text-field model-value="www.portfolio.com" />
      <p class="text-subtitle-1">Start Date</p>
      <div class="d-flex ga-2">
        <v-text-field type="month" placeholder="Month" />
        <v-text-field type="date" placeholder="Year" />
      </div>
      <p class="text-subtitle-1">End Date</p>
      <div class="d-flex ga-2">
        <v-text-field type="month" placeholder="Month" />
        <v-text-field type="date" placeholder="Year" />
      </div>
      <p class="text-subtitle-1">Description</p>
      <v-textarea />
    </AppDialog>

    <!-- give review dialog -->
    <JobGiveReviewDialog v-model="giveReviewDialog" />

    <!-- request review dialog -->
    <JobRequestReviewDialog v-model="requestReviewDialog" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/store/auth";
import { useAppStore } from "~/store/app";
import { useFreelancerProfileStore } from "~/store/freelancer/profile";
import { useFreelancerReviewsStore } from "~/store/freelancer/reviews";
definePageMeta({
  layout: "freelancer",
});

const authStore = useAuthStore();
const appStore = useAppStore();
const profileStore = useFreelancerProfileStore();
const { user } = storeToRefs(authStore);

// details
const {
  form: detailsForm,
  errors: detailsFormErrors,
  isDirty: detailsFormDirty,
  clearErrors: clearDetailsFormErrors,
  setErrors: setDetailsFormErrors,
} = useForm({
  phone: "",
  location: "",
  bio: "",
  profile_picture: null as null | File,
  experience_years: 0,
  availability: "full_time",
  skills: [],
  languages: [],
});
const profileInput = ref();

// get user profile
onMounted(async () => {
  try {
    const profileData = await profileStore.fetchFreelancerProfile();
    if (profileData) {
      // Fill the form fields from the nested backend data structure
      detailsForm.bio = profileData.profile.bio;
      detailsForm.phone = profileData.profile.phone;
      detailsForm.location = profileData.profile.location;

      detailsForm.experience_years = profileData.experience_years;
      detailsForm.availability = profileData.availability;
      detailsForm.skills = profileData.skills as any;
      detailsForm.languages = profileData.languages as any;
    }
  } catch (error: any) {
    console.log(error);
    appStore.showSnackBar({
      type: "error",
      message: "Failed to load profile!",
    });
  }
});

const skillItems: Array<{
  text: string;
  value: string;
}> = [
  { text: "Python", value: "python" },
  { text: "Javascript", value: "javascript" },
  { text: "Java", value: "java" },
  { text: "C#", value: "csharp" },
  { text: "C++", value: "cpp" },
  { text: "PHP", value: "php" },
  { text: "Ruby", value: "ruby" },
  { text: "Swift", value: "swift" },
  { text: "Kotlin", value: "kotlin" },
  { text: "Go", value: "go" },
  { text: "Rust", value: "rust" },
  { text: "TypeScript", value: "typescript" },
  { text: "HTML", value: "html" },
  { text: "CSS", value: "css" },
  { text: "React", value: "react" },
  { text: "Angular", value: "angular" },
  { text: "Vue", value: "vue" },
  { text: "Django", value: "django" },
  { text: "Flask", value: "flask" },
  { text: "Node.js", value: "nodejs" },
  { text: "Express", value: "express" },
  { text: "Spring", value: "spring" },
  { text: "Laravel", value: "laravel" },
  { text: "ASP.NET", value: "aspnet" },
  { text: "jQuery", value: "jquery" },
  { text: "Bootstrap", value: "bootstrap" },
  { text: "Tailwind CSS", value: "tailwind" },
  { text: "Android", value: "android" },
  { text: "iOS", value: "ios" },
  { text: "Flutter", value: "flutter" },
  { text: "React Native", value: "reactnative" },
  { text: "Xamarin", value: "xamarin" },
  { text: "SQL", value: "sql" },
  { text: "MySQL", value: "mysql" },
  { text: "PostgreSQL", value: "postgresql" },
  { text: "MongoDB", value: "mongodb" },
  { text: "Oracle", value: "oracle" },
  { text: "Firebase", value: "firebase" },
  { text: "Redis", value: "redis" },
  { text: "AWS", value: "aws" },
  { text: "Azure", value: "azure" },
  { text: "GCP", value: "gcp" },
  { text: "Docker", value: "docker" },
  { text: "Kubernetes", value: "kubernetes" },
  { text: "Jenkins", value: "jenkins" },
  { text: "GitOps", value: "gitops" },
  { text: "Terraform", value: "terraform" },
  { text: "Ansible", value: "ansible" },
  { text: "Python (Data)", value: "python_data" },
  { text: "R", value: "r" },
  { text: "Machine Learning", value: "machine_learning" },
  { text: "Deep Learning", value: "deep_learning" },
  { text: "TensorFlow", value: "tensorflow" },
  { text: "PyTorch", value: "pytorch" },
  { text: "Pandas", value: "pandas" },
  { text: "NumPy", value: "numpy" },
  { text: "Scikit-learn", value: "scikit" },
  { text: "NLP", value: "nlp" },
  { text: "Computer Vision", value: "computer_vision" },
  { text: "UI/UX", value: "uiux" },
  { text: "Graphic Design", value: "graphic_design" },
  { text: "Figma", value: "figma" },
  { text: "Adobe XD", value: "adobe_xd" },
  { text: "Sketch", value: "sketch" },
  { text: "Photoshop", value: "photoshop" },
  { text: "Illustrator", value: "illustrator" },
  { text: "Agile", value: "agile" },
  { text: "Scrum", value: "scrum" },
  { text: "Kanban", value: "kanban" },
  { text: "Jira", value: "jira" },
  { text: "Confluence", value: "confluence" },
  { text: "Trello", value: "trello" },
  { text: "Asana", value: "asana" },
  { text: "Git", value: "git" },
  { text: "Testing", value: "testing" },
  { text: "DevOps", value: "devops" },
  { text: "Cybersecurity", value: "cybersecurity" },
  { text: "Blockchain", value: "blockchain" },
  { text: "SEO", value: "seo" },
  { text: "Data Analysis", value: "data_analysis" },
  { text: "Technical Writing", value: "technical_writing" },
];
const availabilityItems = [
  { title: "Full Time", value: "full_time" },
  { title: "Part Time", value: "part_time" },
  { title: "Weekends Only", value: "weekends" },
  { title: "Not Available", value: "not_available" },
];

// watch the file input and replace the profile with the added one
const config = useRuntimeConfig();
const profileURL = computed(() => {
  // 1. If user selected a new file, show it as an Object URL
  if (detailsForm.profile_picture instanceof File) {
    return URL.createObjectURL(detailsForm.profile_picture);
  }

  // 2. Fallback to profile picture from store
  if (profileStore.profile?.profile?.profile_pic) {
    return `${config.public.mediaBaseUrl}${profileStore.profile.profile.profile_pic}`;
  }

  // 3. Final fallback to generated avatar
  return profileImage(
    user.value?.full_name.split(" ")[0] ?? "",
    user.value?.full_name.split(" ")?.[1] ?? ""
  );
});

function toFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item));
      } else {
        formData.append(key, value);
      }
    }
  });
  return formData;
}


async function saveDetails() {
  clearDetailsFormErrors();

  if (!user.value) return;

  try {
    await profileStore.updateFreelancerProfile(
      toFormData(detailsForm as Record<string, any>)
    );

    // 🔥 Re-fetch updated profile
    await profileStore.fetchFreelancerProfile();

    appStore.showSnackBar({
      message: "Profile saved successfully!",
      type: "success",
    });
  } catch (error: any) {
    const backendErrors = error.response?._data;

    if (backendErrors) {
      setDetailsFormErrors(backendErrors);
      const generalErrorMessage =
        backendErrors.detail ||
        backendErrors.non_field_errors?.[0] ||
        "Unable to save details. Please try again";
      appStore.showSnackBar({ message: generalErrorMessage, type: "error" });
    } else {
      appStore.showSnackBar({
        message: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  }
}


// portfolio
const portfolioDialog = ref(false);
const portfolios: any[] = [];

// work experience
const editWorkExperienceDialog = ref(false);
const workExperience: any[] = [];

// reviews
const reviewStore = useFreelancerReviewsStore();
const { receivedReviews: reviews } = storeToRefs(reviewStore);
onMounted(async () => await reviewStore.fetchReceivedReviews());

const giveReviewDialog = ref(false);
const requestReviewDialog = ref(false);
</script>
