<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProfileCard from '../components/ProfileCard.vue'

const route = useRoute()
const router = useRouter()
const idol = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('/api/contestants')
    const data = await response.json()
    const nameFromUrl = decodeURI(route.path.substring(1)).toLowerCase()
    idol.value = data.find(i => i.name.toLowerCase() === nameFromUrl)
  } catch (error) {
    console.error("Błąd podczas pobierania idolki:", error)
  } finally {
    isLoading.value = false
  }
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 overflow-hidden">
    
    <div v-if="isLoading" class="text-emerald-400 animate-pulse text-xl font-bold">
      Ładowanie profilu...
    </div>

    <div v-else-if="idol" class="flex flex-col items-center w-full">
      <div class="w-full max-w-[400px] sm:max-w-[480px] h-[70vh] min-h-[500px] max-h-[800px] relative">
        <ProfileCard 
          :idol="idol" 
          :staticMode="true" 
          class="w-full h-full cursor-default shadow-2xl" 
        />
      </div>
      
      <button 
        @click="goBack" 
        class="mt-8 sm:mt-12 px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full transition-colors uppercase tracking-widest text-sm shadow-lg hover:-translate-y-1"
      >
        Wróć
      </button>
    </div>

    <div v-else class="text-red-400 text-xl font-bold">
      Nie znaleziono takiej idolki!
    </div>
    
  </div>
</template>