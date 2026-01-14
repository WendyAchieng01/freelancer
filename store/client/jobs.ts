import type {
  IJob,
  IJobCreatePayload,
  IJobApplication,
  JobStatus,
  IClientDashboardMetrics,
} from "~/types/client.d";
import { useAppStore } from "~/store/app";

export const useClientJobsStore = defineStore("clientJobs", () => {
  // State
  const jobs = ref<IJob[]>([]);
  const currentJob = ref<IJob | null>(null);
  const applications = ref<IJobApplication[]>([]);
  const isLoading = ref<boolean>(false);
  const totalJobsCount = ref<number>(0);
  const dashboardMetrics = ref<IClientDashboardMetrics>();

  // Getters
  const hasJobs = computed(() => jobs.value.length > 0);
  const hasCurrentJob = computed(() => !!currentJob.value);
  const hasApplications = computed(() => applications.value.length > 0);

  const { $apiClient } = useNuxtApp();
  const appStore = useAppStore();

  // Actions

  /**
   * Creates a new job posting.
   * @param payload The job data.
   */
  async function createJob(payload: IJobCreatePayload) {
    isLoading.value = true;
    try {
      const response = await $apiClient<IJob>("/jobs/create/", {
        method: "POST",
        body: payload,
      });
      jobs.value.unshift(response);
      totalJobsCount.value++;
      appStore.showSnackBar({
        type: "success",
        message: "Job created successfully!",
      });
      return response;
    } catch (error: any) {
      console.error("Failed to create job:", error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to create job.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches a list of jobs posted by the currently authenticated client.
   * @param clientId The ID of the client.
   * @param params Optional query parameters for filtering/pagination.
   */
  async function fetchClientJobs(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: JobStatus;
  }) {
    isLoading.value = true;
    try {
      const queryParams = {
        ...params,
      };

      const response = await $apiClient<PaginatedResponse<IJob>>(
        "/jobs/by-client/",
        {
          method: "GET",
          query: queryParams,
        }
      );
      jobs.value = response.results.jobs;
      totalJobsCount.value = response.count;
      return response.results;
    } catch (error: any) {
      console.error("Failed to fetch client jobs:", error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load your jobs.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches the details of a specific job by its slug.
   * @param slug The slug of the job.
   */
  async function fetchJobDetails(slug: string) {
    isLoading.value = true;
    try {
      const response = await $apiClient<IJob>(`/jobs/${slug}/`, {
        method: "GET",
      });
      currentJob.value = response;
      return response;
    } catch (error: any) {
      console.error(`Failed to fetch job details for slug ${slug}:`, error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load job details.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function markJobAsCompleted(job: IJob) {
    isLoading.value = true;
    try {
      const response = await $apiClient<IJob>(`/jobs/${job.slug}/complete/`, {
        method: "PATCH",
        body: {
          title: job.title,
          category: job.category_display,
          description: job.description,
          price: job.price,
          deadline_date: job.deadline_date,
          skills_required: job.skills_required_display?.map(
            (skill) => skill.name
          ),
          status: "completed",
        },
      });
      // Update the job in the local state if it's currently in the list or currentJob
      const index = jobs.value.findIndex((job) => job.slug === job.slug);
      if (index !== -1) {
        jobs.value[index] = response;
      }
      if (currentJob.value && currentJob.value.slug === job.slug) {
        currentJob.value = response;
      }
      appStore.showSnackBar({
        type: "success",
        message: "Job marked as completed!",
      });
      return response;
    } catch (error: any) {
      console.error(`Failed to mark job ${job.slug} as completed:`, error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to mark job as completed.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Updates an existing job.
   * @param slug The slug of the job to update.
   * @param payload The partial job data to update.
   */
  async function updateJob(slug: string, payload: IJobCreatePayload) {
    isLoading.value = true;
    try {
      const response = await $apiClient<IJob>(`/jobs/${slug}/`, {
        method: "PUT", 
        body: payload,
      });

      const index = jobs.value.findIndex(j => j.slug === slug);
      if (index !== -1) jobs.value[index] = response;
      if (currentJob.value?.slug === slug) currentJob.value = response;

      appStore.showSnackBar({
        type: "success",
        message: "Job updated successfully!",
      });

      return response;
    } catch (error) {
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }


  /**
   * Deletes a job.
   * @param slug The slug of the job to delete.
   */
  async function deleteJob(slug: string) {
    isLoading.value = true;
    try {
      await $apiClient(`/jobs/${slug}/`, {
        method: "DELETE",
      });
      // Remove the job from the local state
      jobs.value = jobs.value.filter((job) => job.slug !== slug);
      totalJobsCount.value--;
      if (currentJob.value && currentJob.value.slug === slug) {
        currentJob.value = null;
      }
      appStore.showSnackBar({
        type: "success",
        message: "Job deleted successfully!",
      });
    } catch (error: any) {
      console.error(`Failed to delete job with slug ${slug}:`, error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to delete job.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches applications for a specific job.
   * @param jobSlug The slug of the job.
   */
  async function fetchJobApplications(jobSlug: string) {
    isLoading.value = true;
    try {
      const response = await $apiClient<
        PaginatedResponse<{ responses: IJobApplication[] }>
      >(`/jobs/${jobSlug}/aplications/`, {
        method: "GET",
      });
      const job = response.results.job;
      applications.value = response.results.responses.map(
        (response: IJobApplication) => ({
          ...response,
          job_slug: job.slug,
          job_title: job.title,
          payment_verified: job.payment_verified,
        })
      );
      return response.results;
    } catch (error: any) {
      console.error(`Failed to fetch applications for job ${jobSlug}:`, error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load job applications.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Accepts a specific job application.
   * @param jobSlug The slug of the job.
   * @param applicationId The ID of the application to accept.
   */
  async function acceptApplication(jobSlug: string, applicationId: string) {
    isLoading.value = true;
    try {
      const response = await $apiClient(
        `/jobs/${jobSlug}/accept/${applicationId}/`,
        {
          method: "POST",
        }
      );
      appStore.showSnackBar({
        type: "success",
        message: "Application accepted!",
      });
      return response;
    } catch (error: any) {
      console.error(
        `Failed to accept application ${applicationId} for job ${jobSlug}:`,
        error
      );
      appStore.showSnackBar({
        type: "error",
        message: "Failed to accept application.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Rejects a specific job application.
   * @param jobSlug The slug of the job.
   * @param applicationId The ID of the application to reject.
   */
  async function rejectApplication(jobSlug: string, username: string) {
    isLoading.value = true;
    try {
      const response = await $apiClient(
        `/jobs/${jobSlug}/reject/${username}/`,
        { method: "POST" }
      );

      // Remove freelancer from store state
      if (currentJob.value) {
        currentJob.value.selected_freelancers =
          currentJob.value.selected_freelancers.filter(
            (f: any) => f.username !== username
          );
      }

      appStore.showSnackBar({
        type: "success",
        message: "Freelancer removed from job",
      });

      return response;
    } catch (error) {
      appStore.showSnackBar({
        type: "error",
        message: "Failed to remove freelancer",
      });
      throw error;
    } finally {
      isLoading.value = false;
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
    jobs,
    currentJob,
    applications,
    isLoading,
    hasJobs,
    hasCurrentJob,
    hasApplications,
    totalJobsCount,
    dashboardMetrics,
    createJob,
    fetchClientJobs,
    fetchJobDetails,
    markJobAsCompleted,
    updateJob,
    deleteJob,
    fetchJobApplications,
    acceptApplication,
    rejectApplication,
    fetchDashboardMetrics,
  };
});

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    success: boolean;
    message: string;
    client: any;
    job_count: number;
    jobs: T[];
  };
}
