<template>
  <v-sheet id="contact-us" color="#064263">
    <div class="pa-5">
      <p class="text-h4 text-center mt-10">Reach Out To Us</p>

      <v-row class="mt-10" justify="center">
        <v-col cols="12" md="5">
          <v-card style="background-color: #527e91" rounded="lg" theme="dark">
            <template #text>
              <form @submit.prevent="submit">

                <v-text-field
                  v-model="form.name"
                  label="Full Name"
                  variant="filled"
                  class="rounded"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
                />

                <v-text-field
                  v-model="form.phone"
                  label="Phone Number"
                  variant="filled"
                  class="rounded mt-5"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
                />

                <v-text-field
                  v-model="form.email"
                  label="Email Address"
                  variant="filled"
                  class="rounded mt-5"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
                />

                <v-select
                  v-model="form.subject"
                  :items="reasonOptions"
                  label="Reason for Contact"
                  variant="filled"
                  class="rounded mt-5"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
                />

                <v-textarea
                  v-model="form.message"
                  label="Message"
                  variant="filled"
                  class="rounded mt-5"
                  color="white"
                  hide-details="auto"
                  style="background-color:#064263"
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
<v-snackbar
  v-model="successSnackbar"
  color="green"
  timeout="6000"
  location="bottom"
  multi-line
  class="text-center"
>
  Message sent successfully! Please check your email for our response, including your spam folder.
</v-snackbar>
  </v-sheet>
</template>

<script setup lang="ts">
import { reactive,ref } from "vue";
import { useContactStore } from "~/store/contact";
import type { IContactFormPayload } from "~/types/freelancer";


const contactStore = useContactStore();
const successSnackbar = ref(false);

const reasonOptions = [
  "General Inquiry",
  "Support",
  "Business Inquiry",
  "Feedback",
  "Technical Issue",
  "Billing Issue",
  "Partnership Request",
  "Account Support",
  "Feature Request",
  "Report a Bug",
  "Other"
];

const form = reactive<IContactFormPayload>({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  contact_type: "general",
});

async function submit() {
  try {
    form.contact_type = "general"; 
    await contactStore.submitContactForm(form);
    successSnackbar.value = true;

    // Clear form
    form.name = "";
    form.email = "";
    form.phone = "";
    form.subject = "";
    form.message = "";

  } catch (error) {
    console.error(error);
  }
}
</script>