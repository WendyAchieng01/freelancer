import type {
  IFreelancerJobListing,
  IJobApplicationCreatePayload,
  IFreelancerJobApplication,
} from "~/types/freelancer.d";
import { useAppStore } from "~/store/app";

export const useFreelancerJobsStore = defineStore("freelancerJobs", () => {
  // State
  const availableJobs = ref<IFreelancerJobListing[]>([]);
  const currentJob = ref<IFreelancerJobListing | null>(null);
  const myApplications = ref<IFreelancerJobApplication[]>([]);
  const isLoading = ref<boolean>(false);
  const isBookMarking = ref<boolean>(false);
  const totalAvailableJobsCount = ref<number>(0);
  const totalMyApplicationsCount = ref<number>(0);
  const dashboardMetrics = ref();
  const appliedJobs = ref<IFreelancerJobListing[]>([]);
  const totalAppliedJobsCount = ref<number>(0);


  // Getters
  const hasAvailableJobs = computed(() => availableJobs.value.length > 0);
  const hasCurrentJob = computed(() => !!currentJob.value);
  const hasMyApplications = computed(() => myApplications.value.length > 0);

  const { $apiClient } = useNuxtApp();
  const appStore = useAppStore();

  // Actions
  /**
   * Fetches a paginated list of available jobs for freelancers to browse.
   * @param params Optional query parameters for filtering/pagination.
   */
  async function fetchAvailableJobs(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    ordering?: string;
    job_type?: string;
    status?: string;
    is_remote?: boolean;
  }) {
    isLoading.value = true;
    try {
      const response = await $apiClient<
        PaginatedResponse<IFreelancerJobListing>
      >("/jobs/list/", {
        method: "GET",
        query: params,
      });
      availableJobs.value = response.results;
      totalAvailableJobsCount.value = response.count;
      return response.results;
    } catch (error: any) {
      console.error("Failed to fetch available jobs:", error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load available jobs.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches a paginated list of available jobs for freelancers to browse.
   * @param params Optional query parameters for filtering/pagination.
   */
  async function fetchAvailableBookMarkedJobs(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    ordering?: string;
    job_type?: string;
    status?: string;
    is_remote?: boolean;
  }) {
    isLoading.value = true;
    try {
      const response = await $apiClient<
        PaginatedResponse<IFreelancerJobListing>
      >("/bookmarks", {
        method: "GET",
        query: params,
      });
      availableJobs.value = response.results;
      totalAvailableJobsCount.value = response.count;
      return response.results;
    } catch (error: any) {
      console.error("Failed to fetch available jobs:", error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load available jobs.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches the details of a specific job.
   * @param jobSlug The slug of the job to retrieve.
   */
  async function fetchJobDetails(jobSlug: string) {
    isLoading.value = true;
    try {
      const response = await $apiClient<IFreelancerJobListing>(
        `/jobs/${jobSlug}/`,
        {
          method: "GET",
        }
      );
      currentJob.value = response;
      return response;
    } catch (error: any) {
      console.error(`Failed to fetch job details for ${jobSlug}:`, error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load job details.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Submits an application for a specific job.
   * @param jobSlug The slug of the job to apply for.
   * @param payload The application data (cover letter, bid amount).
   */
  async function applyForJob(
    jobSlug: string,
    payload: IJobApplicationCreatePayload | FormData
  ) {
    isLoading.value = true;
    try {
      const response = await $apiClient<IFreelancerJobApplication>(
        `/jobs/${jobSlug}/apply/`,
        {
          method: "POST",
          body: payload,
        }
      );

      appStore.showSnackBar({
        type: "success",
        message: "Application submitted successfully!",
      });
      return response;
    } catch (error: any) {
      console.error(`Failed to apply for job ${jobSlug}:`, error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to submit application.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
 * Fetches all jobs the freelancer has applied to.
 * Supports pagination and filtering.
 */
  async function fetchAppliedJobsByFreelancer(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    ordering?: string;
    status?: string;
  }) {
    isLoading.value = true;
    try {
      const response = await $apiClient<
        PaginatedResponse<IFreelancerJobListing>
      >("/jobs/applied/by-freelancer/", {
        method: "GET",
        query: params,
      });

      appliedJobs.value = response.results;
      totalAppliedJobsCount.value = response.count;

      return response.results;
    } catch (error: any) {
      console.error("Failed to fetch applied jobs:", error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load applied jobs.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }


  /**
   * Fetches a paginated list of the authenticated freelancer's own job applications.
   * @param freelancerId The ID of the current freelancer.
   * @param params Optional query parameters for filtering/pagination.
   */
  async function fetchMyApplications(
    freelancerId: number,
    params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      ordering?: string;
      status?: string;
    }
  ) {
    isLoading.value = true;
    try {
      const queryParams = {
        ...params,
        freelancer_id: freelancerId,
      };
      const response = await $apiClient<
        PaginatedResponse<IFreelancerJobApplication>
      >("/jobs/aplications/", {
        method: "GET",
        query: queryParams,
      });
      myApplications.value = response.results;
      totalMyApplicationsCount.value = response.count;
      return response.results;
    } catch (error: any) {
      console.error("Failed to fetch my applications:", error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load your applications.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches the details of a specific job application.
   * @param jobSlug The slug of the job related to the application.
   * @param applicationId The ID of the application.
   */
  async function fetchApplicationDetails(
    jobSlug: string,
    applicationId: number
  ) {
    isLoading.value = true;
    try {
      const response = await $apiClient<IFreelancerJobApplication>(
        `/jobs/${jobSlug}/aplications/${applicationId}/`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error: any) {
      console.error(
        `Failed to fetch application details for ID ${applicationId} (job: ${jobSlug}):`,
        error
      );
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load application details.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function bookmarkJob(jobSlug: string) {
    isBookMarking.value = true;
    try {
      const response = await $apiClient(`bookmarks/${jobSlug}/add/`, {
        method: "POST",
      });
      const bookMarkedJobIndex = availableJobs.value.findIndex(
        (job) => job.slug === jobSlug
      );
      if (bookMarkedJobIndex !== -1)
        availableJobs.value[bookMarkedJobIndex].bookmarked = true;
      return response;
    } catch (error: any) {
      console.error(`Failed to bookmark job with slug: ${jobSlug}`);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to bookmark job.",
      });
      return Promise.reject(error);
    } finally {
      isBookMarking.value = false;
    }
  }

  async function removeBookmarkJob(jobSlug: string) {
    isBookMarking.value = true;
    try {
      const response = await $apiClient(`bookmarks/${jobSlug}/remove/`, {
        method: "DELETE",
      });
      const removedBookMarkJobIndex = availableJobs.value.findIndex(
        (job) => job.slug === jobSlug
      );
      if (removedBookMarkJobIndex !== -1)
        availableJobs.value[removedBookMarkJobIndex].bookmarked = false;
      return response;
    } catch (error: any) {
      console.error(
        `Failed to remove bookmark for the job with slug: ${jobSlug}`
      );
      appStore.showSnackBar({
        type: "error",
        message: "Failed to remove bookmark.",
      });
      return Promise.reject(error);
    } finally {
      isBookMarking.value = false;
    }
  }

  async function fetchDashboardMetrics() {
    try {
      const response = await $apiClient("jobs/dashboard/summary", {
        method: "GET",
      });
      dashboardMetrics.value = response.summary;
      return response;
    } catch (error: any) {
      console.error("Failed to fecth dashboard job metrics: " + error);
      return Promise.reject(error);
    }
  }

  return {
    availableJobs,
    currentJob,
    myApplications,
    dashboardMetrics,
    isLoading,
    isBookMarking,
    totalAvailableJobsCount,
    totalMyApplicationsCount,
    hasAvailableJobs,
    hasCurrentJob,
    hasMyApplications,
    fetchAvailableJobs,
    fetchJobDetails,
    applyForJob,
    fetchMyApplications,
    fetchApplicationDetails,
    fetchAvailableBookMarkedJobs,
    bookmarkJob,
    removeBookmarkJob,
    fetchDashboardMetrics,
    appliedJobs,
    totalAppliedJobsCount,
    fetchAppliedJobsByFreelancer,
  };
});

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
