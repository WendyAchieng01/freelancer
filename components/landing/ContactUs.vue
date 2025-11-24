<template>
  <v-sheet id="contact-us" color="#064263">
    <div class="pa-5">
      <p class="text-h4 text-center mt-10">Reach Out To Us</p>

      <v-row class="mt-10" justify="center">
        <v-col cols="12" md="5">
          <v-card style="background-color: #527e91" rounded="lg" theme="dark">
            <template #text>
              <form :action="backendRoute" method="POST" @submit.prevent="handleSubmit">

                <v-text-field
                  v-model="form.name"
                  label="Full Name"
                  variant="filled"
                  class="rounded"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
                  name="name"
                />

                <v-text-field
                  v-model="form.phone"
                  label="Phone Number"
                  variant="filled"
                  class="rounded mt-5"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
                  name="phone"
                />

                <v-text-field
                  v-model="form.email"
                  label="Email Address"
                  variant="filled"
                  class="rounded mt-5"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
                  name="email"
                />

                <v-select
                  v-model="form.reason"
                  :items="reasonOptions"
                  label="Reason for Contact"
                  variant="filled"
                  class="rounded mt-5"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
                  name="reason"
                />

                <v-textarea
                  v-model="form.message"
                  label="Message"
                  variant="filled"
                  class="rounded mt-5"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
                  name="message"
                />

                <v-btn
                  type="submit"
                  text="Submit"
                  size="x-large"
                  variant="elevated"
                  class="text-subtitle-1 mt-5"
                  block
                />
              </form>
            </template>
          </v-card>
        </v-col>

        <v-col cols="12" md="5">
          <v-img
            src="/images/contact_us.jpg"
            height="480"
            cover
            class="rounded-lg"
          />
        </v-col>
      </v-row>
    </div>

    <!-- SUCCESS SNACKBAR -->
    <v-snackbar
      v-model="successSnackbar"
      color="green"
      timeout="3000"
      location="bottom"
    >
      Message sent successfully!
    </v-snackbar>
  </v-sheet>
</template>

<script>
export default {
  data() {
    return {
      backendRoute: "/contact/submit/",

      form: {
        name: "",
        email: "",
        phone: "",
        message: "",
        reason: ""
      },

      reasonOptions: [
        "General Inquiry",
        "Technical Issue",
        "Billing Issue",
        "Partnership Request",
        "Account Support",
        "Feature Request",
        "Report a Bug",
        "Other"
      ],

      successSnackbar: false,
    };
  },

  methods: {
    handleSubmit() {
      // simulate success — replace with real backend call when ready
      this.successSnackbar = true;

      // clear form after submit
      this.form = {
        name: "",
        email: "",
        phone: "",
        message: "",
        reason: "",
      };
    }
  }
};
</script>
