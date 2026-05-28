<template>
  <div class="min-h-screen bg-slate-100 text-slate-800 flex flex-col w-full">
    <nav v-if="authStore.isAuthenticated" class="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 w-full shadow-sm">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center w-full gap-4">
        <div class="flex items-center gap-5 flex-wrap">
          <h1 class="text-lg font-bold text-blue-700 mr-2">Shopify Budget Manager</h1>
          <router-link to="/" class="text-slate-600 hover:text-blue-600 text-sm font-medium" active-class="text-blue-700 font-semibold border-b-2 border-blue-600 pb-0.5">Dashboard</router-link>
          <router-link to="/budgets" class="text-slate-600 hover:text-blue-600 text-sm font-medium" active-class="text-blue-700 font-semibold border-b-2 border-blue-600 pb-0.5">Budżety</router-link>
          <router-link to="/logs" class="text-slate-600 hover:text-blue-600 text-sm font-medium" active-class="text-blue-700 font-semibold border-b-2 border-blue-600 pb-0.5">Transakcje</router-link>
          <router-link to="/approvals" class="text-slate-600 hover:text-blue-600 text-sm font-medium" active-class="text-blue-700 font-semibold border-b-2 border-blue-600 pb-0.5">Zatwierdzanie</router-link>
          <router-link to="/notifications" class="text-slate-600 hover:text-blue-600 text-sm font-medium relative" active-class="text-blue-700 font-semibold border-b-2 border-blue-600 pb-0.5">
            Powiadomienia
            <span v-if="unreadCount > 0" class="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{{ unreadCount }}</span>
          </router-link>
          <router-link to="/audit" class="text-slate-600 hover:text-blue-600 text-sm font-medium" active-class="text-blue-700 font-semibold border-b-2 border-blue-600 pb-0.5">Historia</router-link>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-slate-500 text-xs hidden md:inline">{{ authStore.user?.email }} ({{ authStore.user?.role }})</span>
          <button @click="logout" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-medium">
            Wyloguj
          </button>
        </div>
      </div>
    </nav>
    <main class="flex-grow flex flex-col w-full">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import api from './services/api';

const authStore = useAuthStore();
const router = useRouter();
const unreadCount = ref(0);

const fetchUnreadCount = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const response = await api.get('/notifications/unread-count');
    unreadCount.value = response.data.count;
  } catch (e) {
    // ignoruj błędy
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(() => {
  fetchUnreadCount();
  // Odświeżaj co 30 sekund
  setInterval(fetchUnreadCount, 30000);
});

watch(() => authStore.isAuthenticated, (val) => {
  if (val) fetchUnreadCount();
});
</script>
