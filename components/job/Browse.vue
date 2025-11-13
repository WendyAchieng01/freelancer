<template>
  <v-row class="mt-10">
    <v-col>
      <p class="text-h5">{{ title ?? "Browse through jobs you might like" }}</p>
      <p v-if="subtitle" class="text-subtitle-1 text-medium-emphasis mt-2">
        {{ subtitle }}
      </p>

      <v-tabs v-model="discovery" class="mt-4" color="">
        <v-tab class="font-weight-medium" value="most_recent">Most Recent</v-tab>
        <v-tab class="font-weight-medium" value="best_match">Best Matches</v-tab>
        <v-tab class="font-weight-medium" value="bookmarks">Bookmarked Jobs</v-tab>
        <v-tab class="font-weight-medium" value="applied_jobs">Applied Jobs</v-tab>
      </v-tabs>

      <v-divider />
      <div class="my-4" />

      <div v-for="job in jobsList" :key="job.id">
        <JobCard :job />
        <v-divider class="my-3" />
      </div>

      <v-empty-state
        v-if="!jobsList.length && !jobStore.isLoading"
        title="No Jobs"
        text="No jobs available."
        icon="mdi-book-off-outline"
        color="primary"
        size="70"
      />

      <v-pagination
        v-model="page"
        :length="Math.ceil(jobStore.totalAvailableJobsCount / 10)"
        color="primary"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { debounce } from "lodash";
import { useFreelancerJobsStore } from "~/store/freelancer/jobs";

const props = defineProps<{
  title?: string;
  subtitle?: string;
  search?: string;
  filters?: Record<string, any>;
}>();

const discovery = ref("most_recent");
const page = ref(1);

const jobStore = useFreelancerJobsStore();

const jobsList = computed(() =>
  discovery.value === "applied_jobs"
    ? jobStore.appliedJobs
    : jobStore.availableJobs
);


  async function fetchJobs() {
    console.log(`Fetching jobs with params: ${JSON.stringify({ page: page.value, match_type: discovery.value })}`);

    if (discovery.value === "applied_jobs") {
    await jobStore.fetchAppliedJobsByFreelancer({
      page: page.value,
      pageSize: 10,
      search: props.search || undefined,
    });

     jobStore.appliedJobs.forEach((job) => {
      job.has_applied = true;
    });

    return;
  }


  const params: Record<string, any> = {
    page: page.value,
    match_type: discovery.value,
    ...(props.search && { search: props.search }),
    ...(props.filters?.experience && { level: props.filters.experience }),
    ...(props.filters?.bidsReceived && { application_count: props.filters.bidsReceived }),
  };

  await jobStore.fetchAvailableJobs(params);
}



// Initial fetch
onMounted(async () => {
  await fetchJobs();
});

// Watchers
watch([discovery, props.filters, page], async () => await fetchJobs());
watch(
  () => props.search,
  debounce(async () => await fetchJobs(), 500)
);
</script>
