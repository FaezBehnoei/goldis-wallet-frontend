<template>
  <q-page class="q-py-lg q-px-md bg-grey-1">
    <div class="ticket-container">
      <!-- Title -->
      <div class="title-container q-mb-lg">
        <h3 class="text-center text-primary q-mb-none">تیکت ها</h3>
        <div class="title-underline"></div>
      </div>

      <!-- Ticket Status Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-sm-6 col-md-3" v-for="(status, index) in ticketStatuses" :key="index">
          <q-card class="status-card" :class="status.bgClass" flat>
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col-auto">
                  <q-icon :name="status.icon" size="28px" :color="status.iconColor" />
                </div>
                <div class="col q-ml-md">
                  <div class="text-subtitle1 text-weight-bold">{{ status.label }}</div>
                  <div class="text-h5 text-weight-medium q-mt-sm">{{ status.count }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Ticket Management Section -->
      <div class="row q-col-gutter-lg">
        <!-- Ticket Submission Form -->
        <div class="col-12 col-md-8">
          <q-card class="form-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-md">ارسال تیکت جدید</div>

              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="ticketSubject"
                    label="موضوع تیکت"
                    outlined
                    dense
                    :rules="[val => !!val || 'موضوع الزامی است']"
                  />
                </div>
              </div>

              <q-input
                v-model="ticketMessage"
                label="متن پیام"
                outlined
                type="textarea"
                rows="6"
                :rules="[val => !!val || 'متن پیام الزامی است']"
              />

              <div class="row justify-end q-mt-md">
                <q-btn
                  label="ارسال تیکت"
                  color="primary"
                  :disable="!isFormValid"
                  @click="submitTicket"
                  class="submit-btn"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Ticket List -->
        <div class="col-12 col-md-4">
          <q-card class="list-card">
            <q-card-section class="q-pb-none">
              <div class="text-h6 text-weight-bold">لیست تیکت ها</div>
            </q-card-section>

            <q-separator class="q-my-md" />

            <q-card-section class="q-pa-none">
              <q-list separator>
                <q-item v-for="(ticket, index) in recentTickets" :key="index" clickable v-ripple class="ticket-item">
                  <q-item-section avatar>
                    <q-avatar :color="getStatusColor(ticket.status)" text-color="white">
                      {{ ticket.id }}
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ ticket.subject }}</q-item-label>
                    <q-item-label caption>
                      <span :class="`text-${getStatusColor(ticket.status)}`">{{ getStatusLabel(ticket.status) }}</span>
                      <span class="q-mx-xs">•</span>
                      <span>{{ ticket.date }}</span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                    dense
                    class="bg-info"
                    @click="viewTicket(ticket.id)"
                    ><q-icon name="arrow_back" color="grey-7" /></q-btn>
                  </q-item-section>
                </q-item>

                <q-item v-if="recentTickets.length === 0" class="text-center text-grey q-py-lg">
                  <q-item-section>هیچ تیکتی وجود ندارد</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-card-section class="text-center q-pt-none" v-if="recentTickets.length > 0">
              <q-btn flat color="primary" label="مشاهده همه" class="view-all-btn" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter()

const ticketSubject = ref('');
const ticketMessage = ref('');
const recentTickets = ref([
  { id: "1", subject: "مشکل در پرداخت", status: "pending", date: "۱۴۰۲/۰۶/۱۵" },
  { id: "2", subject: "درخواست بازپرداخت", status: "closed", date: "۱۴۰۲/۰۶/۱۰" },
  { id: "3", subject: "سوال درباره سرویس", status: "answered", date: "۱۴۰۲/۰۶/۰۸" },
]);

const statusCount = computed(() => {
  return {
    pending: recentTickets.value.filter(ticket => ticket.status === "pending").length,
    closed: recentTickets.value.filter(ticket => ticket.status === "closed").length,
    answered: recentTickets.value.filter(ticket => ticket.status === "answered").length,
    total: recentTickets.value.length
  };
});

const ticketStatuses = computed(() => [
  {
    label: "در انتظار بررسی",
    icon: "hourglass_empty",
    iconColor: "amber-9",
    bgClass: "pending-card",
    count: statusCount.value.pending
  },
  {
    label: "بسته شده",
    icon: "task_alt",
    iconColor: "red-9",
    bgClass: "closed-card",
    count: statusCount.value.closed
  },
  {
    label: "پاسخ داده شده",
    icon: "comment",
    iconColor: "green-9",
    bgClass: "answered-card",
    count: statusCount.value.answered
  },
  {
    label: "کل تیکت ها",
    icon: "inbox",
    iconColor: "blue-9",
    bgClass: "total-card",
    count: statusCount.value.total
  },
]);

const isFormValid = computed(() => {
  return ticketSubject.value && ticketMessage.value;
});

const submitTicket = async () => {
  const newTicket = {
    id: String(Date.now()),
    subject: ticketSubject.value,
    status: 'pending',
    date: new Date().toLocaleDateString("fa-IR")
  };

  recentTickets.value.unshift(newTicket);

  $q.notify({
    message: 'تیکت با موفقیت ارسال شد',
    color: 'positive',
    position: 'right',
    timeout: 2000
  });

  ticketSubject.value = "";
  ticketMessage.value = "";

  try {
    const { data } = await api.post('/post-ticket', {
      subject: newTicket.subject,
      message: ticketMessage.value
    });

    recentTickets.value[0] = {
      id: data.id,
      subject: data.subject,
      status: data.status,
      date: data.date
    };
  } catch (error) {
    console.error("API Error:", error);
  }
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    closed: 'negative',
    answered: 'positive'
  };
  return colors[status] || 'accent';
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'در انتظار بررسی',
    closed: 'بسته شده',
    answered: 'پاسخ داده شده'
  };
  return labels[status] || '';
};

function viewTicket(ticketId){
  router.push({name: 'ticketAnswer', params:{id: ticketId}})
}
</script>



<style scoped>
.ticket-container {
  max-width: 1200px;
  margin: 0 auto;
}

.title-container {
  position: relative;
  padding: 16px 0;
}

.title-underline {
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, var(--q-secondary), var(--q-info));
  margin: 12px auto 0;
  border-radius: 2px;
}

.status-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
}

.status-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.pending-card {
  background: linear-gradient(to bottom right, #fffde7, #fff8e1);
  border-right: 4px solid #ffb300;
}

.closed-card {
  background: linear-gradient(to bottom right, #ffebee, #ffecef);
  border-right: 4px solid #e53935;
}

.answered-card {
  background: linear-gradient(to bottom right, #e8f5e9, #e6f4ea);
  border-right: 4px solid #43a047;
}

.total-card {
  background: linear-gradient(to bottom right, #e3f2fd, #e1f5fe);
  border-right: 4px solid #1e88e5;
}

.form-card, .list-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.submit-btn {
  border-radius: 8px;
  padding: 8px 24px;
  font-weight: 500;
}

.view-all-btn {
  font-size: 0.9rem;
  padding: 4px 12px;
  font-weight: 500;
}

.ticket-item {
  transition: background-color 0.2s ease;
  border-radius: 8px;
  margin: 4px 0;
}

.ticket-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.department-select :deep(.q-field__native) {
  direction: rtl;
}

@media (max-width: 767px) {
  .status-card {
    margin-bottom: 12px;
  }

  .form-card {
    margin-bottom: 24px;
  }
}
</style>
