<template>
  <v-row>
    <v-col cols="12">
      <v-btn
        variant="text"
        prepend-icon="mdi-chevron-left"
        text="Back"
        to="/client/my-jobs"
      />

      <div class="d-flex mt-4 justify-space-between">
        <h1>{{ clientJobStore.currentJob?.title }}</h1>
        <div class="d-flex ga-2">
          <v-btn
            v-if="
              clientJobStore.currentJob?.payment_verified &&
              clientJobStore.currentJob?.status !== 'completed'
            "
            text="Mark as Complete"
            @click="markAsComplete"
          />
          <v-btn
            v-if="!clientJobStore.currentJob?.payment_verified"
            text="Add Funds"
            @click="addFundsDialog = true"
          />
          <!-- DELETE BUTTON -->
          <v-btn
            color="red"
            text
            @click="deleteJob"
            :disabled="clientJobStore.currentJob?.payment_verified"
            title="Cannot delete a paid job"
          >
            Delete Job
          </v-btn>
          <!-- <v-btn
            variant="outlined"
            icon="mdi-flag-outline"
            size="small"
            @click="flagJobDialog = true"
          /> -->
        </div>
      </div>
      <v-breadcrumbs :items="breadCrumbItems" divider=">" />

      <v-timeline
        direction="horizontal"
        side="end"
        dot-color="primary"
        class="mt-5"
      >
        <v-timeline-item v-for="step in timeLineItems" :key="step.title">
          <template #icon>
            <v-icon
              :icon="step.completed ? 'mdi-check' : 'mdi-circle-medium'"
            />
          </template>
          <div>
            <div class="text-h6 text-center">{{ step.title }}</div>
            <p class="text-subtitle-1 text-medium-emphasis text-center">
              {{ step.text }}
            </p>
          </div>
        </v-timeline-item>
      </v-timeline>

      <v-row class="mt-5">
        <v-col cols="12" md="6">
          <p class="text-subtitle-2 text-medium-emphasis mt-5">Job Title</p>
          <p class="text-h6">{{ clientJobStore.currentJob?.title }}</p>

          <p class="text-subtitle-2 text-medium-emphasis mt-4">Budget</p>
          <p class="text-h6">
            {{ formatAmount(clientJobStore?.currentJob?.price ?? 0) }}
          </p>

          <p class="text-subtitle-2 text-medium-emphasis mt-4">Posted Date</p>
          <p class="text-h6">
            {{
              moment(clientJobStore.currentJob?.posted_date).format(
                "Do MMMM YYYY"
              )
            }}
          </p>

          <p class="text-subtitle-2 text-medium-emphasis mt-4">Deadline Date</p>
          <p class="text-h6">
            {{
              moment(clientJobStore.currentJob?.deadline_date).format(
                "Do MMMM YYYY"
              )
            }}
          </p>

          <v-btn
            class="mt-2"
            :disabled="clientJobStore.currentJob?.status == 'open'"
            color="grey"
            :text="clientJobStore.currentJob?.status"
          />
        </v-col>
      </v-row>
    </v-col>

    <!-- flag job dialog -->
    <AppDialog
      v-model="flagJobDialog"
      title="Flag Job"
      subtitle="Raise a concern"
      action-button-text="Submit"
    >
      <v-textarea label="Add a reason" />
    </AppDialog>

    <!-- mark job complete modal -->
    <AppModal
      v-model="markCompleteModal"
      icon="mdi-check-circle-outline"
      icon-size="80"
      message="You have succesfully marked the job as complete"
      action-text="Confirm"
      @action-click="markCompleteModal = false"
    />

    <!-- add funds dialog -->
    <ClientAddFundsDialog
      v-if="clientJobStore.currentJob"
      v-model="addFundsDialog"
      :job="clientJobStore.currentJob"
    />
  </v-row>
</template>

<script setup lang="ts">
import moment from "moment";
import { useClientJobsStore } from "~/store/client/jobs";
import { useAppStore } from "~/store/app";
import { useRouter, useRoute } from "vue-router";

definePageMeta({
  layout: "client",
});

const router = useRouter();
const route = useRoute();
const addFundsDialog = ref(false);

const clientJobStore = useClientJobsStore();
const appStore = useAppStore();

onMounted(async () => {
  await clientJobStore.fetchJobDetails(route.params.id as string);
});

// watch payment response parameters and show appropriate error message
watch(
  () => route.query,
  (newQuery) => {
    const success = newQuery?.success as "true" | "false" | undefined;
    const message = newQuery?.message as string | undefined;

    if (success && message) {
      if (success == "true")
        appStore.showSnackBar({
          type: "success",
          message,
        });
      else
        appStore.showSnackBar({
          type: "error",
          message,
        });

      // Backend call for payment status update
      $apiClient(
        `/jobs/${route.params.id}/?success=${success}&message=${message}`
      );
    }
  },
  { immediate: true }
);

const breadCrumbItems = computed(() => [
  {
    title: "Home",
    href: "/client/dashboard",
  },
  {
    title: "All Jobs",
    href: "/client/my-jobs",
  },
  {
    title: clientJobStore.currentJob?.title ?? "Job Details",
    href: "",
  },
]);

const timeLineItems = computed(() => [
  {
    title: "Job Open",
    text: "Client has posted a job",
    completed: true,
  },
  {
    title: "Payment has been made",
    text: "Client has made payment",
    completed: clientJobStore.currentJob?.payment_verified,
  },
  {
    title: "In Progress",
    text: "Freelancer has started working on the project",
    completed:
      clientJobStore.currentJob?.status === "in_progress" ||
      clientJobStore.currentJob?.status === "completed",
  },
  {
    title: "Completed",
    text: "Client has confirmed the completion of this job",
    completed: clientJobStore.currentJob?.status === "completed",
  },
  {
    title: "Freelancer Paid",
    text: "Freelancers fee has been paid",
    completed: false,
  },
]);

const flagJobDialog = ref(false);
const markCompleteModal = ref(false);

function markAsComplete() {
  if (!clientJobStore.currentJob) {
    console.error("No current job to mark as complete.");
    return;
  }

  clientJobStore
    .markJobAsCompleted(clientJobStore.currentJob)
    .then(async () => {
      markCompleteModal.value = true;
      await clientJobStore.fetchJobDetails(route.params.id as string);
    })
    .catch((error) => {
      console.error("Failed to mark job as complete:", error);
    });
}

function deleteJob() {
  if (!clientJobStore.currentJob) return;

  if (clientJobStore.currentJob.payment_verified) {
    alert("Cannot delete a job that has been paid.");
    return;
  }

  if (confirm("Are you sure you want to delete this job?")) {
    clientJobStore
      .deleteJob(clientJobStore.currentJob.id)
      .then(() => {
        appStore.showSnackBar({
          type: "success",
          message: "Job deleted successfully",
        });
        router.push("/client/my-jobs");
      })
      .catch((error) => {
        console.error("Error deleting job:", error);
        appStore.showSnackBar({
          type: "error",
          message: "Failed to delete job",
        });
      });
  }
}
</script>
