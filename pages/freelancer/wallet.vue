<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between">
      <div>
        <p class="text-h5">Overview Of Your Wallet</p>
        <p class="text-subtitle-1 text-medium-emphasis mt-2">
          Make sure your MPESA account is connected to your wallet to enable
          ease of transfer.
        </p>
      </div>

      <v-btn
        text="Set Up MPESA"
        size="large"
        class="text-subtitle-1"
        :to="{ path: '/freelancer/setup-mpesa' }"
      />
    </div>

    <v-divider class="my-4" />

    <p class="text-subtitle-1">
      NB: Funds will be disbursed at the end of the payment period if the job is already completed ( for freelancers )
    </p>

    <v-divider class="my-4" />

    <!-- MPESA Info Card -->
    <v-card class="py-2" flat variant="tonal">
      <template #text>
        <p class="text-center text-h6">
          MPESA Number:
          {{
            !!profileStore.profile?.profile?.phone
              ? profileStore.profile?.profile.phone
              : "Not Set"
          }}
        </p>
      </template>
    </v-card>

    <!-- Table Actions -->
    <div class="d-flex flex-column flex-sm-row justify-space-between mt-10">
      <!-- Optional filters/actions (commented for now) -->
      <!--
      <v-date-input
        v-model="dateRange"
        label="Select range"
        max-width="368"
        multiple="range"
        variant="outlined"
        density="comfortable"
        prepend-icon=""
        append-inner-icon="mdi-calendar-month-outline"
      />

      <div class="d-flex ga-2">
        <v-btn
          text="Export CSV"
          append-icon="mdi-file-delimited-outline"
          variant="text"
          color="grey"
          class="border"
        />
        <v-btn
          text="Download Invoices"
          append-icon="mdi-invoice-multiple-outline"
          variant="text"
          color="grey"
          class="border"
        />
      </div>
      -->
    </div>

    <div class="d-flex flex-column flex-sm-row ga-2 w-sm-33 mb-3">
      <v-card class="py-4 w-100" variant="tonal">
        <template #title>
          <p class="text-subtitle-2">Pending Payout</p>
        </template>
        <template #text>
          <p class="text-h5 font-weight-medium">
            KES {{ walletStore.pendingPayout.toLocaleString() }}
          </p>
        </template>
      </v-card>

      <v-card class="py-4 w-100" variant="tonal">
        <template #title>
          <p class="text-subtitle-2">Total Earnings</p>
        </template>
        <template #text>
          <p class="text-h5 font-weight-medium">
            KES {{ walletStore.totalEarnings.toLocaleString() }}
          </p>
        </template>
      </v-card>
    </div>

    

    <!-- Transactions Table -->
    <FreelancerTransactionTable
      v-model:page="page"
      :transactions="walletStore.transactions"
      :count="walletStore.totalTransactionsCount"
    />
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import { debounce } from "lodash";
import { useFreelancerWalletStore } from "~/store/freelancer/wallet";
import { useFreelancerProfileStore } from "~/store/freelancer/profile";

definePageMeta({
  layout: "freelancer",
});

const dateRange = shallowRef(moment().format("YYYY-MM-DD"));
const page = ref(1);
const walletStore = useFreelancerWalletStore();
const profileStore = useFreelancerProfileStore();

async function getInvoices() {
  await walletStore.fetchTransactions({ page: page.value });
  await profileStore.fetchFreelancerProfile();
}

onMounted(async () => {
  await getInvoices();
});

watch(
  dateRange,
  debounce(async () => {
    await getInvoices();
  }, 500)
);
</script>

<style scoped>
.my-custom-table :deep(thead th) {
  background-color: #ebeafa !important;
}
</style>
