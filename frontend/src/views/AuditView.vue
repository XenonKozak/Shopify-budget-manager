<template>
  <div class="container mx-auto p-4 lg:p-6 flex-grow">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Historia operacji</h2>
      <p class="text-slate-500 text-sm">Logi audytowe — historia zmian w systemie</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Tabela -->
    <div v-else-if="logs.length > 0" class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Akcja</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Typ encji</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Użytkownik</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Szczegóły</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{{ formatDate(log.createdAt) }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-medium">{{ log.action }}</span>
              </td>
              <td class="px-4 py-3 text-slate-600 text-xs">{{ log.entityType }}</td>
              <td class="px-4 py-3 text-slate-400 text-xs font-mono">{{ log.entityId || '—' }}</td>
              <td class="px-4 py-3 text-slate-600 text-xs">{{ log.userEmail || '—' }}</td>
              <td class="px-4 py-3 text-slate-500 text-xs max-w-xs truncate" :title="log.details">{{ log.details || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
      <h3 class="text-base font-medium text-slate-500 mb-1">Brak logów audytowych</h3>
      <p class="text-slate-400 text-sm">System nie zarejestrował jeszcze żadnych operacji.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const logs = ref([]);
const isLoading = ref(true);

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/auditlogs');
    logs.value = response.data;
  } catch (error) {
    console.error('Błąd pobierania logów audytowych:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

onMounted(() => {
  fetchLogs();
});
</script>
