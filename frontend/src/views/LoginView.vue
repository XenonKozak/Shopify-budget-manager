<template>
  <div class="flex-grow flex items-center justify-center p-4 bg-slate-100">
    <div class="w-full max-w-sm bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div class="text-center mb-6">
        <h2 class="text-xl font-bold text-slate-800 mb-1">Shopify Budget Manager</h2>
        <p class="text-slate-500 text-sm">{{ isLogin ? 'Zaloguj się do systemu' : 'Utwórz nowe konto' }}</p>
      </div>

      <form @submit.prevent="handleAuth" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required
            class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            placeholder="twoj@email.com"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Hasło</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            placeholder="••••••••"
          >
        </div>

        <div v-if="errorMsg" class="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm text-center">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Przetwarzanie...</span>
          <span v-else>{{ isLogin ? 'Zaloguj się' : 'Zarejestruj się' }}</span>
        </button>
      </form>

      <div class="mt-4 text-center text-sm text-slate-500">
        {{ isLogin ? 'Nie masz konta?' : 'Masz już konto?' }}
        <button @click="isLogin = !isLogin" class="text-blue-600 hover:underline font-medium ml-1">
          {{ isLogin ? 'Zarejestruj się' : 'Zaloguj się' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const isLogin = ref(true);
const isLoading = ref(false);
const errorMsg = ref('');

const handleAuth = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  
  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value);
    } else {
      await authStore.register(email.value, password.value);
    }
    router.push('/');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      errorMsg.value = error.response.data.error;
    } else {
      errorMsg.value = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
