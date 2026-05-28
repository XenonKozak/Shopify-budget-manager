<template>
  <div class="container mx-auto p-4 lg:p-6 flex-grow">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Dashboard</h2>
      <p class="text-slate-500 text-sm">Podsumowanie Twoich wydatków i budżetów</p>
    </div>

    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <template v-else-if="summary">
      <!-- STATYSTYKI -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h4 class="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Budżet miesięczny</h4>
          <div class="text-xl font-bold text-slate-800">{{ formatCurrency(summary.totalMonthlyBudget) }}</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h4 class="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Wydano</h4>
          <div class="text-xl font-bold text-red-600">{{ formatCurrency(summary.totalSpent) }}</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h4 class="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Pozostało</h4>
          <div class="text-xl font-bold text-green-600">{{ formatCurrency(summary.remainingBudget) }}</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h4 class="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">Zablokowane zakupy</h4>
          <div class="text-xl font-bold text-orange-600">{{ summary.blockedPurchasesCount }}</div>
        </div>
      </div>

      <!-- Dodatkowe info -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">{{ summary.budgetCategoriesCount }}</div>
          <div>
            <div class="text-sm font-medium text-slate-700">Kategorie budżetowe</div>
            <div class="text-xs text-slate-400">aktywne limity</div>
          </div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center text-lg font-bold">{{ summary.pendingApprovalsCount }}</div>
          <div>
            <div class="text-sm font-medium text-slate-700">Oczekujące zatwierdzenia</div>
            <div class="text-xs text-slate-400">wymagają decyzji</div>
          </div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold">{{ summary.unreadNotificationsCount }}</div>
          <div>
            <div class="text-sm font-medium text-slate-700">Nieprzeczytane alerty</div>
            <div class="text-xs text-slate-400">powiadomienia systemowe</div>
          </div>
        </div>
      </div>

      <!-- Pasek zużycia budżetu -->
      <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">Wykorzystanie budżetu globalnego</h3>
        <div class="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
          <div 
            class="h-4 rounded-full transition-all"
            :class="budgetPercentage >= 100 ? 'bg-red-500' : budgetPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'"
            :style="{ width: Math.min(budgetPercentage, 100) + '%' }"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-slate-500">
          <span>{{ formatCurrency(summary.totalSpent) }} wydano</span>
          <span>{{ budgetPercentage.toFixed(1) }}%</span>
          <span>{{ formatCurrency(summary.totalMonthlyBudget) }} limit</span>
        </div>
      </div>

      <!-- WYKRESY -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Wykres kołowy -->
        <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Wydatki wg kategorii</h3>
          <div v-if="summary.categorySpendings && summary.categorySpendings.length > 0" class="h-64 flex items-center justify-center">
            <Doughnut :data="pieChartData" :options="pieChartOptions" />
          </div>
          <div v-else class="text-center py-8 text-slate-400 text-sm">Brak danych do wyświetlenia</div>
        </div>

        <!-- Wykres liniowy -->
        <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Wydatki dzienne (bieżący miesiąc)</h3>
          <div v-if="summary.dailySpendings && summary.dailySpendings.length > 0" class="h-64">
            <Line :data="lineChartData" :options="lineChartOptions" />
          </div>
          <div v-else class="text-center py-8 text-slate-400 text-sm">Brak danych do wyświetlenia</div>
        </div>
      </div>

      <!-- Ranking kategorii -->
      <div v-if="summary.categorySpendings && summary.categorySpendings.length > 0" class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
        <h3 class="text-sm font-semibold text-slate-700 mb-3">Ranking kategorii wydatków</h3>
        <div class="space-y-3">
          <div v-for="(cat, index) in sortedCategories" :key="cat.category" class="flex items-center gap-3">
            <span class="w-6 h-6 rounded bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">{{ index + 1 }}</span>
            <div class="flex-grow">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-slate-700">{{ cat.category }}</span>
                <span class="text-sm text-slate-500">{{ formatCurrency(cat.amount) }} / {{ formatCurrency(cat.limit) }}</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full"
                  :class="getCategoryBarColor(cat)"
                  :style="{ width: Math.min(cat.limit > 0 ? (cat.amount / cat.limit) * 100 : 0, 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ASYSTENT AI -->
      <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-700">Asystent AI — prognozowanie wydatków</h3>
            <p class="text-xs text-slate-400">Analiza oparta na modelu Gemini</p>
          </div>
          <button 
            @click="generateAiInsights"
            :disabled="isGeneratingAi"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded text-sm font-medium"
          >
            {{ isGeneratingAi ? 'Analizowanie...' : 'Analizuj budżet' }}
          </button>
        </div>

        <div v-if="aiInsightText" class="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {{ aiInsightText }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const summary = ref(null);
const isLoading = ref(true);
const aiInsightText = ref('');
const isGeneratingAi = ref(false);

const chartColors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const budgetPercentage = computed(() => {
  if (!summary.value || summary.value.totalMonthlyBudget === 0) return 0;
  return (summary.value.totalSpent / summary.value.totalMonthlyBudget) * 100;
});

const sortedCategories = computed(() => {
  if (!summary.value?.categorySpendings) return [];
  return [...summary.value.categorySpendings].sort((a, b) => b.amount - a.amount);
});

const pieChartData = computed(() => {
  if (!summary.value?.categorySpendings) return { labels: [], datasets: [] };
  return {
    labels: summary.value.categorySpendings.map(c => c.category),
    datasets: [{
      data: summary.value.categorySpendings.map(c => c.amount),
      backgroundColor: chartColors.slice(0, summary.value.categorySpendings.length),
      borderWidth: 1,
      borderColor: '#fff'
    }]
  };
});

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, font: { size: 11 } }
    }
  }
};

const lineChartData = computed(() => {
  if (!summary.value?.dailySpendings) return { labels: [], datasets: [] };
  return {
    labels: summary.value.dailySpendings.map(d => d.date.substring(5)), // MM-DD
    datasets: [{
      label: 'Wydatki (PLN)',
      data: summary.value.dailySpendings.map(d => d.amount),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: '#3b82f6'
    }]
  };
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true, ticks: { font: { size: 10 } } },
    x: { ticks: { font: { size: 10 } } }
  },
  plugins: {
    legend: { display: false }
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
};

const getCategoryBarColor = (cat) => {
  if (cat.limit === 0) return 'bg-slate-400';
  const pct = (cat.amount / cat.limit) * 100;
  if (pct >= 100) return 'bg-red-500';
  if (pct >= 80) return 'bg-yellow-500';
  return 'bg-blue-500';
};

const generateAiInsights = async () => {
  isGeneratingAi.value = true;
  aiInsightText.value = '';
  try {
    const response = await api.get('/aiinsights');
    aiInsightText.value = response.data.text;
  } catch (error) {
    aiInsightText.value = 'Wystąpił błąd podczas komunikacji z API Gemini.';
  } finally {
    isGeneratingAi.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/summary');
    summary.value = response.data;
  } catch (error) {
    console.error('Błąd pobierania podsumowania:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>
