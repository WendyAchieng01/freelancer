<template>
  <v-data-table-server
    :headers="headers"
    :items="transactions"
    :items-length="count"
    class="my-custom-table elevation-1"
    item-height="72"
    @update:page="(newPage) => (page = newPage)"
  >
    <!-- Job + Period -->
    <template #item.job_title="{ item }">
      <div>
        <p class="job-title">{{ item.job_title || "—" }}</p>
        <p class="job-period">{{ item.payment_period || "—" }}</p>
      </div>
    </template>

    <!-- Amount -->
    <template #item.amount="{ item }">
      <span class="amount-text">
        KES {{ formatAmount(item.amount) }}
      </span>
    </template>

    <!-- Batch + Transfer -->
    <template #item.batch_reference="{ item }">
      <div>
        <code class="batch-ref" :title="fullBatchRef(item)">
          {{ truncateBatchRef(item) }}
        </code>
        <p class="transfer-code">
          {{ item.extra_data?.transfer_code || "—" }}
        </p>
      </div>
    </template>

    <!-- Status -->
    <template #item.status="{ item }">
      <v-chip
        size="small"
        :color="statusColor(item.status)"
        class="text-capitalize"
      >
        {{ item.status.replace("_", " ") }}
      </v-chip>
    </template>

    <!-- Date -->
    <template #item.timestamp="{ item }">
      {{ moment(item.timestamp).format("DD MMM YYYY") }}
    </template>

    <!-- Download -->
    <template #item.actions="{ item }">
      <v-tooltip text="Download payout receipt">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-download"
            variant="text"
            size="small"
            :disabled="item.status !== 'completed'"
            @click.stop="downloadReceipt(item)"
          />
        </template>
      </v-tooltip>
    </template>
  </v-data-table-server>
</template>




<script setup lang="ts">
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { IFreelancerWalletTransaction } from "~/types/freelancer";
import { useFreelancerProfileStore } from "~/store/freelancer/profile";

defineProps<{
  transactions: IFreelancerWalletTransaction[];
  count: number;
}>();

const page = defineModel<number>("page", { default: 1 });

const headers = [
  { title: "Job", value: "job_title" },
  { title: "Amount (KES)", value: "amount" },
  { title: "Batch / Transfer", value: "batch_reference" },
  { title: "Status", value: "status" },
  { title: "Date", value: "timestamp" },
  { title: "", value: "actions", sortable: false },
];

function formatAmount(value: string) {
  return Number(value).toLocaleString("en-KE", { minimumFractionDigits: 2 });
}

function truncateBatchRef(item: IFreelancerWalletTransaction) {
  const ref = item.extra_data?.reference?.split(":")[0];
  return ref ? `${ref.slice(0, 12)}…` : "—";
}

function fullBatchRef(item: IFreelancerWalletTransaction) {
  return item.extra_data?.reference?.split(":")[0] || "";
}

function statusColor(status: string) {
  if (status === "completed") return "success";
  if (status === "in_progress") return "warning";
  return "error";
}



const profileStore = useFreelancerProfileStore();

function downloadReceipt(item: IFreelancerWalletTransaction) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const freelancerName = profileStore.profile?.full_name || "—";
  const freelancerEmail = profileStore.profile?.profile.user.email || "—";

  /* COMPANY HEADER  */
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("NILLTECH SOLUTIONS", pageWidth / 2, y, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.text("info@nilltechsolutions.com", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.text("+254 725 830334", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.text("Ruai, Nairobi, Kenya", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.line(14, y, pageWidth - 14, y);

  /* TITLE */
  y += 12;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PAYOUT RECEIPT", pageWidth / 2, y, { align: "center" });

  y += 10;

  /* FREELANCER DETAILS */
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Freelancer Details", 14, y);

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45 },
      1: { cellWidth: "auto" },
    },
    body: [
      ["Name", freelancerName],
      ["Email", freelancerEmail],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  /*  PAYMENT DETAILS */
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", 14, y);

  y += 4;
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: 20,
      fontStyle: "bold",
    },
    body: [
      ["Job Title", item.job_title || "—"],
      ["Payment Period", item.payment_period || "—"],
      ["Amount Paid", `KES ${formatAmount(item.amount)}`],
      ["Status", item.status.replace("_", " ")],
      ["Batch Reference", fullBatchRef(item)],
      ["Transfer Code", item.extra_data?.transfer_code || "—"],
      ["Payment Date", moment(item.timestamp).format("DD MMM YYYY, HH:mm")],
    ],
  });

  /* FOOTER */
  const footerY = doc.internal.pageSize.height - 18;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This document serves as an official confirmation of payment.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "Generated electronically. No signature required.",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  doc.save(`payout-${truncateBatchRef(item).replace("…", "")}.pdf`);
}

</script>




<style scoped>
.my-custom-table :deep(thead th) {
  background-color: #f7f7f7 !important;
  font-size: 0.9rem;
}

/* Increase row height feel */
.my-custom-table :deep(td) {
  padding-top: 14px !important;
  padding-bottom: 14px !important;
  font-size: 0.95rem;
}

/* Job column */
.job-title {
  font-size: 0.95rem;
  font-weight: 500;
}

.job-period {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

/* Amount */
.amount-text {
  font-size: 1rem;
  font-weight: 600;
}

/* Batch / transfer */
.batch-ref {
  font-size: 0.85rem;
}

.transfer-code {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.55);
  margin-top: 2px;
}

/* Date */
.date-text {
  font-size: 0.85rem;
}
</style>

