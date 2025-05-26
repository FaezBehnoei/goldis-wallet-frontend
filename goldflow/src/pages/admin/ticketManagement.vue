<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center">
      <div class="text-h5 text-primary">مدیریت تیکت‌ها</div>
      <q-btn color="primary" icon="refresh" @click="fetchTickets">بروزرسانی</q-btn>
    </div>

    <!-- Filters & Search -->
    <div class="row q-mb-md q-gutter-md">
      <q-select
        v-model="selectedStatus"
        :options="statusOptions"
        label="وضعیت تیکت"
        clearable
        outlined
        dense
        emit-value
        map-options
        class="col-12 col-md-3"
      />

      <q-input
        v-model="searchQuery"
        label="جستجو در تیکت‌ها"
        outlined
        dense
        class="col-12 col-md-4"
        clearable
        debounce="300"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Tickets Table -->
    <q-table
      class="q-mt-md"
      dense
      flat
      bordered
      :rows="filteredTickets"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      @request="fetchTickets"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.row.status)">
            {{ getStatusText(props.row.status) }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            icon="visibility"
            flat
            @click="viewTicketDetails(props.row)"
            label="مشاهده"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";

const $q = useQuasar();
const loading = ref(false);
const tickets = ref([]);
const pagination = ref({ page: 1, rowsPerPage: 10 });

// Filter & Search
const selectedStatus = ref(null);
const searchQuery = ref("");

// Status options
const statusOptions = [
  { label: "همه", value: null },
  { label: "باز", value: "open" },
  { label: "در حال بررسی", value: "pending" },
  { label: "حل شده", value: "resolved" }
];

// Table Columns
const columns = [
  { name: "id", label: "شناسه", field: "id", align: "left", sortable: true },
  { name: "user", label: "کاربر", field: "user", align: "left", sortable: true },
  { name: "category", label: "دسته‌بندی", field: "category", align: "left", sortable: true },
  { name: "status", label: "وضعیت", field: "status", align: "center", sortable: true },
  { name: "created_at", label: "تاریخ ایجاد", field: "created_at", align: "right", sortable: true },
  { name: "actions", label: "عملیات", align: "center" }
];

// Fetch Tickets from API
const fetchTickets = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/api/tickets");
    tickets.value = response.data;
  } catch (error) {
    $q.notify({ type: "negative", message: "خطا در دریافت تیکت‌ها" });
    console.log(error)
  } finally {
    loading.value = false;
  }
};

// Filtering logic
const filteredTickets = computed(() => {
  let filtered = tickets.value;

  if (selectedStatus.value) {
    filtered = filtered.filter((ticket) => ticket.status === selectedStatus.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (ticket) =>
        ticket.id.toString().includes(query) ||
        ticket.user.toLowerCase().includes(query) ||
        ticket.category.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Helper functions for status display
const getStatusColor = (status) => {
  return status === "resolved"
    ? "green"
    : status === "pending"
    ? "orange"
    : "red";
};

const getStatusText = (status) => {
  return status === "resolved"
    ? "حل شده"
    : status === "pending"
    ? "در حال بررسی"
    : "باز";
};

// Open Ticket Details
const viewTicketDetails = (ticket) => {
  console.log("Viewing Ticket:", ticket);
  // Will implement modal/dialog for details in the next step
};

onMounted(fetchTickets);
</script>
