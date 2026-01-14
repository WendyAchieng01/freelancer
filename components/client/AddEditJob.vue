<template>
  <v-row>
    <v-col>
      <v-form @submit.prevent="createJobAndTrainings">
        <template #default="{ isValid }">
          <v-text-field
            v-model="jobForm.title"
            label="Job Title"
            placeholder="e.g., Data Entry Specialist"
            :rules="[required]"
            :error-messages="jobFormErrors.title"
          />
          <v-select
            v-model="jobForm.category"
            label="Category"
            :items="metaStore.categories"
            item-title="text"
            item-value="value"
            :rules="[required]"
            :error-messages="jobFormErrors.category"
          />

          <v-text-field
            v-model="jobForm.price"
            label="Budget (KES)"
            placeholder="e.g., 500.00"
            type="number"
            step="0.01"
            :rules="[required, isNumber, positiveNumber]"
            :error-messages="jobFormErrors.price"
          />
          <v-text-field
            v-model="jobForm.deadline_date"
            label="Deadline Date"
            type="date"
            :rules="[required, isFutureDate]"
            :error-messages="jobFormErrors.deadline_date"
          />

          <v-text-field
            v-model="jobForm.max_freelancers"
            label="Max Freelancers Applications To Accept"
            placeholder="e.g., 1"
            type="number"
            :rules="[isInteger, positiveNumber]"
            :error-messages="jobFormErrors.max_freelancers"
          />
          <v-text-field
            v-model="jobForm.required_freelancers"
            label="How many Freelancers are required for this job"
            placeholder="e.g., 1"
            type="number"
            :rules="[isInteger, positiveNumber]"
            :error-messages="jobFormErrors.required_freelancers"
          />
          <v-select
            v-model="jobForm.preferred_freelancer_level"
            label="Preferred Freelancer Level"
            :items="preferredLevels"
            item-title="text"
            item-value="value"
            :error-messages="jobFormErrors.preferred_freelancer_level"
          />
          
          <v-select
          v-model="jobForm.skills_required"
          label="Skills Required"
          :items="metaStore.skills"
          item-title="text"
          item-value="value"
          :error-messages="jobFormErrors.skills_required"
          multiple
          chips
          closable-chips
        />

          <p class="text-subtitle-1 mt-4 mb-2">Description & Responsibility</p>
          <v-textarea
            v-model="jobForm.description"
            label="Job Description"
            placeholder="Detailed description of the job..."
            :rules="[required]"
            :error-messages="jobFormErrors.description"
          />
          <v-textarea
            label="Responsibilities"
            placeholder="Key responsibilities for the freelancer..."
            :rules="[required]"
            :error-messages="jobFormErrors.responsibilities"
          />

          <v-divider class="my-6" />

          <p class="text-h6 mt-4 mb-2">Training Materials (Optional)</p>
          <p class="text-body-2 mb-4">
            You can attach relevant training documents or videos for this job.
          </p>

          <v-text-field
            v-model="trainingForm.title"
            label="Training Title"
            placeholder="e.g., Onboarding Document for Project X"
            :error-messages="trainingFormErrors.title"
          />
          <v-textarea
            v-model="trainingForm.texts"
            label="Training Description"
            placeholder="Provide detailed instructions or text content for training."
            :error-messages="trainingFormErrors.texts"
          />
          <div class="d-flex flex-column flex-sm-row ga-2 mt-3">
            <div class="flex-grow-1">
              <v-file-input
                v-model="trainingForm.pdf_document"
                label="Attach PDF Document"
                prepend-inner-icon="mdi-paperclip"
                chips
                closable-chips
                show-size
                :error-messages="trainingFormErrors.pdf_document"
              />
            </div>
            <div class="flex-grow-1">
              <v-text-field
                v-model="trainingForm.video_url"
                label="Video URL"
                placeholder="Paste the training video link (Youtube, Vimeo etc.)"
                :error-messages="trainingFormErrors.video_url"
              />
            </div>
          </div>
          <v-alert
            v-if="jobFormErrors.non_field_errors || jobFormErrors.detail"
            type="error"
            variant="tonal"
            class="my-3"
            density="compact"
          >
            {{ jobFormErrors.non_field_errors?.[0] || jobFormErrors.detail }}
          </v-alert>

          <v-btn
            text="Post Job"
            append-icon="mdi-arrow-right"
            size="large"
            class="text-subtitle-2 font-weight-light mt-5"
            type="submit"
            block
            :loading="jobStore.isLoading"
            :disabled="!isValid.value || jobStore.isLoading"
          />
        </template>
      </v-form>
      
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useClientJobsStore } from "~/store/client/jobs";
import { useClientTrainingsStore } from "~/store/client/training";
import { useAppStore } from "~/store/app";
import { useCommonSkillsStore } from "~/store/common/skills";
import { useForm } from "~/composables/useForm";
import { useMetaStore } from "~/store/client/meta";
import type {
  IJobCreatePayload,
  ITrainingCreatePayload,
  JobCategory,
  PreferredFreelancerLevel,
  IJob,
} from "~/types/client.d";

const jobStore = useClientJobsStore();
const trainingStore = useClientTrainingsStore();
const appStore = useAppStore();
const skillStore = useCommonSkillsStore();

onMounted(async () => {
  await skillStore.fetchAllSkills();
});

const metaStore = useMetaStore();

onMounted(async () => {
  await metaStore.fetchMeta();
});

// ------------------------------------
// Form Initialization
// ------------------------------------

const {
  form: jobForm,
  errors: jobFormErrors,
  clearErrors: clearJobFormErrors,
  reset: resetJobForm,
} = useForm<IJobCreatePayload>({
  title: "",
  category: "Data Entry",
  description: "",
  price: "0.00",
  deadline_date: "",
  status: "open",
  max_freelancers: 100,
  required_freelancers:1,
  preferred_freelancer_level: "entry",
  skills_required: [],
});

const {
  form: trainingForm,
  errors: trainingFormErrors,
  setErrors: setTrainingFormErrors,
  clearErrors: clearTrainingFormErrors,
  reset: resetTrainingForm,
} = useForm<ITrainingCreatePayload>({
  title: "",
  texts: "",
  pdf_document: null,
  video_url: null,
});

// ------------------------------------
// Validation Rules (Reusable)
// ------------------------------------
const isNumber = (value: string) =>
  !isNaN(parseFloat(value)) || "Must be a number";
const positiveNumber = (value: string | number) =>
  parseFloat(value as string) > 0 || "Must be a positive number";
const isInteger = (value: string | number) =>
  Number.isInteger(parseFloat(value as string)) || "Must be an integer";
const isFutureDate = (value: string) => {
  if (!value) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(value);
  return inputDate >= today || "Date must be in the future or today";
};



const preferredLevels: Array<{
  text: string;
  value: PreferredFreelancerLevel;
}> = [
  { text: "Entry Level", value: "entry" },
  { text: "Intermediate", value: "intermediate" },
  { text: "Expert", value: "expert" },
];

// ------------------------------------
// Main Job Posting Function
// ------------------------------------
async function createJobAndTrainings() {
  clearJobFormErrors();
  clearTrainingFormErrors();

  let createdJob: IJob | null = null; // To store the job response

  try {
    // 1. Create the Job
    const jobPayload: IJobCreatePayload = {
      title: jobForm.title,
      category: jobForm.category,
      description: jobForm.description,
      price: jobForm.price.toString(),
      deadline_date: jobForm.deadline_date,
      status: jobForm.status,
      max_freelancers: jobForm.max_freelancers,
      preferred_freelancer_level: jobForm.preferred_freelancer_level,
      skills_required: jobForm.skills_required,
    };

    createdJob = await jobStore.createJob(jobPayload);

    // 2. If job creation is successful, attempt to create training materials
    if (
      createdJob &&
      (trainingForm.title ||
        trainingForm.texts ||
        trainingForm.pdf_document ||
        trainingForm.video_url)
    ) {
      // Only create training if at least one content field is filled
      if (
        !trainingForm.title &&
        !trainingForm.texts &&
        !trainingForm.pdf_document &&
        !trainingForm.video_url
      ) {
        appStore.showSnackBar({
          type: "warning",
          message:
            "Training materials section completed but no content has been provided.",
        });
      } else {
        const trainingPayload: ITrainingCreatePayload = {
          title: trainingForm.title,
          texts: trainingForm.texts,
          pdf_document: trainingForm.pdf_document, // This could be a File object
          video_url: trainingForm.video_url,
        };

        // Convert trainingPayload to FormData if it contains a file
        let finalTrainingPayload: ITrainingCreatePayload | FormData;

        // Check if pdf_document is a File object
        const hasFile = trainingPayload.pdf_document instanceof File;

        if (hasFile) {
          // If a file is present, convert the entire payload to FormData
          finalTrainingPayload = toFormData(
            trainingPayload as Record<string, any>
          );
          console.log(
            "Sending training data as FormData:",
            finalTrainingPayload
          );
        } else {
          // Otherwise, send as a regular JSON payload
          finalTrainingPayload = trainingPayload;
          console.log("Sending training data as JSON:", finalTrainingPayload);
        }

        await trainingStore.createTraining(
          createdJob.slug,
          finalTrainingPayload
        ); // Pass the prepared payload
        appStore.showSnackBar({
          type: "success",
          message: "Training materials attached successfully!",
        });
      }
    }

    // Reset forms on overall success
    navigateTo("/client/my-jobs");
    resetJobForm();
    resetTrainingForm();
    appStore.showSnackBar({
      type: "success",
      message: "Job and associated materials posted successfully!",
    });
  } catch (error: any) {
    console.error("Error creating job or training:", error);

    // Handle errors from job creation
    const jobBackendErrors = error.response?._data;
    if (jobBackendErrors) {
      setTrainingFormErrors(jobBackendErrors);
      const generalErrorMessage =
        jobBackendErrors.detail ||
        jobBackendErrors.non_field_errors?.[0] ||
        "Failed to post job. Please check your inputs.";
      appStore.showSnackBar({ type: "error", message: generalErrorMessage });
    } else {
      appStore.showSnackBar({
        type: "error",
        message: "An unexpected error occurred during job creation.",
      });
    }

    // If job creation failed, no training would have been attempted.
    // If job creation succeeded but training failed, this catch block would handle the training error.
    const trainingBackendErrors = error.response?._data;
    if (trainingBackendErrors) {
      setTrainingFormErrors(trainingBackendErrors);
    }
  }
}
</script>
