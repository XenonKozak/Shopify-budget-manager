<template>
  <div class="container mx-auto p-4 lg:p-6 flex-grow">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Logi transakcji</h2>
      <p class="text-slate-500 text-sm">Historia zamówień ze sklepu Shopify</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">
      {{ errorMsg }}
    </div>

    <!-- Tabela transakcji -->
    <div v-else-if="logs.length > 0" class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Zamówienie</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Kategoria</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Kwota</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Produkty</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 text-slate-600 whitespace-nowrap">{{ formatDate(log.createdAt) }}</td>
              <td class="px-4 py-3 text-slate-800 font-medium">{{ log.orderName }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{{ log.category }}</span>
              </td>
              <td class="px-4 py-3">
                <span 
                  class="px-2 py-0.5 text-xs rounded font-medium"
                  :class="log.status === 'ALLOWED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ log.status === 'ALLOWED' ? 'Zaakceptowane' : 'Zablokowane' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-medium" :class="log.status === 'ALLOWED' ? 'text-slate-800' : 'text-slate-400 line-through'">
                {{ formatCurrency(log.amount, log.currency) }}
              </td>
              <td class="px-4 py-3 text-slate-500 text-xs">
                <span v-for="(item, idx) in log.items" :key="idx">
                  {{ item.quantity }}x {{ item.name }}<span v-if="idx < log.items.length - 1">, </span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-for="log in logs.filter(l => l.reason)" :key="'reason-' + log.id" class="px-4 py-2 bg-yellow-50 border-t border-yellow-100 text-xs text-yellow-700">
        <strong>{{ log.orderName }}:</strong> {{ log.reason }}
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
      <h3 class="text-base font-medium text-slate-500 mb-1">Brak transakcji</h3>
      <p class="text-slate-400 text-sm">System nie zarejestrował jeszcze żadnych logów zakupowych z Shopify.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const logs = ref([]);
const isLoading = ref(true);
const errorMsg = ref('');

const fetchLogs = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/transactionlogs');
    logs.value = response.data;
  } catch (error) {
    errorMsg.value = 'Nie udało się pobrać logów transakcji.';
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (value, currency) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency }).format(value);
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
