<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProfileCard from '../components/ProfileCard.vue'

const route = useRoute()
const router = useRouter()
const members = ref([])
const groupName = ref('')
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('/api/contestants')
    const data = await response.json()
    const nameFromUrl = decodeURI(route.path.split('/').pop()).toLowerCase()
    
    members.value = data.filter(i => i.group && i.group.toLowerCase() === nameFromUrl)
    
    if (members.value.length > 0) {
      groupName.value = members.value[0].group
    }
  } catch (error) {
    console.error("Błąd podczas pobierania grupy:", error)
  } finally {
    isLoading.value = false
  }
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 p-6 md:p-12 font-sans flex flex-col items-center">
    
    <div v-if="isLoading" class="text-emerald-400 animate-pulse text-xl font-bold mt-20">
      Ładowanie grupy...
    </div>

    <div v-else-if="members.length > 0" class="w-full max-w-7xl flex flex-col items-center">
      
      <h1 class="text-4xl md:text-6xl font-black text-white uppercase tracking-widest mb-2 text-center">
        {{ groupName }}
      </h1>
      <p class="text-emerald-400 font-bold tracking-widest mb-12 uppercase text-sm">
        Członkowie zespołu ({{ members.length }})
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full justify-items-center">
        <router-link 
          v-for="member in members" 
          :key="member.id"
          :to="`/${member.name.toLowerCase()}`"
          class="w-full max-w-[320px] aspect-[3/4] transition-transform hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-2xl"
        >
          <ProfileCard :idol="member" class="w-full h-full cursor-pointer" />
        </router-link>
      </div>

      <button 
        @click="goBack" 
        class="mt-16 px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full transition-colors uppercase tracking-widest text-sm shadow-lg hover:-translate-y-1"
      >
        Wróć
      </button>

    </div>

    <div v-else class="text-red-400 text-xl font-bold mt-20 flex flex-col items-center gap-6">
      Nie znaleziono takiej grupy!
      <button @click="goBack" class="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full transition-colors">Wróć</button>
    </div>
    
  </div>
</template>