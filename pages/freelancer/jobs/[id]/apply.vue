<template>
  <div>
    <p class="text-h5">Apply For This Job</p>
    <p class="text-subtitle-1 text-medium-emphasis mt-2">
      To apply for the job, you must fill in all the fields and submit to the
      client
    </p>

    <v-divider class="my-4" opacity="0.05" />

    <p class="text-h6">Job Description</p>

    <v-card flat class="mt-5">
      <!-- job title -->
      <div class="d-flex justify-space-between">
        <div>
          <p class="text-caption text-medium-emphasis">
            {{ moment(currentJob?.posted_date).fromNow() }}
            <v-icon icon="mdi-circle-small" />
            {{ currentJob?.current_applications_count }} Bids
          </p>
          <p class="text-h6">
            {{ currentJob?.title }}
          </p>
          <p class="text-caption text-medium-emphasis text-capitalize">
            {{ currentJob?.preferred_freelancer_level }} Level
            <v-icon icon="mdi-circle-small" />
            {{ formatAmount(currentJob?.price ?? 0) }}
            <v-icon icon="mdi-circle-small" />
            {{
              moment(currentJob?.deadline_date).diff(
                currentJob?.posted_date,
                "days"
              )
            }}
            days
          </p>
        </div>
      </div>

      <!-- job description -->
      <p class="mt-4 text-subtitle-1">
        {{ currentJob?.description }}
      </p>

      <!-- deadline and client rating -->
      <div class="d-flex ga-3 mt-5 text-medium-emphasis">
        <p class="text-subtitle-1">
          Deadline: {{ moment(currentJob?.posted_date).format("Do MMMM YYYY") }}
        </p>
      </div>
    </v-card>

    <!-- training materials -->
    <!-- <p class="text-subtitle-1 mt-10">Training Materials</p>
    <p class="text-subtitle-1 text-medium-emphasis border pa-2 w-50 rounded">
      www.materials.com
    </p> -->

    <!-- skills required -->
    <div class="mt-10">
      <p class="text-subtitle-1">Skills required</p>
      <div class="d-flex ga-2 mt-5">
        <v-chip
          v-for="skill in currentJob?.skills_required_display"
          :key="skill.id"
          :text="skill.name"
          class="text-medium-emphasis text-capitalize"
        />
      </div>
    </div>

    <!-- application form -->
    <p class="text-h6 mt-10">Kindly fill the form correctly</p>
    <v-form ref="formElement" class="mt-5" @submit.prevent="submitApplication">
      <template #default="{ isValid }">
        <v-file-input
          v-model="applicationForm.portfolio"
          label="Portfolio"
          :rules="[required]"
          show-size
          :error-messages="applicationFormErrors.portfolio"
        />
        <v-file-input
          v-model="applicationForm.cover_letter"
          label="Cover letter"
          show-size
          :rules="[required]"
          :error-messages="applicationFormErrors.cover_letter"
        />
        <v-file-input
          v-model="applicationForm.cv"
          label="Curriculum Vitae (CV)"
          :rules="[required]"
          show-size
          :error-messages="applicationFormErrors.cv"
        />

        <!-- payment details -->
        <p class="text-h6">Payment Details</p>
        <v-row class="mt-5">
          <v-col cols="5">
            <p class="text-subtitle-1">Price</p>
            <p class="text-subtitle-2">
              This is the total amount the client is offering for the job
            </p>
          </v-col>
          <v-col>
            <v-text-field
              readonly
              :model-value="formatAmount(currentJob?.price ?? 0)"
              class="w-sm-50"
            />
          </v-col>
        </v-row>
        <v-row class="mt-5">
          <v-col cols="5">
            <p class="text-subtitle-1">5% Freelancer Fee</p>
          </v-col>
          <v-col>
            <v-text-field
              disabled
              :model-value="
                formatAmount(
                  parseFloat(!!currentJob?.price ? currentJob.price : '0') *
                    0.05
                )
              "
              class="w-sm-50"
            />
          </v-col>
        </v-row>
        <v-row class="mt-5">
          <v-col cols="5">
            <p class="text-subtitle-1">You will get</p>
          </v-col>
          <v-col>
            <v-text-field
              readonly
              :model-value="
                formatAmount(
                  parseFloat(currentJob?.price ?? '0') -
                    parseFloat(!!currentJob?.price ? currentJob.price : '0') *
                      0.05
                )
              "
              class="w-sm-50"
            />
          </v-col>
        </v-row>

        <!-- actions -->
        <v-btn
          text="Apply Now"
          size="x-large"
          class="text-subtitle-1"
          type="submit"
          :loading
          :disabled="!isValid.value"
        />
        <v-btn
          text="Cancel"
          size="x-large"
          variant="text"
          class="text-subtitle-1"
          :to="`/freelancer/jobs/${currentJob?.slug}`"
        />
      </template>
    </v-form>

    <!-- success modal -->
    <AppModal
      v-model="showSuccessModal"
      message="You have succesfully applied for this job"
      @closed="redirectToDashboard"
      @action-click="redirectToDashboard"
    />

     <!-- Profile Incomplete Modal -->
    <AppModal
      v-model="showProfileIncompleteModal"
      title="Profile Incomplete"
      message="You must complete your profile before applying for jobs."
      action-button-text="Complete Now"
      type="error" 
      @action-click="goToCompleteProfile"
    />
  </div>
</template>



<script setup lang="ts">
import moment from "moment";
import { useAppStore } from "~/store/app";
import { useFreelancerJobsStore } from "~/store/freelancer/jobs";
import { useFreelancerTrainingsStore } from "~/store/freelancer/trainings";
import type { IJobApplicationCreatePayload } from "~/types/freelancer";
import { navigateTo } from "#app";

definePageMeta({ layout: "freelancer" });

const jobStore = useFreelancerJobsStore();
const appStore = useAppStore();
const trainingsStore = useFreelancerTrainingsStore();
const route = useRoute();

// Reactive references
const { currentJob, isLoading: loading } = storeToRefs(jobStore);

const formElement = useTemplateRef("formElement");
const {
  form: applicationForm,
  errors: applicationFormErrors,
  setErrors: setApplicationErrors,
  reset: resetApplicationErrors,
} = useForm<IJobApplicationCreatePayload>({
  portfolio: null,
  cover_letter: null,
  cv: null,
});

const showSuccessModal = ref(false);
const showProfileIncompleteModal = ref(false);

// Fetch job & trainings
onMounted(async () => {
  try {
    loading.value = true;
    const job = await jobStore.fetchJobDetails(route.params.id as string);
    await trainingsStore.fetchTrainingsForJob(job.slug);
  } catch (error) {
    console.error("Failed to fetch job or trainings", error);
    appStore.showSnackBar({ type: "error", message: "Failed to load job details." });
  } finally {
    loading.value = false;
  }
});

// Submit application
async function submitApplication() {
  formElement.value?.resetValidation();

  // Submit
  try {
    await jobStore.applyForJob(
      currentJob.value!.slug,
      toFormData(applicationForm as Record<string, any>)
    );

    showSuccessModal.value = true;
    resetApplicationErrors();
    formElement.value?.reset();

    setTimeout(() => redirectToDashboard(), 3000);
  } catch (error: any) {
    console.error("Application error:", error);

    if (error.message === "Not logged in as freelancer") return navigateTo("/login");
    if (error.message === "Profile incomplete") {
      showProfileIncompleteModal.value = true;
      return;
    }

    const backendErrors = error.response?._data;
    if (backendErrors) setApplicationErrors(backendErrors);

    const message =
      backendErrors?.detail || backendErrors?.non_field_errors?.[0] || error.message || "Failed to apply";
    appStore.showSnackBar({ type: "error", message });
  }
}

// Navigation helpers
function redirectToDashboard() {
  showSuccessModal.value = false;
  if (route.path !== "/freelancer/dashboard") navigateTo("/freelancer/dashboard");
}

function goToCompleteProfile() {
  showProfileIncompleteModal.value = false;
  navigateTo("/freelancer/portfolio");
}
</script>
