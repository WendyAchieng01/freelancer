<template>
  <div>
    <v-row v-if="currentJob" class="position-relative">
      <v-col cols="12" md="8">
        <v-card flat>
          <!-- job title -->
          <div class="d-flex justify-space-between">
            <div>
              <p class="text-caption text-medium-emphasis">
                {{ moment(currentJob?.posted_date).fromNow() }}
                <v-icon icon="mdi-circle-small" />
                {{ currentJob?.current_applications_count ?? 0 }} Bids
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
          <p
            v-if="currentJob?.has_applied"
            class="font-weight-bold text-success text-medium-emphasis mt-4"
          >
            Applied
          </p>
          <p class="mt-2 text-subtitle-1">
            {{ currentJob?.description }}
          </p>

          <!-- deadline and client rating -->
          <div class="d-flex ga-3 mt-5 text-medium-emphasis">
            <p class="text-subtitle-1">
              Deadline:
              {{ moment(currentJob?.posted_date).format("Do MMMM YYYY") }}
            </p>
          </div>
        </v-card>

        <v-divider class="my-2" />

        <!-- project status -->
        <div>
          <p class="text-subtitle-1">Project Status</p>
          <p class="text-subtitle-1 text-uppercase">{{ currentJob?.status }}</p>
        </div>

        <!-- <v-divider class="my-2" /> -->

        <!-- preparation tips -->
        <!-- <div>
          <p class="text-subtitle-1 text-medium-emphasis">
            What you should prepare for:
          </p>
          <p class="text-subtitle-1 text-medium-emphasis">
            1. What is your design process
          </p>
          <p class="text-subtitle-1 text-medium-emphasis">
            2. Show live projects
          </p>
        </div> -->

        <v-divider class="my-2" />

        <!-- skills required -->
        <div class="mt-2">
          <p class="text-subtitle-1">Skills required</p>
          <div class="d-flex ga-2 mt-3">
            <v-chip
              v-for="skill in currentJob?.skills_required_display"
              :key="skill.id"
              :text="skill.name"
              class="text-medium-emphasis text-capitalize"
            />
          </div>
        </div>

        <v-divider v-if="trainingsStore.availableTrainings.length" class="my-4" />

        <!-- training materials -->
        <p v-if="trainingsStore.availableTrainings.length" class="text-subtitle-1">Training Materials</p>
        <div
          v-for="material in trainingsStore.availableTrainings"
          :key="material.id"
        >
          <p class="text-subtitle-2 text-capitalize mt-4">
            {{ material.title }}
          </p>
          <p class="text-subtitle-1 text-medium-emphasis">
            {{ material.texts }}
          </p>

          <p
            v-if="material.video_url"
            class="text-subtitle-1 mt-4 text-medium-emphasis"
          >
            Link:
          </p>
          <p
            v-if="material.video_url"
            class="text-subtitle-1 text-medium-emphasis border pa-2 w-sm-50 rounded"
          >
            <a
              :href="material.video_url"
              target="_blank"
              class="text-decoration-none"
              >Open Video</a
            >
          </p>

          <p
            v-if="material.pdf_document"
            class="text-subtitle-1 mt-4 text-medium-emphasis"
          >
            Document:
          </p>
          <div v-if="material.pdf_document" class="pa-4 border rounded w-sm-50">
            <p
              class="border border-solid border-secondary border-md border-opacity-75 rounded pa-2 mx-4 text-truncate"
            >
              <v-icon icon="mdi-file-document-outline" />
              {{ material.file_name }}
              <span class="text-medium-emphasis text-caption ml-2">{{
                material.file_size
              }}</span>
            </p>
            <div class="d-flex justify-center mt-5">
              <v-btn
                text="Download"
                prepend-icon="mdi-download-outline"
                :href="material.pdf_document"
                target="_blank"
              />
            </div>
          </div>
        </div>

        <!-- more jobs from same client -->
        <!-- <p class="text-subtitle-1 mt-5">More jobs from this client</p> -->
        <!-- <JobCard v-for="n in 3" :key="n" /> -->
      </v-col>

      <v-divider vertical />

      <v-col cols="12" md="4" class="top-0 position-sticky">
        <!-- job actions -->
        <v-btn
          block
          text="Apply Now"
          :disabled="currentJob?.has_applied"
          :to="`/freelancer/jobs/${currentJob?.slug}/apply`"
        />
        <v-btn
          block
          text="Bookmark Job"
          class="mt-3"
          variant="outlined"
          :loading="jobStore.isBookMarking"
          @click="currentJob.bookmarked ? removeBookMark() : markBookMark()"
        >
          <template #prepend>
            <v-icon
              :icon="currentJob.bookmarked ? 'mdi-heart' : 'mdi-heart-outline'"
              :color="currentJob.bookmarked ? 'red' : 'grey'"
            />
          </template>
        </v-btn>

        <!-- client details -->
        <p class="text-subtitle-1 mt-5">About Client</p>
        <v-divider class="my-2" />

        <v-list-item
          :title="`${currentJob?.client.first_name} ${currentJob?.client.last_name}`"
          :prepend-avatar=" currentJob.client?.profile_pic ??
            profileImage(
              currentJob.client.first_name,
              currentJob.client.last_name
            )
          "
        >
          <template #append>
            <v-icon icon="mdi-check-decagram" color="green-darken-4" />
          </template>
        </v-list-item>

        <div class="pa-2 ml-2">
          <div class="d-flex align-center ga-2">
            <p class="text-subtitle-1">Client Rating:</p>
            <v-rating
              readonly
              :size="25"
              :model-value="currentJob.client_rating"
              active-color="yellow-darken-2"
            />
          </div>
          <p class="text-medium-emphasis text-subtitle-1 mt-4">
            <v-icon icon="mdi-map-marker-outline" />
            {{
              !!currentJob.client.location ? currentJob.client.location : "N/A"
            }}
          </p>
          <!-- <p class="text-medium-emphasis text-subtitle-1 mt-4">
            Total Jobs Posted: 28
          </p> 
          <p class="text-medium-emphasis text-subtitle-1 mt-4">
            Total Money Spent :
            {{ formatAmount(currentJob.client.total_amount_paid) }}
          </p>
          -->
          <p class="text-medium-emphasis text-subtitle-1 mt-4">
            Total Hires: {{ currentJob.client.total_freelancers_hired }}
          </p>
          <p class="text-medium-emphasis text-caption mt-4">
            Member since
            {{ moment(currentJob.client.date_joined).format("MMMM YYYY") }}
          </p>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import { useFreelancerJobsStore } from "~/store/freelancer/jobs";
import { useFreelancerTrainingsStore } from "~/store/freelancer/trainings";

definePageMeta({
  layout: "freelancer",
});

const jobStore = useFreelancerJobsStore();
const { currentJob } = storeToRefs(jobStore);
const trainingsStore = useFreelancerTrainingsStore();

const route = useRoute();
onMounted(async () => {
  await jobStore
    .fetchJobDetails(route.params.id as string)
    .then(async (job) => {
      await trainingsStore.fetchTrainingsForJob(job.slug);
    });
});

// bookmarking
async function markBookMark() {
  if (currentJob.value) await jobStore.bookmarkJob(currentJob.value.slug).then(() => currentJob.value.bookmarked = true)
}
async function removeBookMark() {
  if (currentJob.value) await jobStore.removeBookmarkJob(currentJob.value.slug).then(() => currentJob.value.bookmarked = false)
}
</script>
