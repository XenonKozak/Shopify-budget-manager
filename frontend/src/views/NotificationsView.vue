<template>
  <div class="container mx-auto p-4 lg:p-6 flex-grow">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Powiadomienia</h2>
        <p class="text-slate-500 text-sm">Alerty systemowe o wydatkach i budżetach</p>
      </div>
      <button 
        v-if="notifications.length > 0"
        @click="markAllAsRead" 
        class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded text-sm font-medium"
      >
        Oznacz wszystkie jako przeczytane
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Lista -->
    <div v-else-if="notifications.length > 0" class="space-y-2">
      <div 
        v-for="notif in notifications" :key="notif.id"
        class="bg-white border rounded-lg p-4 shadow-sm flex items-start gap-3 cursor-pointer hover:bg-slate-50"
        :class="notif.isRead ? 'border-slate-200' : 'border-blue-300 bg-blue-50/30'"
        @click="markAsRead(notif.id)"
      >
        <div class="flex-shrink-0 mt-0.5">
          <span 
            class="w-8 h-8 rounded flex items-center justify-center text-sm"
            :class="getTypeIconClass(notif.type)"
          >
            {{ getTypeIcon(notif.type) }}
          </span>
        </div>
        <div class="flex-grow">
          <div class="flex justify-between items-start">
            <h4 class="text-sm font-semibold text-slate-800" :class="{ 'font-bold': !notif.isRead }">{{ notif.title }}</h4>
            <span class="text-[10px] text-slate-400 whitespace-nowrap ml-2">{{ formatDate(notif.createdAt) }}</span>
          </div>
          <p class="text-sm text-slate-600 mt-0.5">{{ notif.message }}</p>
          <span class="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded" :class="getTypeBadgeClass(notif.type)">{{ getTypeLabel(notif.type) }}</span>
        </div>
        <div v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
      <h3 class="text-base font-medium text-slate-500 mb-1">Brak powiadomień</h3>
      <p class="text-slate-400 text-sm">System nie wygenerował jeszcze żadnych alertów.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const notifications = ref([]);
const isLoading = ref(true);

const fetchNotifications = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/notifications');
    notifications.value = response.data;
  } catch (error) {
    console.error('Błąd pobierania powiadomień:', error);
  } finally {
    isLoading.value = false;
  }
};

const markAsRead = async (id) => {
  try {
    await api.put(`/notifications/${id}/read`);
    const notif = notifications.value.find(n => n.id === id);
    if (notif) notif.isRead = true;
  } catch (error) {
    console.error('Błąd oznaczania powiadomienia:', error);
  }
};

const markAllAsRead = async () => {
  try {
    await api.put('/notifications/read-all');
    notifications.value.forEach(n => n.isRead = true);
  } catch (error) {
    console.error('Błąd oznaczania powiadomień:', error);
  }
};

const getTypeIcon = (type) => {
  if (type === 'BudgetExceeded') return '🚫';
  if (type === 'BudgetWarning') return '⚠️';
  if (type === 'ApprovalRequired') return '📋';
  if (type === 'ApprovalDecision') return '✅';
  return '🔔';
};

const getTypeIconClass = (type) => {
  if (type === 'BudgetExceeded') return 'bg-red-100 text-red-600';
  if (type === 'BudgetWarning') return 'bg-yellow-100 text-yellow-600';
  return 'bg-blue-100 text-blue-600';
};

const getTypeBadgeClass = (type) => {
  if (type === 'BudgetExceeded') return 'bg-red-100 text-red-600';
  if (type === 'BudgetWarning') return 'bg-yellow-100 text-yellow-600';
  if (type === 'ApprovalDecision') return 'bg-green-100 text-green-600';
  return 'bg-blue-100 text-blue-600';
};

const getTypeLabel = (type) => {
  if (type === 'BudgetExceeded') return 'Przekroczenie budżetu';
  if (type === 'BudgetWarning') return 'Ostrzeżenie';
  if (type === 'ApprovalRequired') return 'Wymaga zatwierdzenia';
  if (type === 'ApprovalDecision') return 'Decyzja';
  return type;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

onMounted(() => {
  fetchNotifications();
});
</script>
