<template>
  <v-layout>
    <v-main>
      <v-container fluid class="fill-height pa-0 ma-0">
        <v-row class="fill-height" no-gutters>
          <v-col
            v-if="!$vuetify.display.mobile"
            cols="5"
            class="background-container d-flex flex-column justify-center align-center pa-4"
          >
            <div class="gradient-circle" />

            <div>
              <v-carousel
                hide-delimiter-background
                continuous
                :show-arrows="false"
                height="300"
                class="carousel-component"
                cycle
                interval="5000"
              >
                <v-carousel-item
                  v-for="({ title, text }, index) in slides"
                  :key="index"
                >
                  <v-col cols="12" md="10" class="mx-auto">
                    <v-card :text rounded="lg" class="pa-5">
                      <template #title>
                        <h1
                          class="text-h5 text-center font-weight-bold text-primary"
                        >
                          {{ title }}
                        </h1>
                      </template>
                      <template #text>
                        <p class="text-subtitle-1 font-weight-light">
                          {{ text }}
                        </p>
                      </template>
                    </v-card>
                  </v-col>
                </v-carousel-item>
              </v-carousel>
            </div>
          </v-col>

          <v-col>
            <v-row justify="center" class="h-screen pa-4">
              <v-col cols="12" md="9" align-self="center">
                <div class="d-flex flex-column justify-center align-center">
                  <div class="w-100">
                    <v-img src="/public/logo.png" height="100" width="100" />

                    <!-- auth page content -->
                    <div class="mt-7">
                      <slot />
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
const slides = [
  {
    title: "Reach financial goals faster",
    text: "As a freelancer, finding the right gigs can be challenging, but NillTech solutions made it simple. I love the personalized job recommendations and the ability to showcase my portfolio",
  },
  {
    title: "Get paid on time, every time",
    text: "NillTech solutions has transformed the way I manage my finances. The invoicing feature is a game-changer, and I no longer worry about late payments.",
  },
  {
    title: "Stay organized and focused",
    text: "As a freelancer, staying organized is crucial. NillTech solutions helps me keep track of my projects, deadlines, and finances all in one place.",
  },
];

onMounted(() => {
  if (!document.getElementById("google-client-script")) {
    const script = document.createElement("script");
    script.id = "google-client-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
});

</script>




<style scoped>
/* Ensure parent elements allow full height */
.v-main,
.v-layout,
#__nuxt {
  min-height: 100vh;
}

.background-container {
  background-color: rgba(88, 83, 224, 0.96);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.gradient-circle {
  position: absolute;
  z-index: 0;
  aspect-ratio: 1 / 1;
  width: 250%;
  height: 160%;
  top: -64%;
  left: -187%;

  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border-radius: 50%;
  transform: rotate(10deg);
  opacity: 0.15;

  /* Gradient goes from opaque (top) to transparent (bottom) */
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 0) 70%
  );
  /* Vendor prefix for wider browser support */
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 0) 70%
  );
}
</style>
