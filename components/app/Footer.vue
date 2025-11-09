<template>
  <v-footer app>
    <v-container fluid>
      <v-row class="mt-0 py-1">
        <!-- logo and socials -->
        <v-col cols="12" md="3">
          <v-img src="/logo.png" height="100" width="100" />
          <!-- <p class="text-subtitle-1 mt-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit
          </p> -->
          <div class="d-flex">
            <v-btn variant="text" icon="mdi-facebook" />
            <!-- <v-btn variant="text" icon="mdi-twitter" />
            <v-btn variant="text" icon="mdi-instagram" />
            <v-btn variant="text" icon="mdi-linkedin" />
            <v-btn variant="text" icon="mdi-youtube" /> -->
          </div>
        </v-col>

        <!-- company -->
        <v-col cols="12" md="3">
          <p class="text-h6 font-weight-medium">Company</p>

          <NuxtLink to="/about-us" class="text-decoration-none">
            <p class="text-subtitle-1 mt-7">About</p>
          </NuxtLink>
          <NuxtLink to="/contact-us" class="text-decoration-none">
            <p class="text-subtitle-1 mt-2">Contact us</p>
          </NuxtLink>
        </v-col>

        <!-- careers -->
        <v-col cols="12" md="3">
          <p class="text-h6 font-weight-medium">Careers</p>

          <p class="text-subtitle-1 mt-7">
            <NuxtLink :href="profilePageLink" class="text-decoration-none">
              My Profile
            </NuxtLink>
          </p>
          <p class="text-subtitle-1 mt-2">
            <NuxtLink :href="jobsPageLink" class="text-decoration-none">
              Available Jobs
            </NuxtLink>
          </p>
          <p class="text-subtitle-1 mt-2">
            <NuxtLink
              href="/frequently-asked-questions"
              class="text-decoration-none"
            >
              FAQ
            </NuxtLink>
          </p>
        </v-col>

        <!-- contact us -->
        <v-col cols="12" md="3">
          <p class="text-h6 font-weight-medium">Careers</p>

          <p class="text-subtitle-1 mt-7">
            <v-icon icon="mdi-email-outline" />
            <a class="text-decoration-none" href="mailto:contact@company.com">
              contact@nilltechsolutions.com
            </a>
          </p>
          <p class="text-subtitle-1 mt-2">
            <v-icon icon="mdi-phone-outline" />
            <a class="text-decoration-none" href="tel:(254) 725-830334">
              (254) 725-830334
            </a>
          </p>
          <p class="text-subtitle-1 mt-2">
            <v-icon icon="mdi-map-marker-outline" />
            <a
              class="text-decoration-none"
              href="https://maps.app.goo.gl/TNHLuePRDmLGEw4eA"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ruai, Nairobi, Kenya
            </a>
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-divider class="mt-0" />
        <div class="d-flex justify-space-between w-100 mt-3">
          <p class="text-subtitle-1">
            Copyright &copy; {{ new Date().getFullYear() }} Nilltech Solutions
          </p>
          <p class="text-subtitle-1">
            All Rights Reserved |
            <NuxtLink href="#">Terms and Conditions</NuxtLink> |
            <NuxtLink href="#">Privacy Policy</NuxtLink>
          </p>
        </div>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/store/auth";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const profilePageLink = computed(() => {
  if (user.value) {
    if (user.value.user_type === "freelancer") return "/freelancer/portfolio";
    else if (user.value.user_type === "client") return "client/profile";
  }
  return "/auth/login";
});
const jobsPageLink = computed(() => {
  if (user.value) {
    if (user.value.user_type === "freelancer") return "/freelancer/browse-jobs";
    else if (user.value.user_type === "client") return "client/my-jobs";
  }
  return "/auth/login";
});
</script>
<style scoped>
.v-footer {
  margin: 0 !important;
  padding: 0 !important;
}

</style>
