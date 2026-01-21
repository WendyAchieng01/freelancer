import type {
  IFreelancerWalletSummary,
  IFreelancerWalletTransaction,
} from "~/types/freelancer.d";
import { useAppStore } from "~/store/app";

export const useFreelancerWalletStore = defineStore("freelancerWallet", () => {
  // State
  const walletSummary = ref<IFreelancerWalletSummary | null>(null);
  const transactions = ref<IFreelancerWalletTransaction[]>([]);
  const isLoading = ref<boolean>(false);
  const totalTransactionsCount = ref<number>(0);

  // Getters
  const hasWalletSummary = computed(() => !!walletSummary.value);
  const hasTransactions = computed(() => transactions.value.length > 0);

  const { $apiClient } = useNuxtApp();
  const appStore = useAppStore();

  const pendingPayout = computed(() => {
    return transactions.value
      .filter(
        (t) =>
          t.transaction_type === "job_picked" &&
          t.status === "in_progress"
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });

  const totalEarnings = computed(() => {
    return transactions.value
      .filter(
        (t) =>
          t.transaction_type === "payment_received" &&
          t.status === "completed"
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });

  // Actions

  /**
   * Fetches the authenticated freelancer's wallet summary.
   */
  async function fetchWalletSummary() {
    isLoading.value = true;
    try {
      const response = await $apiClient<IFreelancerWalletSummary>(
        "/wallet/summary/",
        {
          method: "GET",
        }
      );
      walletSummary.value = response;
      return response;
    } catch (error: any) {
      console.error("Failed to fetch freelancer wallet summary:", error);
      appStore.showSnackBar({
        type: "error",
        message: "Failed to load wallet summary.",
      });
      return Promise.reject(error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches a paginated list of the authenticated freelancer's wallet transactions.
   * @param params Optional query parameters for filtering/pagination.
   */
  async function fetchTransactions(params?: { page?: number }) {
    isLoading.value = true;

    try {
      const response = await $apiClient<
        PaginatedResponse<IFreelancerWalletTransaction>
      >("/wallet/transactions/", {
        method: "GET",
        query: params,
      });

      transactions.value = response.results.map((tx) => ({
        ...tx,

        /** Batch payout reference */
        batch_reference:
          tx.extra_data?.reference?.split(":")[0] ?? "—",

        /** Human readable type */
        display_type:
          tx.transaction_type === "payment_received"
            ? "Payout"
            : "Job In Progress",

        /** Normalize */
        amount_number: Number(tx.amount),
      }));

      totalTransactionsCount.value = response.count;
    } finally {
      isLoading.value = false;
    }
  }


  return {
    walletSummary,
    transactions,
    isLoading,
    totalTransactionsCount,
    hasWalletSummary,
    hasTransactions,
    fetchWalletSummary,
    fetchTransactions,
    pendingPayout,
    totalEarnings,
  };
});

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
