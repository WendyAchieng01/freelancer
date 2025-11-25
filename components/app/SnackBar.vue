<template>
  <v-snackbar
    location="top right"
    multi-line
    v-model="snackBarData.visible"
    :color="snackBarData.type"
  >
    <v-list-item
      :subtitle="snackBarData.message"
      :prepend-icon="snackBarIcon"
    />
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppStore } from "~/store/app";

const { snackBarData } = useAppStore();

// Removed truncation, message now shows fully
// (function deleted completely)

const snackBarIcon = computed(() => {
  switch (snackBarData.type) {
    case "success":
      return "mdi-check-circle-outline";
    case "error":
      return "mdi-close-circle-outline";
    case "warning":
      return "mdi-alert-circle-outline";
    case "info":
      return "mdi-information-variant";
    default:
      return "mdi-information-variant";
  }
});
</script>
