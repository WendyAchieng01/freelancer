<template>
  <v-row class="chat">
    <!-- chat list -->
    <v-col cols="12" md="4">
      <div class="border">
        <div class="d-flex justify-space-between px-4">
          <p class="text-subtitle-1 mt-3 font-weight-medium">Messages</p>
        </div>

        <v-text-field
          label="Search"
          prepend-inner-icon="mdi-magnify"
          density="comfortable"
          variant="solo-filled"
          class="mx-3 mt-3 rounded-lg"
          flat
        />

        <div class="d-flex">
          <v-virtual-scroll
            :items="chatStore.chats"
            item-height="50"
            height="100%"
          >
            <template #default="{ item: chat }">
              <v-list-item
                link
                class="py-3 mx-0"
                :active="chat.slug === selectedChat?.slug"
                @click="selectChat(chat.slug)"
              >
                <template #title>
                  <p class="text-subtitle-2 font-weight-medium">
                    {{ chat.freelancer }}
                  </p>
                </template>
                <template #subtitle>
                  <p class="text-caption text-truncate">
                    {{
                      getLatestMessage(chat)?.content?.substring(0, 30) ??
                      "Click to start a conversation"
                    }}
                  </p>
                </template>
                <template #prepend>
                  <v-badge
                    :model-value="chat.active"
                    dot
                    location="bottom end"
                    color="success"
                    offset-x="2"
                    offset-y="4"
                    bordered
                  >
                    <v-avatar :image="profileImage(chat.freelancer, '')" />
                  </v-badge>
                </template>
                <template #append>
                  <p v-if="chat.messages?.length" class="text-caption">
                    {{ getLatestMessageTime(chat) }}
                  </p>
                </template>
              </v-list-item>
            </template>
          </v-virtual-scroll>
        </div>

        <v-pagination
          v-model="page"
          :length="Math.ceil(chatStore.totalChatsCount / 10)"
          color="primary"
        />
      </div>
    </v-col>

    <!-- active chat -->
    <v-col cols="12" md="8">
      <div v-if="selectedChat" class="border h-100 d-flex flex-column">
        <!-- chat header -->
        <div class="d-flex">
          <v-list-item class="my-2 py-2">
            <template #title>
              <p class="text-subtitle-2 font-weight-medium">
                {{ selectedChat.freelancer }}
              </p>
            </template>
            <template v-if="selectedChat.active" #subtitle>
              <p class="text-caption text-truncate">Active Now</p>
            </template>
            <template #prepend>
              <v-badge
                :model-value="selectedChat.active"
                dot
                location="bottom end"
                color="success"
                offset-x="2"
                offset-y="10"
                bordered
              >
                <v-avatar
                  :image="profileImage(selectedChat.freelancer, '')"
                  size="x-large"
                />
              </v-badge>
            </template>
          </v-list-item>
        </div>

        <v-divider />

        <!-- messages -->
        <v-infinite-scroll
          :items="selectedChat.messages"
          side="start"
          mode="manual"
          :height="$vuetify.display.xlAndUp ? 650 : 350"
          class="flex-grow-1 overflow-y-auto px-3"
        >
          <template #load-more>
            <div />
          </template>

          <template v-for="message in selectedChat.messages" :key="message.id">
            <div
              class="d-flex mb-2"
              :class="{ 'justify-end': message.sender === selectedChat.client }"
            >
              <div
                class="pa-2 px-3"
                :class="[
                  message.sender === selectedChat.client
                    ? 'bg-primary text-white rounded-xl rounded-be'
                    : 'bg-grey-lighten-3 text-black rounded-xl rounded-bs',
                ]"
                style="max-width: 70%; word-wrap: break-word; line-height: 1.3;"
              >
                <div>{{ message.content }}</div>

                <!-- Attachments -->
                <div v-if="message.attachments?.length" class="mt-1">
                  <v-chip
                    v-for="attachment in message.attachments"
                    :key="attachment.id"
                    class="mt-1 rounded"
                    size="small"
                    link
                    :href="attachment.file_url"
                    target="_blank"
                  >
                    <v-icon icon="mdi-attachment" class="mr-1" />
                    {{ attachment.filename }}
                  </v-chip>
                </div>

                <!-- timestamp -->
                <div
                  class="text-caption text-grey-lighten-1 mt-1"
                  style="font-size: 10px; text-align: right;"
                >
                  {{ moment(message.timestamp).format('LT') }}
                </div>
              </div>
            </div>
          </template>
        </v-infinite-scroll>

        <v-divider />

        <!-- send message -->
        <div class="ma-1">
          <v-textarea
            v-model="form.content"
            prepend-inner-icon="mdi-paperclip"
            placeholder="Type Something"
            append-inner-icon="mdi-send"
            variant="solo-filled"
            flat
            auto-grow
            rows="1"
            max-rows="2"
            hide-details="auto"
            :loading="chatStore.isLoading"
            :error-messages="errors.content || errors.attachments"
            :disabled="chatStore.isLoading"
            @click:prepend-inner="selectAttachFile"
            @click:append-inner="sendMessage"
            @keydown.enter.prevent="handleEnter"
          />

          <div v-if="form.attachments.length" class="d-flex mb-3">
            <v-chip
              v-for="(attachment, index) in form.attachments"
              :key="index"
              class="mt-2 rounded"
              size="small"
              color="primary"
              link
              closable
              @click:close="removeAttachedFile(index)"
            >
              <div class="d-flex">
                <v-icon icon="mdi-attachment" />
                <span class="ml-2">{{ attachment.name.substring(0, 20) }}</span>
              </div>
            </v-chip>
          </div>

          <v-file-input
            ref="fileInput"
            v-model="form.attachments"
            class="d-none"
            multiple
          />
        </div>
      </div>

      <!-- no chat selected -->
      <div v-else class="border h-100 d-flex align-center justify-center">
        <v-empty-state
          title="No Chat Selected"
          text="Please select a chat to view messages."
          icon="mdi-message-off-outline"
          color="primary"
          size="70"
        />
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import moment from "moment";
import { useMessagesStore } from "~/store/common/messages";
import type { IChat } from "~/types/common";

definePageMeta({
  layout: "client",
});

const chatStore = useMessagesStore();
const page = ref(1);
const route = useRoute();
const freelancerUsername = route.query?.freelancer;

onMounted(async () => {
  await chatStore.fetchChats({ page: page.value }).then((chats) => {
    if (freelancerUsername) {
      const freelancerChat = chats.find((chat) => chat.freelancer == freelancerUsername);
      if (freelancerChat) selectedChatSlug.value = freelancerChat.slug;
    }
  });
});

watch(page, async () => await chatStore.fetchChats({ page: page.value }));

const selectedChatSlug = ref<string>("");
const selectedChat = computed(() => {
  const selectedChatIndex = chatStore.chats.findIndex(
    (chat) => chat.slug === selectedChatSlug.value
  );
  return selectedChatIndex !== -1 ? chatStore.chats[selectedChatIndex] : null;
});

function selectChat(slug: string) {
  selectedChatSlug.value = slug;
}

// send message
const { form, errors, setErrors, clearErrors, isDirty, reset } = useForm({
  content: "",
  attachments: [] as File[],
});

// file attachment
const attachmentInput = useTemplateRef("fileInput");
function selectAttachFile() {
  attachmentInput.value?.click();
}
function removeAttachedFile(index: number) {
  form.attachments.splice(index, 1);
}

async function sendMessage() {
  if (!isDirty.value || chatStore.isLoading) return;
  clearErrors();
  try {
    if (!selectedChat.value) throw new Error("No chat selected");
    await chatStore.sendMessage(
      selectedChat.value?.chat_uuid,
      toFormData(form as Record<string, any>)
    );
    reset();
    clearErrors();
  } catch (errors: any) {
    setErrors(errors.response?._data);
  }
}

// handle Enter press
function handleEnter(event: KeyboardEvent) {
  // Shift + Enter → new line
  if (event.shiftKey) return;

  // Prevent new line
  event.preventDefault();

  // Send message
  sendMessage();
}

function getLatestMessageTime(chat: IChat) {
  const latestMessage = getLatestMessage(chat);
  return latestMessage ? moment(latestMessage.timestamp).fromNow() : null;
}

function getLatestMessage(chat: IChat) {
  return chat.messages[chat.messages.length - 1];
}
</script>

<style scoped>
.bg-grey-lighten-3 {
  background-color: #f1f1f1 !important;
}
</style>
