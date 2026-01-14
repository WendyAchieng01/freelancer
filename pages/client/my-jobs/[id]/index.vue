<template>
  <v-row>
    <v-col cols="12">
      <!-- Back -->
      <v-btn
        variant="text"
        prepend-icon="mdi-chevron-left"
        text="Back"
        to="/client/my-jobs"
      />

      <!-- Header -->
      <div class="d-flex mt-4 justify-space-between">
        <h1>{{ clientJobStore.currentJob?.title }}</h1>

        <div class="d-flex ga-2">
          <v-btn
            v-if="clientJobStore.currentJob?.status !== 'completed'"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-pencil"
            text="Edit Job"
            @click="goToEditJob"
          />

          <v-btn
            v-if="clientJobStore.currentJob?.payment_verified &&
                  clientJobStore.currentJob?.status !== 'completed'"
            text="Mark as Complete"
            @click="markAsComplete"
          />

          <v-btn
            v-if="!clientJobStore.currentJob?.payment_verified"
            text="Add Funds"
            @click="addFundsDialog = true"
          />

          <v-btn
            color="red"
            text
            @click="deleteJob"
            :disabled="clientJobStore.currentJob?.payment_verified"
            title="Cannot delete a paid job"
          >
            Delete Job
          </v-btn>
        </div>
      </div>

      <!-- Breadcrumbs -->
      <v-breadcrumbs :items="breadCrumbItems" divider=">" />

      <!-- Timeline -->
      <v-timeline
        direction="horizontal"
        side="end"
        dot-color="primary"
        class="mt-5"
      >
        <v-timeline-item
          v-for="step in timeLineItems"
          :key="step.title"
        >
          <template #icon>
            <v-icon :icon="step.completed ? 'mdi-check' : 'mdi-circle-medium'" />
          </template>

          <div>
            <div class="text-h6 text-center">{{ step.title }}</div>
            <p class="text-subtitle-1 text-medium-emphasis text-center">
              {{ step.text }}
            </p>
          </div>
        </v-timeline-item>
      </v-timeline>

      <!-- JOB SUMMARY -->
      <div class="job-summary mt-8">
        <h2 class="text-h6 font-weight-medium mb-5">Job Overview</h2>

        <!-- Overview -->
        <div class="overview-grid">
          <div class="overview-item">
            <span class="label">Budget</span>
            <span class="value">
              {{ formatAmount(clientJobStore.currentJob?.price ?? 0) }}
            </span>
          </div>

          <div class="overview-item">
            <span class="label">Status</span>
            <span class="value text-capitalize">
              {{ formatStatus(clientJobStore.currentJob?.status) }}
            </span>
          </div>

          <div class="overview-item">
            <span class="label">Category</span>
            <span class="value">
              {{ clientJobStore.currentJob?.category_display }}
            </span>
          </div>
        </div>

        <!-- Info blocks -->
        <div class="info-grid mt-6">
          <div class="info-card">
            <h4 class="card-title">Timeline</h4>

            <div class="info-row">
              <span class="label">Posted</span>
              <span class="value">
                {{ moment(clientJobStore.currentJob?.posted_date).format("Do MMM YYYY") }}
              </span>
            </div>

            <div class="info-row">
              <span class="label">Deadline</span>
              <span class="value">
                {{ moment(clientJobStore.currentJob?.deadline_date).format("Do MMM YYYY") }}
              </span>
            </div>
          </div>

          <div class="info-card">
            <h4 class="card-title">Hiring</h4>

            <div class="info-row">
              <span class="label">Max applications to receive</span>
              <span class="value">
                {{ clientJobStore.currentJob?.max_freelancers }}
              </span>
            </div>

            <div class="info-row">
              <span class="label">Required</span>
              <span class="value">
                {{ clientJobStore.currentJob?.required_freelancers }}
              </span>
            </div>

            <div class="info-row">
              <span class="label">Level</span>
              <span class="value">
                {{ clientJobStore.currentJob?.preferred_freelancer_level }}
              </span>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="mt-6">
          <h4 class="card-title mb-2">Skills Required</h4>

          <v-chip
            v-for="skill in clientJobStore.currentJob?.skills_required_display || []"
            :key="skill.name"
            size="small"
            class="ma-1"
          >
            {{ skill.name }}
          </v-chip>
        </div>
      </div>

      <!-- Selected Freelancers -->
      <v-divider class="my-6" />
      <p class="text-h6 mb-4">Selected Freelancers</p>

      <v-row dense>
        <v-col
          v-for="freelancer in clientJobStore.currentJob?.selected_freelancers || []"
          :key="freelancer.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="pa-4 freelancer-card" outlined>
            <!-- Remove -->
            <v-btn
              icon
              size="x-small"
              variant="tonal"
              color="red"
              class="remove-btn"
              @click="openRejectDialog(freelancer)"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>

            <v-avatar size="64" class="mb-3 mx-auto">
              <v-img
                :src="freelancer.profile_pic || 'https://i.pravatar.cc/64'"
                cover
                alt="Profile Pic"
              />
            </v-avatar>

            <div class="text-subtitle-1 font-weight-medium text-center">
              {{ freelancer.username }}
            </div>

            <div class="text-body-2 text-center text-medium-emphasis">
              {{ freelancer.full_name || '' }}
            </div>

            <div class="mt-2 text-center">
              ⭐ {{ freelancer.rating }} · {{ freelancer.recent_reviews.length }} reviews
            </div>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          v-if="!(clientJobStore.currentJob?.selected_freelancers?.length)"
        >
          <p class="text-subtitle-1 text-center text-medium-emphasis">
            No freelancers selected yet.
          </p>
        </v-col>
      </v-row>
    </v-col>

    <!-- Flag dialog -->
    <AppDialog
      v-model="flagJobDialog"
      title="Flag Job"
      subtitle="Raise a concern"
      action-button-text="Submit"
    >
      <v-textarea label="Add a reason" />
    </AppDialog>

    <!-- Reject dialog -->
    <AppDialog v-model="rejectDialog" title="Remove freelancer">
  <p class="text-body-2 mb-4">
    Are you sure you want to remove
    <strong>{{ selectedFreelancer?.username }}</strong>
    from this job?
  </p>

  <template #actions>
    <div class="d-flex w-100 justify-end">
      <v-btn
        variant="text"
        size="large"
        width="150"
        @click="rejectDialog = false"
      >
        Cancel
      </v-btn>

      <v-btn
        variant="elevated"
        size="large"
        width="150"
        color="red"
        @click="confirmReject"
      >
        Yes, remove
      </v-btn>
    </div>
  </template>
</AppDialog>


    <!-- Complete modal -->
    <AppModal
      v-model="markCompleteModal"
      icon="mdi-check-circle-outline"
      icon-size="80"
      message="You have succesfully marked the job as complete"
      action-text="Confirm"
      @action-click="markCompleteModal = false"
    />

    <!-- Add funds -->
    <ClientAddFundsDialog
      v-if="clientJobStore.currentJob"
      v-model="addFundsDialog"
      :job="clientJobStore.currentJob"
    />
  </v-row>
</template>


<style scoped>
.job-summary {
  background: transparent;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.overview-item {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  padding: 12px 14px;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
}

.value {
  font-size: 0.95rem;
  font-weight: 600;
  display: block;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.info-card {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 14px;
  padding: 16px;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.freelancer-card {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  border-radius: 50%;
}
</style>



<script setup lang="ts">
import moment from "moment";
import { ref, onMounted, computed, watch } from "vue";
import { useClientJobsStore } from "~/store/client/jobs";
import { useAppStore } from "~/store/app";
import { useRouter, useRoute } from "vue-router";

definePageMeta({ layout: "client" });

const router = useRouter();
const route = useRoute();
const addFundsDialog = ref(false);
const flagJobDialog = ref(false);
const markCompleteModal = ref(false);
const rejectDialog = ref(false);
const selectedFreelancer = ref<any>(null);


const clientJobStore = useClientJobsStore();
const appStore = useAppStore();
const { $apiClient } = useNuxtApp();

onMounted(async () => {
  await clientJobStore.fetchJobDetails(route.params.id as string);
});

// Watch for payment query params
watch(
  () => route.query,
  (newQuery) => {
    const success = newQuery?.success as "true" | "false" | undefined;
    const message = newQuery?.message as string | undefined;

    if (success && message) {
      appStore.showSnackBar({
        type: success === "true" ? "success" : "error",
        message,
      });

      $apiClient(`/jobs/${route.params.id}/?success=${success}&message=${message}`);
    }
  },
  { immediate: true }
);

const breadCrumbItems = computed(() => [
  { title: "Home", href: "/client/dashboard" },
  { title: "All Jobs", href: "/client/my-jobs" },
  { title: clientJobStore.currentJob?.title ?? "Job Details", href: "" },
]);

const timeLineItems = computed(() => [
  { title: "Job Open", text: "Client has posted a job", completed: true },
  { title: "Payment has been made", text: "Client has made payment", completed: clientJobStore.currentJob?.payment_verified },
  {
    title: "In Progress",
    text: "Freelancer has started working on the project",
    completed:
      clientJobStore.currentJob?.status === "in_progress" ||
      clientJobStore.currentJob?.status === "completed",
  },
  { title: "Completed", text: "Client has confirmed the completion of this job", completed: clientJobStore.currentJob?.status === "completed" },
  { title: "Freelancer Paid", text: "Freelancers fee has been paid", completed: false },
]);

function goToEditJob() {
  if (!clientJobStore.currentJob) return;
  router.push(`/client/my-jobs/${clientJobStore.currentJob.slug}/edit`);
}

function markAsComplete() {
  if (!clientJobStore.currentJob) return;

  clientJobStore.markJobAsCompleted(clientJobStore.currentJob)
    .then(async () => {
      markCompleteModal.value = true;
      await clientJobStore.fetchJobDetails(route.params.id as string);
    })
    .catch(console.error);
}

function deleteJob() {
  if (!clientJobStore.currentJob) return;

  if (clientJobStore.currentJob.payment_verified) {
    alert("Cannot delete a job that has been paid.");
    return;
  }

  if (confirm("Are you sure you want to delete this job?")) {
    clientJobStore.deleteJob(clientJobStore.currentJob.id)
      .then(() => {
        appStore.showSnackBar({ type: "success", message: "Job deleted successfully" });
        router.push("/client/my-jobs");
      })
      .catch((error) => {
        console.error("Error deleting job:", error);
        appStore.showSnackBar({ type: "error", message: "Failed to delete job" });
      });
  }
}

function formatStatus(status?: string) {
  if (!status) return "";
  return status.replace(/_/g, " ");
}


function openRejectDialog(freelancer: any) {
  selectedFreelancer.value = freelancer;
  rejectDialog.value = true;
}

async function confirmReject() {

  if (!clientJobStore.currentJob || !selectedFreelancer.value) return;

  await clientJobStore.rejectApplication(
    clientJobStore.currentJob.slug,
    selectedFreelancer.value.username
  );

  rejectDialog.value = false;
  selectedFreelancer.value = null;
}

</script>
