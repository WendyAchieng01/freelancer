<template>
  <!-- 🍪 Cookie Banner -->
  <v-slide-y-transition>
    <div v-if="showBanner" class="nil_cookie fade-in">
      <div class="cookie-text">
        <h3 class="font-weight-medium mb-2">Your Cookies</h3>
        <p>
          We use cookies, including from our partners, to enhance and personalize your experience.
          Accept all cookies below, or select
          <strong class="text-primary cursor-pointer" @click="openManager">
            Manage Cookies
          </strong>
          to choose which cookies we can use. Reject all means you are rejecting all non-essential cookies.
          Please see our
          <NuxtLink to="/privacy-policy" class="font-weight-medium text-primary">
            Privacy Policy
          </NuxtLink>
          and
          <NuxtLink to="/terms" class="font-weight-medium text-primary">
            Terms & Conditions
          </NuxtLink>
          for more information.
        </p>
      </div>

      <div class="cookie-actions">
        <v-btn
          variant="outlined"
          color="primary"
          size="small"
          class="text-subtitle-2"
          @click="openManager"
        >
          Manage Cookies
        </v-btn>

        <v-btn
          color="error"
          variant="flat"
          size="small"
          class="text-subtitle-2"
          @click="rejectAll"
        >
          Reject all cookies
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          size="small"
          class="text-subtitle-2"
          @click="acceptAll"
        >
          Accept all cookies
        </v-btn>
      </div>
    </div>
  </v-slide-y-transition>

  <!-- ⚙️ Manage Cookies Modal -->
  <v-dialog v-model="showManager" max-width="600" persistent>
    <v-card>
      <v-card-title class="text-h6">Manage Cookie Preferences</v-card-title>

      <v-card-text>
        <p class="mb-4">
          Choose which types of cookies you allow. You can change these anytime.
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
        <v-btn variant="text" @click="cancelManager">Cancel</v-btn>
        <v-btn color="primary" @click="savePreferences">Save Preferences</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const showBanner = ref(false)
const showManager = ref(false)

// ✅ Shared cookie preference state
const preferences = ref({
  essential: true,
  analytics: false,
  marketing: false,
})

// 🧠 Load from localStorage on mount
onMounted(() => {
  if (process.client) {
    const consent = localStorage.getItem('cookieConsent')
    const savedPrefs = localStorage.getItem('cookiePreferences')

    if (savedPrefs) preferences.value = JSON.parse(savedPrefs)
    showBanner.value = !consent
  }
})

// 🔁 Always keep localStorage synced when preferences change
watch(
  preferences,
  (val) => {
    if (process.client) {
      localStorage.setItem('cookiePreferences', JSON.stringify(val))
    }
  },
  { deep: true }
)

// 🪟 Open/cancel modal
function openManager() {
  showManager.value = true
}
function cancelManager() {
  showManager.value = false
}

// ✅ Accept all cookies
function acceptAll() {
  preferences.value = { essential: true, analytics: true, marketing: true }
  localStorage.setItem('cookiePreferences', JSON.stringify(preferences.value))
  localStorage.setItem('cookieConsent', 'accepted')
  showBanner.value = false
  showManager.value = false
}

// 🚫 Reject all cookies
function rejectAll() {
  preferences.value = { essential: true, analytics: false, marketing: false }
  localStorage.setItem('cookiePreferences', JSON.stringify(preferences.value))
  localStorage.setItem('cookieConsent', 'rejected')
  showBanner.value = false
  showManager.value = false
}

// 💾 Save preferences from manager
function savePreferences() {
  localStorage.setItem('cookiePreferences', JSON.stringify(preferences.value))
  localStorage.setItem('cookieConsent', 'managed')
  showBanner.value = false
  showManager.value = false
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nil_cookie {
  background: white;
  border-radius: 20px;
  padding: 24px;
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  width: 90%;
  max-width: 750px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #333;
  backdrop-filter: blur(6px);
}

.cookie-text {
  font-size: 0.95rem;
  line-height: 1.6;
}

.cookie-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
}

.cursor-pointer {
  cursor: pointer;
}

@media (max-width: 600px) {
  .nil_cookie {
    bottom: 20px;
    padding: 18px;
    max-width: 95%;
  }

  .cookie-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
