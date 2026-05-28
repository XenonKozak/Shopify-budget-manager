<template>
  <div class="container mx-auto p-4 lg:p-6 flex-grow">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Zatwierdzanie wydatków</h2>
      <p class="text-slate-500 text-sm">Zamówienia przekraczające limity budżetowe wymagające decyzji</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Lista -->
    <div v-else-if="approvals.length > 0" class="space-y-3">
      <div 
        v-for="req in approvals" :key="req.id"
        class="bg-white border border-slate-200 rounded-lg p-5 shadow-sm"
      >
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div class="flex-grow">
            <div class="flex items-center gap-2 mb-1">
              <span 
                class="px-2 py-0.5 text-xs rounded font-medium"
                :class="getStatusClass(req.status)"
              >
                {{ getStatusLabel(req.status) }}
              </span>
              <span class="text-slate-800 font-medium">{{ req.orderName }}</span>
              <span class="text-xs text-slate-400">{{ req.category }}</span>
            </div>
            <div class="text-xs text-slate-500">
              Utworzono: {{ formatDate(req.createdAt) }}
              <span v-if="req.decidedAt"> · Rozpatrzono: {{ formatDate(req.decidedAt) }}</span>
            </div>
            <div v-if="req.decisionNote" class="text-xs text-slate-500 mt-1 italic">Notatka: {{ req.decisionNote }}</div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-lg font-bold text-slate-800">{{ formatCurrency(req.amount, req.currency) }}</div>
            </div>
            
            <div v-if="req.status === 'Pending' && authStore.isAdmin" class="flex gap-2">
              <button 
                @click="openDecisionModal(req.id, 'Approved')" 
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium"
              >
                Akceptuj
              </button>
              <button 
                @click="openDecisionModal(req.id, 'Rejected')" 
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium"
              >
                Odrzuć
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
      <h3 class="text-base font-medium text-slate-500 mb-1">Brak żądań zatwierdzenia</h3>
      <p class="text-slate-400 text-sm">Wszystkie zamówienia mieszczą się w limitach budżetowych.</p>
    </div>

    <!-- Modal decyzyjny -->
    <div v-if="showDecisionModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-slate-800">
            {{ decisionType === 'Approved' ? 'Akceptuj zamówienie' : 'Odrzuć zamówienie' }}
          </h3>
          <button @click="showDecisionModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <form @submit.prevent="submitDecision" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Opcjonalna notatka</label>
            <textarea 
              v-model="decisionNote" 
              rows="3" 
              class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              placeholder="Dlaczego podjąłeś taką decyzję? (opcjonalnie)"
            ></textarea>
          </div>
          
          <div class="flex gap-2">
            <button type="button" @click="showDecisionModal = false" class="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-medium">Anuluj</button>
            <button 
              type="submit" 
              :disabled="isSavingDecision" 
              class="flex-1 py-2 text-white rounded text-sm font-medium"
              :class="decisionType === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
            >
              {{ isSavingDecision ? 'Zapisywanie...' : 'Zatwierdź decyzję' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const authStore = useAuthStore();

const approvals = ref([]);
const isLoading = ref(true);

const showDecisionModal = ref(false);
const decisionType = ref('');
const decisionNote = ref('');
const currentRequestId = ref(null);
const isSavingDecision = ref(false);

const fetchApprovals = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/approvals');
    approvals.value = response.data;
  } catch (error) {
    console.error('Błąd pobierania żądań zatwierdzenia:', error);
  } finally {
    isLoading.value = false;
  }
};

const openDecisionModal = (id, type) => {
  currentRequestId.value = id;
  decisionType.value = type;
  decisionNote.value = '';
  showDecisionModal.value = true;
};

const submitDecision = async () => {
  isSavingDecision.value = true;
  try {
    await api.put(`/approvals/${currentRequestId.value}/decision`, { 
      decision: decisionType.value, 
      note: decisionNote.value 
    });
    showDecisionModal.value = false;
    await fetchApprovals();
  } catch (error) {
    alert('Wystąpił błąd podczas zapisywania decyzji.');
  } finally {
    isSavingDecision.value = false;
  }
};

const getStatusClass = (status) => {
  if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
  if (status === 'Approved') return 'bg-green-100 text-green-700';
  return 'bg-red-100 text-red-700';
};

const getStatusLabel = (status) => {
  if (status === 'Pending') return 'Oczekuje';
  if (status === 'Approved') return 'Zaakceptowane';
  return 'Odrzucone';
};

const formatCurrency = (value, currency) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

onMounted(() => {
  fetchApprovals();
});
</script>
