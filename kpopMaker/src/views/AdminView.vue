<script setup>
import { ref, computed, onMounted } from 'vue'
import TournamentRow from '../components/TournamentRow.vue'

const allTournaments = ref([])
const isLoading = ref(false)

const adminPassword = ref(sessionStorage.getItem('kpop_admin_pwd') || '')
const isAuthorized = ref(false)
const loginError = ref(false)

const pendingTours = computed(() => allTournaments.value.filter(t => t.status === 'PENDING'))
const approvedTours = computed(() => allTournaments.value.filter(t => t.status === 'APPROVED'))

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'x-admin-password': adminPassword.value
  }
}

const fetchAllTournaments = async () => {
  if (!adminPassword.value) return

  isLoading.value = true
  loginError.value = false

  try {
    const response = await fetch('/api/tournaments', { headers: getHeaders() })
    
    if (response.status === 401) {
      isAuthorized.value = false
      loginError.value = true
      sessionStorage.removeItem('kpop_admin_pwd')
      throw new Error('Nieautoryzowany dostęp')
    }
    
    if (!response.ok) throw new Error('Błąd pobierania turniejów')
    allTournaments.value = await response.json()
    isAuthorized.value = true
    sessionStorage.setItem('kpop_admin_pwd', adminPassword.value)
    
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
const handleLogout = () => {
  isAuthorized.value = false;
  adminPassword.value = '';
  sessionStorage.removeItem('kpop_admin_pwd');
  sessionStorage.removeItem('kpop_admin_cache');
};
const handleApprove = async (id) => {
  if (!window.confirm('Zatwierdzić ten wynik do globalnego rankingu?')) return;
  try {
    const response = await fetch(`/api/tournaments/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders()
    });
    if (response.status === 401) alert('Sesja wygasła. Zaloguj się ponownie.');
    if (!response.ok) throw new Error('Błąd serwera');
    await fetchAllTournaments();
  } catch (error) {
    console.error(error);
  }
}

const handleReject = async (id) => {
  if (!window.confirm('UWAGA! Usunąć trwale ten turniej?')) return;
  try {
    const response = await fetch(`/api/tournaments/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (response.status === 401) alert('Sesja wygasła. Zaloguj się ponownie.');
    if (!response.ok) throw new Error('Błąd serwera');
    await fetchAllTournaments();
  } catch (error) {
    console.error(error);
  }
}
onMounted(() => {
  if (adminPassword.value) {
    fetchAllTournaments()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 p-4 md:p-8 font-sans">
    
    <router-link to="/" class="text-emerald-400 hover:text-emerald-300 font-bold text-sm tracking-wide transition-colors duration-200 mb-6 md:mb-8 inline-block">
      &larr; Wróć na stronę główną
    </router-link>

    <div v-if="!isAuthorized" class="max-w-md mx-auto bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700 mt-10 md:mt-20">
      <h2 class="text-xl md:text-2xl font-black text-white mb-6 text-center uppercase tracking-widest">Wymagana Autoryzacja</h2>
      <div v-if="loginError" class="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm font-bold text-center border border-red-500/50">
        Błędne hasło! Spróbuj ponownie.
      </div>
      <input v-model="adminPassword" type="password" autocomplete="new-password" placeholder="Hasło administratora..." class="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 text-white mb-4 focus:outline-none focus:border-emerald-500 transition-colors" @keyup.enter="fetchAllTournaments">
      <button @click="fetchAllTournaments" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition-colors shadow-lg">
        <span v-if="isLoading">Ładowanie...</span><span v-else>Zaloguj się</span>
      </button>
    </div>

    <div v-else>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <h1 class="text-2xl md:text-3xl font-black text-white uppercase tracking-widest">Panel Administracyjny</h1>
        <button @click="handleLogout" class="text-sm font-bold text-gray-400 hover:text-red-400 transition-colors bg-gray-800 md:bg-transparent px-4 py-2 md:p-0 rounded-lg md:rounded-none">Wyloguj się</button>
      </div>

      <h2 class="text-xl md:text-2xl font-bold text-emerald-400 mb-4">Oczekujące na decyzję ({{ pendingTours.length }})</h2>
      <div v-if="pendingTours.length === 0" class="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-xl text-center mb-12">
        <span class="text-emerald-500 font-bold text-lg">Brak wyników do sprawdzenia!</span>
      </div>
      
      <div v-else class="overflow-hidden bg-gray-800 rounded-xl shadow-xl border border-gray-700 mb-12">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-950 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
              <th class="px-4 md:px-6 py-4 font-bold">Gracz</th>
              <th class="hidden sm:table-cell px-4 md:px-6 py-4 font-bold">Data</th>
              <th class="px-4 md:px-6 py-4 font-bold text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <TournamentRow v-for="tour in pendingTours" :key="tour.id" :tour="tour" :isPending="true" @updateStatus="handleApprove" @deleteTour="handleReject" />
          </tbody>
        </table>
      </div>

      <h2 class="text-xl md:text-2xl font-bold text-gray-300 mb-4 mt-8 md:mt-12">Zatwierdzona historia gry ({{ approvedTours.length }})</h2>
      <div class="overflow-hidden bg-gray-800 rounded-xl shadow-xl border border-gray-700 opacity-90 hover:opacity-100 transition-opacity">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-950 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
              <th class="px-4 md:px-6 py-4 font-bold">Gracz</th>
              <th class="hidden sm:table-cell px-4 md:px-6 py-4 font-bold">Data</th>
              <th class="px-4 md:px-6 py-4 font-bold text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            <TournamentRow v-for="tour in approvedTours" :key="tour.id" :tour="tour" :isPending="false" @deleteTour="handleReject" />
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>