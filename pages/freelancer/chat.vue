<template>
  <v-row>
    <!-- LEFT: Chat List -->
    <v-col cols="12" md="4">
      <div class="border rounded-xl overflow-hidden" style="background:#f7f8fc;">
        <p class="text-center text-subtitle-1 mt-3 font-weight-medium">Messages</p>

        <v-text-field
          label="Search"
          prepend-inner-icon="mdi-magnify"
          density="comfortable"
          class="mx-3 mt-3 rounded-pill"
          variant="outlined"
        />

        <v-virtual-scroll :items="chatStore.chats" item-height="60" class="mt-2">
          <template #default="{ item: chat, index: n }">
            <v-list-item
              link
              rounded
              class="py-2 px-2 mx-2 mb-1 hover:bg-grey-lighten-4 rounded-lg transition-all"
              :active="chat.slug === selectedChat?.slug"
              @click="selectChat(chat.slug)"
            >
              <template #prepend>
                <v-badge dot location="bottom end" color="success" bordered>
                  <v-avatar :image="profileImage(chat.client, '')" size="40" />
                </v-badge>
              </template>

              <template #title>
                <p class="text-subtitle-2 font-weight-medium">{{ chat.client }}</p>
              </template>

              <template #subtitle>
                <p class="text-caption text-truncate">
                  {{ getLatestMessage(chat)?.content?.substring(0, 30) ?? "Click to start a conversation" }}
                </p>
              </template>

              <template #append>
                <div class="d-flex flex-column ga-1 text-right">
                  <p class="text-caption">{{ getLatestMessageTime(chat) }}</p>
                  <v-icon
                    v-if="[2, 3].includes(n)"
                    icon="mdi-circle-medium"
                    size="20"
                    color="primary"
                  />
                </div>
              </template>
            </v-list-item>
          </template>
        </v-virtual-scroll>

        <v-pagination
          v-model="page"
          :length="Math.ceil(chatStore.totalChatsCount / 10)"
          color="primary"
          class="my-3"
        />
      </div>
    </v-col>

    <!-- RIGHT: Active Chat -->
    <v-col cols="12" md="8">
      <div v-if="selectedChat" class="border rounded-xl overflow-hidden d-flex flex-column" style="background:#f4f5fb; height: 85vh;">
        <!-- Header -->
        <div class="d-flex align-center pa-3 bg-white border-b">
          <v-badge :model-value="selectedChat.active" dot location="bottom end" color="success" bordered>
            <v-avatar :image="profileImage(selectedChat.client, '')" size="45" />
          </v-badge>
          <div class="ml-3">
            <p class="text-subtitle-1 font-weight-medium">{{ selectedChat.client }}</p>
            <p v-if="selectedChat.active" class="text-caption text-success">Active now</p>
          </div>
        </div>

        <!-- Messages -->
        <v-infinite-scroll
          :items="selectedChat.messages"
          class="flex-grow-1 pa-4 overflow-y-auto"
          side="start"
          mode="manual"
        >
          <template v-for="message in selectedChat.messages" :key="message.id">
            <div
              class="d-flex mb-2"
              :class="{ 'justify-end': message.sender === selectedChat.freelancer }"
            >
              <div
                class="pa-2 px-3"
                :class="[
                  message.sender === selectedChat.freelancer
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
                <!-- Timestamp -->
                <div class="text-caption text-grey-lighten-1 mt-1" 
                style="font-size:10px; text-align: right;">
                  {{ moment(message.timestamp).format('LT') }}
                </div>
              </div>
            </div>
          </template>
        </v-infinite-scroll>

        <!-- Send Message -->
        <v-divider />
        <div class="d-flex align-center pa-3 bg-white">
          <v-textarea
            v-model="form.content"
            prepend-inner-icon="mdi-pen"
            placeholder="Type a message..."
            append-icon="mdi-paperclip"
            auto-grow
            rows="1"
            hide-details="auto"
            max-rows="2"
            class="flex-grow-1 mr-2 rounded-pill"
            @click:append="selectAttachFile"
            @keydown.enter.prevent="handleEnter"
            :disabled="chatStore.isLoading"
          />
          <v-btn
            icon="mdi-send"
            color="primary"
            class="rounded-circle"
            :loading="chatStore.isLoading"
            :disabled="chatStore.isLoading"
            @click="sendMessage"
          />
        </div>

        <!-- Attached Files -->
        <div v-if="form.attachments.length" class="d-flex flex-wrap pa-2">
          <v-chip
            v-for="(attachment, index) in form.attachments"
            :key="index"
            class="ma-1 rounded"
            size="small"
            color="primary"
            link
            closable
            @click:close="removeAttachedFile(index)"
          >
            <v-icon icon="mdi-attachment" class="mr-1" />
            {{ attachment.name.substring(0, 20) }}
          </v-chip>
        </div>

        <v-file-input
          ref="fileInput"
          v-model="form.attachments"
          class="d-none"
          multiple
        />
      </div>

      <!-- No Chat Selected -->
      <div
        v-else
        class="border rounded-xl h-100 d-flex align-center justify-center"
        style="background:#fafbff;"
      >
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

definePageMeta({ layout: "freelancer" });

const chatStore = useMessagesStore();
const page = ref(1);

onMounted(async () => await chatStore.fetchChats({ page: page.value }));
watch(page, async () => await chatStore.fetchChats({ page: page.value }));

const selectedChatSlug = ref<string>("");
const selectedChat = computed(() => {
  const index = chatStore.chats.findIndex(c => c.slug === selectedChatSlug.value);
  return index !== -1 ? chatStore.chats[index] : null;
});

function selectChat(slug: string) {
  selectedChatSlug.value = slug;
}

const { form, errors, setErrors, clearErrors, isDirty, reset } = useForm({
  content: "",
  attachments: [] as File[],
});

const attachmentInput = useTemplateRef("fileInput");
function selectAttachFile() { attachmentInput.value?.click(); }
function removeAttachedFile(i: number) { form.attachments.splice(i, 1); }

async function sendMessage() {
  if (!isDirty.value || !selectedChat.value || chatStore.isLoading) return;
  clearErrors();
  try {
    await chatStore.sendMessage(selectedChat.value.chat_uuid, toFormData(form as Record<string, any>));
    reset();
  } catch (e: any) {
    setErrors(e.response?._data);
  }
}

function handleEnter(event: KeyboardEvent) {
  // Shift + Enter adds newline
  if (event.shiftKey) return;

  event.preventDefault();
  sendMessage();
}

function getLatestMessageTime(chat: IChat) {
  const msg = getLatestMessage(chat);
  return msg ? moment(msg.timestamp).fromNow() : null;
}

function getLatestMessage(chat: IChat) {
  return chat.messages[chat.messages.length - 1];
}
</script>

<style scoped>
.rounded-bs {
  border-bottom-left-radius: 0 !important;
}
.rounded-be {
  border-bottom-right-radius: 0 !important;
}
.border-b {
  border-bottom: 1px solid #e3e6ef;
}
</style>
