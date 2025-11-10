<template>
  <v-data-table
    :headers
    :items="applications"
    class="my-custom-table elevation-1"
    color="primary"
  >
    <template #item.name="{ item }">
      <v-list-item :title="`${item.user.first_name} ${item.user.last_name}`">
        <template #subtitle>
          <p class="text-no-wrap">
            <!-- Full Time
            <v-icon icon="mdi-circle-small" /> -->
            Applied on
            {{ moment(item.submitted_at).format("Do MMMM YYYY HH:mm a") }}
          </p>
        </template>
      </v-list-item>
    </template>
    <template #item.status="{ item }">
      <v-chip
        :color="item.status === 'accepted' ? 'success' : 'grey'"
        :text="item.status"
        class="text-capitalize"
      />
    </template>

   <template #item.actions="{ item }">
  <div class="d-flex ga-2 align-center">
    <v-menu>
      <template #activator="{ props: menuProps }">
        <v-icon v-bind="menuProps" icon="mdi-dots-vertical" />
      </template>

      <v-list class="pa-2">
        <v-list-item
          title="Applicant Info"
          prepend-icon="mdi-account-outline"
          @click="
            selectedItem = item;
            profileInfoDialog = true;
          "
        />
        <!-- Hide instead of disable -->
        <v-list-item
          v-if="item.status !== 'accepted'"
          title="Hire Candidate"
          prepend-icon="mdi-content-save-outline"
          @click="
            selectedItem = item;
            hireCandidateDialog = true;
          "
        />
        <v-list-item
          title="Send Message"
          :disabled="!item.payment_verified"
          prepend-icon="mdi-message-reply-text-outline"
          :to="`/client/chat/?freelancer=${item?.user?.username}`"
        />
      </v-list>
    </v-menu>
  </div>
</template>
  </v-data-table>

  <!-- profile info dialog -->
  <AppDialog
    v-if="selectedItem"
    v-model="profileInfoDialog"
    :avatar="`https://ui-avatars.com/api/?name=${selectedItem.user.first_name}%20${selectedItem.user.last_name}&background=5853E0F5&color=fff`"
    :title="selectedItem.user.first_name + ' ' + selectedItem.user.last_name"
    subtitle="Website Designer (UI/UX)"
    hide-actions
  >
    <template #append>
      <div class="d-flex align-center ga-2">
        <!-- <v-btn icon="mdi-star" variant="tonal" size="small" /> -->
        <v-btn
          class="d-none d-sm-flex"
          prepend-icon="mdi-email-outline"
          text="Send Message"
          variant="outlined"
          :to="`/client/chat/?freelancer=${selectedItem?.user?.username}`"
          :disabled="selectedItem.status !== 'accepted'"
        />
        <v-btn
          prepend-icon="mdi-arrow-right-circle-outline"
          text="Hire Candidate"
          :disabled="selectedItem.status === 'accepted'"
          @click="hireCandidateDialog = true"
        />
      </div>
    </template>

    <v-row>
      <v-col>
        <v-alert
          v-if="selectedItem.status === 'accepted'"
          color="success"
          variant="outlined"
          text="This candidate has already been hired"
          density="compact"
          icon="mdi-check-decagram"
        />
        <v-list-item
          v-if="selectedItem.cv_url"
          prepend-icon="mdi-file-document-outline"
          title="CV"
          subtitle="Attachment"
          target="_blank"
          :href="`${selectedItem.cv_url}`"
          append-icon="mdi-download-outline"
        />
        <v-list-item
          v-if="selectedItem.cover_letter_url"
          prepend-icon="mdi-file-document-outline"
          title="Cover Letter"
          subtitle="Attachment"
          target="_blank"
          :href="`${selectedItem.cover_letter_url}`"
          append-icon="mdi-download-outline"
        />
        <v-list-item
          v-if="selectedItem.portfolio_url"
          prepend-icon="mdi-file-document-outline"
          title="Portfolio"
          subtitle="Attachment"
          target="_blank"
          :href="`${selectedItem.portfolio_url}`"
          append-icon="mdi-download-outline"
        />

        <p
          v-if="
            !selectedItem.cv_url &&
            !selectedItem.cover_letter_url &&
            !selectedItem.portfolio_url
          "
          class="mt-2 text-subtitle-1 text-medium-emphasis"
        >
          No documents were attached during application by the freelancer.
        </p>
      </v-col>
    </v-row>
  </AppDialog>

  <!-- select hire dialog -->
  <AppDialog
    v-model="hireCandidateDialog"
    title="Confirm"
    subtitle="Confirm Hire"
    action-button-text="Confirm"
    :loading="clientJobStore.isLoading"
    @action-button-click="hireCandidate"
  >
    <p class="text-h6 text-center">
      Are you sure you want to hire this candidate
    </p>
    <p class="text-center text-subtitle-1">You won't be able to revert this</p>
  </AppDialog>

  <!-- posting unsuccesful -->
  <AppModal
    v-model="postUnsuccesfulModal"
    icon="mdi-emoticon-sad-outline"
    color="error"
    icon-size="80"
    title="Insufficient Funds"
    message="Sorry you have not added funds for this job. Please make a payment to continue."
    action-text="Add Funds"
    @action-click="
      postUnsuccesfulModal = false;
      navigateTo(`/client/my-jobs/${selectedItem.job_slug}`)
    "
  />
</template>

<script setup lang="ts">
import moment from "moment";
import { useClientJobsStore } from "~/store/client/jobs";
import { useAppStore } from "~/store/app";
import type { IJobApplication } from "~/types/client";

defineProps<{
  applications: IJobApplication[];
}>();

const headers = [
  {
    title: "Name",
    value: "name",
  },
  {
    title: "Status",
    value: "status",
  },
  {
    title: "Email",
    value: "user.email",
  },
  {
    title: "ACTIONS",
    value: "actions",
  },
];

const selectedItem = ref<IJobApplication | null>(null);
const profileInfoDialog = ref(false);
const hireCandidateDialog = ref(false);
const postUnsuccesfulModal = ref(false);

const clientJobStore = useClientJobsStore();
const appStore = useAppStore();
const route = useRoute();

async function hireCandidate() {
  if (!selectedItem.value) return; 

  // if payment is not verified show no funds modal
  if (!selectedItem.value.payment_verified) {
    hireCandidateDialog.value = false;
    postUnsuccesfulModal.value = true;
    return;
  }

  await clientJobStore
    .acceptApplication(
      route.params.id as string,
      selectedItem.value.user.username
    )
    .then(() => {
      const hiredCandidateIndex = clientJobStore.applications.findIndex(
        (candidate) =>
          candidate.user.username === selectedItem.value?.user.username
      );
      if (hiredCandidateIndex !== -1) {
        clientJobStore.applications[hiredCandidateIndex].status = "accepted";
      }

      hireCandidateDialog.value = false;
      if (profileInfoDialog.value) profileInfoDialog.value = false;
      appStore.showSnackBar({
        type: "success",
        message: "Applicant hired successfully",
      });
    });
}

</script>

<style scoped>
.my-custom-table :deep(thead th) {
  background-color: #ebeafa !important;
}
</style>
