<template>
  <div class="container mx-auto p-4 lg:p-6 flex-grow">
    <!-- NAGŁÓWEK -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Zarządzanie budżetami</h2>
        <p class="text-slate-500 text-sm">Twórz i edytuj limity budżetowe dla kategorii</p>
      </div>
      
      <div class="flex gap-4 items-center">
        <div v-if="summary" class="hidden sm:block text-right border-r border-slate-200 pr-4">
          <div class="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Budżet globalny</div>
          <div class="font-bold text-slate-800">{{ formatCurrency(summary.totalMonthlyBudget) }}</div>
        </div>

        <div class="flex gap-2">
          <button 
            @click="openGlobalBudgetModal"
            class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded text-sm font-medium"
          >
            Zmień globalny
          </button>
          
          <button 
            @click="openCreateModal"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
          >
            + Nowy limit
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">
      {{ errorMsg }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Budgets Grid -->
    <div v-else-if="budgets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="budget in budgets" :key="budget.id"
        class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col"
        :class="{'opacity-50': !budget.isActive}"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-base font-semibold text-slate-800 flex items-center gap-2">
              {{ budget.name }}
              <span v-if="!budget.isActive" class="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 uppercase">Nieaktywny</span>
            </h3>
            <span class="text-xs text-slate-400 uppercase tracking-wide">{{ budget.category }}</span>
          </div>
          <div class="flex gap-1">
            <button @click="openEditModal(budget)" class="text-slate-400 hover:text-blue-600 p-1" title="Edytuj">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button @click="deleteBudget(budget.id)" class="text-slate-400 hover:text-red-500 p-1" title="Usuń">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="mt-auto">
          <div class="flex justify-between items-end mb-2">
            <span class="text-slate-500 text-xs">Wydano:</span>
            <div class="text-right">
              <span class="text-lg font-bold" :class="getAmountColor(budget)">
                {{ formatCurrency(budget.currentSpent, budget.currency) }}
              </span>
              <span class="text-slate-400 text-xs"> / {{ formatCurrency(budget.monthlyLimit, budget.currency) }}</span>
            </div>
          </div>
          
          <!-- Progress bar -->
          <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              class="h-2 rounded-full transition-all" 
              :class="getProgressColor(budget)"
              :style="{ width: getPercentage(budget) + '%' }"
            ></div>
          </div>
          <div class="text-right mt-1 text-[10px] text-slate-400">{{ getPercentage(budget).toFixed(0) }}%</div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
      <h3 class="text-base font-medium text-slate-500 mb-1">Brak limitów budżetowych</h3>
      <p class="text-slate-400 text-sm">Kliknij „Nowy limit", aby dodać pierwszy budżet.</p>
    </div>

    <!-- Modal: Globalny budżet -->
    <div v-if="showGlobalBudgetModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-slate-800">Całkowity budżet miesięczny</h3>
          <button @click="showGlobalBudgetModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <form @submit.prevent="saveGlobalBudget" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Maksymalna kwota do wydania (PLN)</label>
            <input v-model.number="globalBudgetForm.totalMonthlyBudget" required type="number" min="0" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="0.00">
            <p class="text-xs text-slate-400 mt-1">Na podstawie tej kwoty system oblicza pozostały budżet.</p>
          </div>
          
          <div class="flex gap-2">
            <button type="button" @click="showGlobalBudgetModal = false" class="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-medium">Anuluj</button>
            <button type="submit" :disabled="isSaving" class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
              {{ isSaving ? 'Zapisywanie...' : 'Zapisz' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Nowy/Edytuj limit -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-slate-800">{{ isEditing ? 'Edytuj limit' : 'Nowy limit budżetowy' }}</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <form @submit.prevent="saveBudget" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Nazwa</label>
            <input v-model="formData.name" required type="text" class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="np. Elektronika">
          </div>
          
          <div v-if="!isEditing">
            <label class="block text-sm font-medium text-slate-600 mb-1">Kategoria</label>
            <input v-model="formData.category" required type="text" class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="np. electronics">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Limit miesięczny (PLN)</label>
            <input v-model.number="formData.monthlyLimit" required type="number" min="0" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="0.00">
          </div>
          
          <div v-if="isEditing" class="flex items-center gap-2">
            <input v-model="formData.isActive" type="checkbox" id="isActive" class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500">
            <label for="isActive" class="text-sm text-slate-600">Aktywny</label>
          </div>
          
          <div class="flex gap-2">
            <button type="button" @click="showModal = false" class="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-medium">Anuluj</button>
            <button type="submit" :disabled="isSaving" class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
              {{ isSaving ? 'Zapisywanie...' : 'Zapisz' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const budgets = ref([]);
const summary = ref(null);
const isLoading = ref(true);
const errorMsg = ref('');

const showModal = ref(false);
const showGlobalBudgetModal = ref(false);
const isSaving = ref(false);
const isEditing = ref(false);
const editId = ref(null);

const globalBudgetForm = ref({ totalMonthlyBudget: 0 });

const formData = ref({
  name: '',
  category: '',
  monthlyLimit: 0,
  isActive: true,
  currency: 'PLN'
});

const fetchBudgets = async () => {
  try {
    const response = await api.get('/budgetlimits');
    budgets.value = response.data;
  } catch (error) {
    errorMsg.value = 'Nie udało się pobrać budżetów.';
  }
};

const fetchSummary = async () => {
  try {
    const response = await api.get('/summary');
    summary.value = response.data;
  } catch (error) {
    console.error('Błąd pobierania podsumowania:', error);
  }
};

const loadData = async () => {
  isLoading.value = true;
  await Promise.all([fetchBudgets(), fetchSummary()]);
  isLoading.value = false;
};

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = { name: '', category: '', monthlyLimit: 0, isActive: true, currency: 'PLN' };
  showModal.value = true;
};

const openEditModal = (budget) => {
  isEditing.value = true;
  editId.value = budget.id;
  formData.value = { 
    name: budget.name, 
    category: budget.category, 
    monthlyLimit: budget.monthlyLimit, 
    isActive: budget.isActive,
    currency: budget.currency
  };
  showModal.value = true;
};

const openGlobalBudgetModal = () => {
  globalBudgetForm.value.totalMonthlyBudget = summary.value?.totalMonthlyBudget || 0;
  showGlobalBudgetModal.value = true;
};

const saveGlobalBudget = async () => {
  isSaving.value = true;
  try {
    await api.put('/settings/global-budget', {
      totalMonthlyBudget: globalBudgetForm.value.totalMonthlyBudget
    });
    showGlobalBudgetModal.value = false;
    await loadData();
  } catch (error) {
    alert('Błąd podczas zapisywania globalnego budżetu.');
  } finally {
    isSaving.value = false;
  }
};

const saveBudget = async () => {
  isSaving.value = true;
  errorMsg.value = '';
  
  try {
    if (isEditing.value) {
      await api.put(`/budgetlimits/${editId.value}`, {
        name: formData.value.name,
        monthlyLimit: formData.value.monthlyLimit,
        isActive: formData.value.isActive
      });
    } else {
      await api.post('/budgetlimits', {
        name: formData.value.name,
        category: formData.value.category,
        monthlyLimit: formData.value.monthlyLimit,
        currency: formData.value.currency
      });
    }
    showModal.value = false;
    await loadData();
  } catch (error) {
    if (error.response?.data?.error) {
      alert(error.response.data.error);
    } else {
      alert('Wystąpił błąd podczas zapisywania.');
    }
  } finally {
    isSaving.value = false;
  }
};

const deleteBudget = async (id) => {
  if (!confirm('Czy na pewno chcesz usunąć ten budżet?')) return;
  
  try {
    await api.delete(`/budgetlimits/${id}`);
    await loadData();
  } catch (error) {
    alert('Wystąpił błąd podczas usuwania budżetu.');
  }
};

const formatCurrency = (value, currency = 'PLN') => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(value);
};

const getPercentage = (budget) => {
  if (budget.monthlyLimit === 0) return 100;
  return Math.min((budget.currentSpent / budget.monthlyLimit) * 100, 100);
};

const getProgressColor = (budget) => {
  if (!budget.isActive) return 'bg-slate-400';
  const pct = getPercentage(budget);
  if (pct >= 100) return 'bg-red-500';
  if (pct >= 80) return 'bg-yellow-500';
  return 'bg-blue-500';
};

const getAmountColor = (budget) => {
  if (!budget.isActive) return 'text-slate-400';
  const pct = getPercentage(budget);
  if (pct >= 100) return 'text-red-600';
  if (pct >= 80) return 'text-yellow-600';
  return 'text-slate-800';
};

onMounted(() => {
  loadData();
});
</script>
