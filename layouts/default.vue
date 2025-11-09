<template>
  <v-container fluid class="fill-height">
    <v-app>
      <v-responsive
        :max-width="xlAndUp ? 1300 : '100%'"
        :class="xlAndUp ? 'align-centerfill-height mx-auto w-100' : ''"
      >
        <v-layout>
          <AppHeader />

          <v-main>
            <v-container class="mt-15">
              <slot />
            </v-container>
          </v-main>

          <AppFooter />
        </v-layout>
      </v-responsive>
       <CookieConsent />
    </v-app>
  </v-container>
</template>
<script setup lang="ts">
const { xlAndUp } = useDisplay();
import CookieConsent from '@/components/app/CookieConsent.vue'
</script>
