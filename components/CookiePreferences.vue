<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title class="text-h6">Manage Cookie Preferences</v-card-title>
      <v-card-text>
        <p class="mb-4">
          Customize which types of cookies you allow. You can change these anytime.
        </p>

        <v-switch
          v-model="preferences.essential"
          label="Essential Cookies (required)"
          color="primary"
          disabled
        />
        <v-switch
          v-model="preferences.analytics"
          label="Analytics Cookies"
          color="primary"
        />
        <v-switch
          v-model="preferences.marketing"
          label="Marketing Cookies"
          color="primary"
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="savePreferences">Save Preferences</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const dialog = defineModel<boolean>()
const emit = defineEmits(['saved'])

const preferences = ref({
  essential: true,
  analytics: false,
  marketing: false,
})

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('cookiePreferences')
    if (saved) preferences.value = JSON.parse(saved)
  }
})

// Watch for changes (sync live if user toggles)
watch(preferences, (val) => {
  if (process.client) {
    localStorage.setItem('cookiePreferences', JSON.stringify(val))
  }
}, { deep: true })

function savePreferences() {
  localStorage.setItem('cookiePreferences', JSON.stringify(preferences.value))
  localStorage.setItem('cookieConsent', 'managed')
  emit('saved', preferences.value) // 🔥 Let parent know
  dialog.value = false
}
</script>
