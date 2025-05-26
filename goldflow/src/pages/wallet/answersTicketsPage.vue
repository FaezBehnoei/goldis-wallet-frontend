<template>
  <q-page class="q-py-lg q-px-md bg-grey-1">
    <div class="ticket-container">
      <!-- Title with animation -->
      <div class="title-container q-mb-lg">
        <h3 class="text-center text-primary q-mb-none">تیکت ها</h3>
        <div class="title-underline"></div>
      </div>

      <q-card class="chat-card">
        <!-- Ticket info header -->
        <q-card-section class="chat-header flex justify-between">
          <div class="ticket-info">
            <div class="ticket-id">
              <q-badge color="secondary" class="q-mr-md">
                شماره تیکت: {{ ticketId }}
              </q-badge>
            </div>
            <div class="ticket-subject q-mt-sm">{{ ticketSubject }}</div>
          </div>
          <div>
            <q-btn flat round icon="more_horiz">
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="closeTicket">
                  <q-item-section>بستن تیکت</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="downloadChat">
                  <q-item-section>دانلود گفتگو</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          </div>

        </q-card-section>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="typing-indicator q-px-md q-pb-sm">
          <span>اپراتور در حال تایپ کردن است</span>
          <div class="typing-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>

        <!-- Chat messages -->
        <q-card-section>
          <div class="chat-messages" ref="chatContainer">
            <div v-if="isLoading" class="text-center q-py-md">
              <q-spinner color="primary" size="2em" />
              <div class="q-mt-sm text-grey">در حال بارگذاری پیام ها...</div>
            </div>

            <div v-else-if="messages.length === 0" class="empty-chat">
              <q-icon name="chat" size="4rem" color="grey-5" />
              <div class="text-grey q-mt-sm">هنوز پیامی ارسال نشده است</div>
            </div>

            <template v-else>
              <div v-for="(message, index) in messages" :key="index" class="message" :class="{'sent': message.sent, 'received': !message.sent}">
                <div class="message-avatar" v-if="!message.sent">
                  <span class="operator-name">{{ message.sender || 'اپراتور' }}</span>
                </div>
                <div class="message-content">
                  <div class="message-bubble">
                    <div v-html="formatMessage(message.text)"></div>
                    <div v-if="message.attachments && message.attachments.length" class="attachment-section">
                      <div v-for="(attachment, i) in message.attachments" :key="i" class="attachment-item">
                        <q-icon name="attachment" size="sm" />
                        <a :href="attachment.url" target="_blank">{{ attachment.name }}</a>
                      </div>
                    </div>
                  </div>
                  <div class="message-meta">
                    <span class="message-time">{{ message.time }}</span>
                    <q-icon v-if="message.sent" :name="message.delivered ? 'done_all' : 'done'" size="xs" :color="message.read ? 'blue' : 'grey'" class="q-mr-xs" />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </q-card-section>

        <!-- New message date divider -->
        <div class="date-divider">
          <span>امروز</span>
        </div>

        <!-- Input section -->
        <q-card-section class="chat-input-section">
          <div class="attachment-preview" v-if="attachments.length">
            <div v-for="(file, i) in attachments" :key="i" class="attachment-item">
              <span>{{ file.name }}</span>
              <q-btn flat round dense icon="close" size="xs" @click="removeAttachment(i)" />
            </div>
          </div>

          <div class="input-container">
            <q-btn flat round icon="attach_file" class="q-mr-sm">
              <q-uploader
                ref="uploader"
                :url="`/api/tickets/${ticketId}/attachments`"
                hide-upload-btn
                @added="onFileAdded"
                style="display: none"
              />
            </q-btn>

            <q-input
              v-model="newMessage"
              filled
              placeholder="متن پیام خود را بنویسید..."
              class="message-input"
              :rows="1"
              autogrow
              @keyup.enter="sendMessage"
            />

            <q-btn
              icon="send"
              color="primary"
              round
              class="send-btn q-ml-sm"
              @click="sendMessage()"
              :disable="isSending"
            >
             </q-btn>
          </div>
        </q-card-section>

        <!-- Bottom status section -->
        <q-card-section class="chat-status text-grey-7 text-caption">
          <div>
            <q-icon name="schedule" size="xs" class="q-mr-xs" />
            <span>زمان پاسخگویی معمول: 15 دقیقه</span>
          </div>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const ticketId = route.params.id;
const messages = ref([]);
const newMessage = ref('');
const chatContainer = ref(null);
const isLoading = ref(true);
const isSending = ref(false);
const isTyping = ref(false);
const attachments = ref([]);
const uploader = ref(null);
const typingTimer = ref(null);
const ticketSubject = ref('درخواست پشتیبانی فنی');

// Fetch all messages for this ticket
const fetchMessages = async () => {
  isLoading.value = true;
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock data with various message types
    messages.value = [
      {
        text: 'سلام، چطور می‌توانم به شما کمک کنم؟',
        sent: false,
        sender: 'پشتیبان فنی',
        time: '۱۰:۳۵',
        read: true,
        delivered: true
      },
      {
        text: 'سلام، من در پرداخت آنلاین مشکل دارم. هر بار که می‌خواهم پرداخت کنم، با خطا مواجه می‌شوم.',
        sent: true,
        time: '۱۰:۳۸',
        read: true,
        delivered: true
      },
      {
        text: 'می‌توانید لطفا خطایی که دریافت می‌کنید را برای من ارسال کنید؟',
        sent: false,
        sender: 'پشتیبان فنی',
        time: '۱۰:۴۰',
        read: true,
        delivered: true
      },
      {
        text: 'بله حتما، تصویر خطا را برای شما ارسال می‌کنم.',
        sent: true,
        time: '۱۰:۴۲',
        read: true,
        delivered: true
      },
      {
        text: 'اینم تصویر خطا:',
        sent: true,
        time: '۱۰:۴۳',
        read: true,
        delivered: true,
        attachments: [
          { name: 'error-screenshot.jpg', url: '#' }
        ]
      },
      {
        text: 'متشکرم. بر اساس تصویری که ارسال کردید، به نظر می‌رسد مشکل از تنظیمات مرورگر شماست. لطفاً مراحل زیر را دنبال کنید:\n\n1. کش مرورگر خود را پاک کنید\n2. کوکی‌ها را حذف کنید\n3. مجدداً وارد حساب کاربری خود شوید\n4. دوباره برای پرداخت اقدام کنید',
        sent: false,
        sender: 'پشتیبان فنی',
        time: '۱۰:۵۰',
        read: true,
        delivered: true
      }
    ];

    scrollToBottom();
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'خطا در بارگذاری پیام‌ها',
      icon: 'error'
    });
    console.error("Error fetching messages:", error);
  } finally {
    isLoading.value = false;
  }
};

// Send a new message
const sendMessage = async () => {
  if ((!newMessage.value.trim() && attachments.value.length === 0) || isSending.value) return;

  isSending.value = true;

  const message = {
    text: newMessage.value,
    sent: true,
    time: new Date().toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' }),
    delivered: false,
    read: false
  };

  if (attachments.value.length > 0) {
    message.attachments = attachments.value.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
  }

  messages.value.push(message);
  scrollToBottom();

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update message status to delivered
    message.delivered = true;

    // Clear message and attachments
    newMessage.value = '';
    attachments.value = [];

    // Simulate typing indicator
    showTypingIndicator();

    // Simulate operator response after typing
    setTimeout(() => {
      hideTypingIndicator();

      // Add operator response
      const response = {
        text: 'پیام شما دریافت شد. در حال بررسی درخواست شما هستیم و به زودی پاسخ می‌دهیم.',
        sent: false,
        sender: 'پشتیبان فنی',
        time: new Date().toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' }),
        read: true,
        delivered: true
      };

      messages.value.push(response);

      // Mark user message as read
      message.read = true;

      scrollToBottom();
    }, 3000);

  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'خطا در ارسال پیام',
      icon: 'error'
    });
    console.error("Error sending message:", error);
  } finally {
    isSending.value = false;
  }
};

// Format message text to support line breaks and links
const formatMessage = (text) => {
  if (!text) return '';

  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let formattedText = text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

  // Convert line breaks to <br>
  formattedText = formattedText.replace(/\n/g, '<br>');

  return formattedText;
};

// Show typing indicator
const showTypingIndicator = () => {
  isTyping.value = true;

  // Clear any existing timer
  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
  }

  // Set a max typing time
  typingTimer.value = setTimeout(() => {
    hideTypingIndicator();
  }, 10000);
};

// Hide typing indicator
const hideTypingIndicator = () => {
  isTyping.value = false;

  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
    typingTimer.value = null;
  }
};

// Handle file attachments
const onFileAdded = (files) => {
  attachments.value = [...attachments.value, ...files.map(f => f.file)];
};

// Remove attachment
const removeAttachment = (index) => {
  attachments.value.splice(index, 1);
};



// Close ticket
const closeTicket = () => {
  $q.dialog({
    title: 'بستن تیکت',
    message: 'آیا از بستن این تیکت اطمینان دارید؟',
    cancel: true,
    persistent: true
  }).onOk(() => {
    router.push('/dashboard/tickets')
  });
};



// Download chat
const downloadChat = () => {
  let chatText = `تیکت شماره: ${ticketId}\nموضوع: ${ticketSubject.value}\n\n`;

  messages.value.forEach(msg => {
    const sender = msg.sent ? 'شما' : (msg.sender || 'اپراتور');
    chatText += `[${msg.time}] ${sender}: ${msg.text}\n`;

    if (msg.attachments?.length) {
      chatText += `(${msg.attachments.length} فایل پیوست)\n`;
    }

    chatText += '\n';
  });

  // Create and download text file
  const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ticket-${ticketId}-chat.txt`;
  link.click();
};

// Scroll to bottom of chat container
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

// Clean up
onBeforeUnmount(() => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value);
  }
});

// Initialize
onMounted(() => {
  fetchMessages();
});
</script>

<style scoped>
.ticket-container {
  max-width: 800px;
  margin: 0 auto;
}

.title-container {
  text-align: center;
  padding: 16px 0;
  position: relative;
}

.title-underline {
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, var(--q-primary), var(--q-info));
  margin: 12px auto 0;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.title-underline::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(0); }
  100% { transform: translateX(200%); }
}

.chat-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chat-header {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 16px;
}

.ticket-info {
  display: flex;
  flex-direction: column;
}

.ticket-subject {
  font-weight: 500;
  color: var(--q-primary);
}

.chat-messages {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 8px;
  scroll-behavior: smooth;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #888;
}

.message {
  display: flex;
  margin-bottom: 16px;
  flex-direction: column;
}

.message.sent {
  align-items: flex-end;
}

.message.received {
  align-items: flex-start;
}

.message-avatar {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.operator-name {
  font-size: 12px;
  margin-left: 8px;
  color: #666;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: relative;
  word-break: break-word;
}

.message.sent .message-bubble {
  background: var(--q-primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.received .message-bubble {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-meta {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  color: #888;
  margin-right: 4px;
}

.attachment-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.message.sent .attachment-section {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.attachment-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-top: 4px;
}

.message.sent .attachment-item a {
  color: rgba(255, 255, 255, 0.9);
}

.date-divider {
  text-align: center;
  margin: 0 16px;
  position: relative;
}

.date-divider span {
  background: #f0f0f0;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
  position: relative;
  z-index: 1;
}

.date-divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: #e0e0e0;
  z-index: 0;
}

.chat-input-section {
  border-top: 1px solid #f0f0f0;
  padding: 12px 16px;
}

.input-container {
  display: flex;
  align-items: center;
}

.message-input {
  flex-grow: 1;
  border-radius: 24px;
}

.chat-status {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  font-size: 12px;
}

.attachment-preview {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
  gap: 8px;
}

.attachment-preview .attachment-item {
  background: #f0f0f0;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.typing-dots {
  display: flex;
  margin-left: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #888;
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.rating-container {
  display: flex;
  justify-content: center;
}


</style>
