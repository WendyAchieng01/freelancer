<template>
  <v-row>
    <v-col>
      <h1 class="mb-4">{{ isEditMode ? "Edit Job" : "Create New Job" }}</h1>

      <v-form @submit.prevent="submitJob">
        <template #default="{ isValid }">

          <!-- -------------------- JOB INFO -------------------- -->
          <v-text-field
            v-model="jobForm.title"
            label="Job Title"
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
            type="number"
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
            label="Max Applications"
            type="number"
            :rules="[isInteger, positiveNumber]"
            :error-messages="jobFormErrors.max_freelancers"
          />
          <v-text-field
            v-model="jobForm.required_freelancers"
            label="Required Freelancers"
            type="number"
            :rules="[isInteger, positiveNumber]"
            :error-messages="jobFormErrors.required_freelancers"
          />
          <v-select
            v-model="jobForm.preferred_freelancer_level"
            label="Preferred Level"
            :items="preferredLevels"
            item-title="text"
            item-value="value"
          />
          <v-select
            v-model="jobForm.skills_required"
            label="Skills Required"
            :items="metaStore.skills"
            item-title="text"
            item-value="value"
            multiple
            chips
          />
          <v-textarea
            v-model="jobForm.description"
            label="Job Description"
            :rules="[required]"
            :error-messages="jobFormErrors.description"
          />
          <v-textarea
            v-model="jobForm.responsibilities"
            label="Responsibilities"
            :rules="[required]"
            :error-messages="jobFormErrors.responsibilities"
          />

          <!-- -------------------- TRAINING -------------------- -->
          <v-divider class="my-6" />
          <h2 class="mb-2">Training Materials</h2>
          <p class="mb-4">Update training materials (leave blank if no changes)</p>

          <v-text-field
            v-model="trainingForm.title"
            label="Training Title"
          />
          <v-textarea
            v-model="trainingForm.texts"
            label="Training Description"
          />

          <!-- Existing PDF link -->
          <div v-if="currentTrainingPdfUrl" class="mb-2">
            <span>Current PDF: </span>
            <a :href="currentTrainingPdfUrl" target="_blank">View PDF</a>
          </div>

          <v-file-input
            v-model="trainingForm.pdf_document"
            label="PDF Document"
            placeholder="Select a new file to replace existing PDF"
          />
          <v-text-field
            v-model="trainingForm.video_url"
            label="Video URL"
          />

          <v-btn
            :text="isEditMode ? 'Update Job' : 'Post Job'"
            type="submit"
            block
            :loading="jobStore.isLoading || trainingStore.isLoading"
            :disabled="!isValid.value"
            class="mt-4"
          />
        </template>
      </v-form>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useClientJobsStore } from "~/store/client/jobs";
import { useClientTrainingsStore } from "~/store/client/training";
import { useForm } from "~/composables/useForm";
import { useMetaStore } from "~/store/client/meta";

const route = useRoute();
const router = useRouter();
const jobStore = useClientJobsStore();
const trainingStore = useClientTrainingsStore();
const metaStore = useMetaStore();

const isEditMode = computed(() => !!route.params.slug);

// ---------------- FORMS ----------------
const { form: jobForm, errors: jobFormErrors, clearErrors } = useForm({
  title: "",
  category: "",
  description: "",
  responsibilities: "",
  price: "",
  deadline_date: "",
  status: "open",
  max_freelancers: 1,
  required_freelancers: 1,
  preferred_freelancer_level: "entry",
  skills_required: [],
});

const { form: trainingForm, setErrors: setTrainingFormErrors } = useForm({
  title: "",
  texts: "",
  pdf_document: null,
  video_url: "",
});

// ---------------- VALIDATION ----------------
const required = (value: string) => !!value || "Required";
const isNumber = (value: string) => !isNaN(parseFloat(value)) || "Must be a number";
const positiveNumber = (value: string | number) => parseFloat(value as string) > 0 || "Must be positive";
const isInteger = (value: string | number) => Number.isInteger(parseFloat(value as string)) || "Must be an integer";
const isFutureDate = (value: string) => {
  if (!value) return true;
  const today = new Date();
  today.setHours(0,0,0,0);
  return new Date(value) >= today || "Date must be today or future";
};

// ---------------- PREFERRED LEVELS ----------------
const preferredLevels = [
  { text: "Entry Level", value: "entry" },
  { text: "Intermediate", value: "intermediate" },
  { text: "Expert", value: "expert" },
];

// ---------------- LOAD JOB & TRAINING ----------------
let currentTrainingSlug: string | null = null;
const currentTrainingPdfUrl = ref<string | null>(null);

onMounted(async () => {
  await metaStore.fetchMeta();

  if (isEditMode.value) {
    const job = await jobStore.fetchJobDetails(route.params.slug as string);

    Object.assign(jobForm, {
      title: job.title,
      category: job.category,
      description: job.description,
      responsibilities: job.responsibilities,
      price: job.price,
      deadline_date: job.deadline_date?.split("T")[0],
      max_freelancers: job.max_freelancers,
      required_freelancers: job.required_freelancers,
      preferred_freelancer_level: job.preferred_freelancer_level,
      skills_required: job.skills_required_display.map((s: any) => s.name),
      status: job.status,
    });

    // Fetch existing training
    const trainings = await trainingStore.fetchTrainingsForJob(route.params.slug as string);
    if (trainings.length > 0) {
      const t = trainings[0];
      currentTrainingSlug = t.slug;
      Object.assign(trainingForm, {
        title: t.title,
        texts: t.texts,
        pdf_document: null,
        video_url: t.video_url,
      });
      currentTrainingPdfUrl.value = t.pdf_document || null;
    }
  }
});

// ---------------- SUBMIT ----------------
async function submitJob() {
  clearErrors();

  const jobPayload = {
    status: jobForm.status,
    title: jobForm.title,
    category: jobForm.category,
    description: jobForm.description,
    responsibilities: jobForm.responsibilities,
    price: jobForm.price,
    max_freelancers: jobForm.max_freelancers,
    required_freelancers: jobForm.required_freelancers,
    deadline_date: jobForm.deadline_date,
    skills_required: jobForm.skills_required,
    preferred_freelancer_level: jobForm.preferred_freelancer_level,
  };

  try {
    let jobResponse;
    if (isEditMode.value) {
      jobResponse = await jobStore.updateJob(route.params.slug as string, jobPayload);

      // Update training if exists or new fields provided
      if (trainingForm.title || trainingForm.texts || trainingForm.video_url || trainingForm.pdf_document) {
        if (currentTrainingSlug) {
          const trainingPayload: any = {
            title: trainingForm.title,
            texts: trainingForm.texts,
            video_url: trainingForm.video_url,
          };
          if (trainingForm.pdf_document) {
            trainingPayload.pdf_document = trainingForm.pdf_document;
          }
          await trainingStore.updateTraining(route.params.slug as string, currentTrainingSlug, trainingPayload);
        } else {
          await trainingStore.createTraining(route.params.slug as string, trainingForm);
        }
      }
    } else {
      jobResponse = await jobStore.createJob(jobPayload);
      if (trainingForm.title || trainingForm.texts || trainingForm.video_url || trainingForm.pdf_document) {
        await trainingStore.createTraining(jobResponse.slug, trainingForm);
      }
    }

    router.push("/client/my-jobs");
  } catch (error: any) {
    console.error("Error updating job or training:", error);
    if (error.response?._data) {
      setTrainingFormErrors(error.response._data);
    }
  }
}
</script>
