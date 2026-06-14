<script setup>
import { ref, onMounted } from 'vue'
import ProfileCard from './components/ProfileCard.vue'

const contestants = ref([])
const winners = ref([])
const currentIndex = ref(0)
const current = ref(null)
const stageName = ref('')
const isAnimating = ref(false)
const loserIndex = ref(null)
const winnerIndex = ref(null)
const previewIdol = ref(null)
const goHome = () => { window.location.href = '/' }
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5)
const updateStageName = (count) => {
  if (count === 2) stageName.value = 'Finał'
  else if (count === 4) stageName.value = 'Półfinał'
  else if (count === 8) stageName.value = 'Ćwierćfinał'
  else stageName.value = `1/${count / 2}`
}
const initTournament = (data) => {
  const shuffled = shuffle(data)
  const N = shuffled.length
  if (N < 2) return
  const P = Math.pow(2, Math.floor(Math.log2(N)))
  if (N === P) {
    contestants.value = shuffled
    updateStageName(N)
  } else {
    const matchesNeeded = N - P
    const playersInRound1 = matchesNeeded * 2
    contestants.value = shuffled.slice(0, playersInRound1)
    winners.value = shuffled.slice(playersInRound1)
    stageName.value = 'Eliminacje'
  }
}

const fetchContestants = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/contestants')
    const data = await response.json()
    const path = decodeURI(window.location.pathname.substring(1)).toLowerCase()
    if (path && path !== 'index.html') {
      const found = data.find(idol => idol.name.toLowerCase() === path)
      if (found) {
        previewIdol.value = found
        return
      }
    }
    initTournament(data)
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchContestants()
})

const closerLook = (clicked) => {
  console.log(clicked)
  current.value = clicked
}

const selectWinner = () => {
  if (!current.value || isAnimating.value) return

  isAnimating.value = true
  const leftCard = contestants.value[currentIndex.value]
  if (current.value === leftCard) {
    winnerIndex.value = currentIndex.value  
    loserIndex.value = currentIndex.value + 1    
  } else {
    winnerIndex.value = currentIndex.value + 1   
    loserIndex.value = currentIndex.value       
  }
  setTimeout(() => {
    winners.value.push(current.value)
    current.value = null
    currentIndex.value += 2 

    if (currentIndex.value >= contestants.value.length) {
      if (winners.value.length === 1) {
        contestants.value = winners.value
        stageName.value = 'Zwycięzca!'
        isAnimating.value = false
        return
      }

      contestants.value = shuffle(winners.value)
      winners.value = []
      currentIndex.value = 0
      updateStageName(contestants.value.length)
    }
    loserIndex.value = null
    winnerIndex.value = null
    isAnimating.value = false

  }, 500) 
}
</script>

<template>
  <div class="relative h-screen flex flex-col p-6 box-border bg-gray-900">
    
    <div v-if="previewIdol" class="flex flex-col items-center justify-center h-full">
      <div class="absolute top-6 left-8 bg-gray-800 border border-gray-700 px-6 py-2 rounded-full shadow-lg z-50">
        <span class="text-amber-400 font-bold text-xl uppercase tracking-widest">Tryb Debugowania: {{ previewIdol.name }}</span>
      </div>

      <div class="w-[520px] max-w-md h-[720px]">
        <ProfileCard :idol="previewIdol" class="w-full h-full cursor-default hover:scale-100" />
      </div>

      <button 
        @click="goHome" 
        class="mt-12 px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full transition-colors uppercase tracking-widest text-sm"
      >
        Wróć do turnieju
      </button>
    </div>

    <template v-else>
      <div v-if="stageName" class="absolute top-6 left-8 bg-gray-800 border border-gray-700 px-6 py-2 rounded-full shadow-lg z-50">
        <span class="text-emerald-400 font-bold text-xl uppercase tracking-widest">{{ stageName }}</span>
        <span v-if="stageName !== 'Zwycięzca!'" class="text-gray-400 ml-2 text-sm font-medium">
          (Mecz {{ (currentIndex / 2) + 1 }} / {{ contestants.length / 2 }})
        </span>
      </div>

      <div v-if="contestants.length > 1" class="flex flex-col items-center h-full pt-12">
        
        <div class="flex-1 w-full max-w-6xl flex gap-8 items-center justify-center min-h-0">
          
          <ProfileCard 
            :idol="contestants[currentIndex]" 
            @click="closerLook(contestants[currentIndex])"
            class="flex-1 transition-all duration-500 ease-out"
            :class="{
              'opacity-0 scale-75 pointer-events-none blur-sm': loserIndex === currentIndex,
              'scale-105 ring-4 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] z-20': winnerIndex === currentIndex,
              'opacity-100': loserIndex !== currentIndex
            }"
          />
          
          <div class="text-3xl font-black italic text-gray-400 shrink-0 mx-4 transition-opacity duration-500" :class="isAnimating ? 'opacity-0' : 'opacity-100'">VS</div>
          
          <ProfileCard 
            :idol="contestants[currentIndex + 1]" 
            @click="closerLook(contestants[currentIndex + 1])"
            class="flex-1 transition-all duration-500 ease-out"
            :class="{
              'opacity-0 scale-75 pointer-events-none blur-sm': loserIndex === currentIndex + 1,
              'scale-105 ring-4 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] z-20': winnerIndex === currentIndex + 1,
              'opacity-100': loserIndex !== currentIndex + 1
            }"
          />
        </div>
        
        <button 
          :disabled="!current || isAnimating"
          @click="selectWinner"
          class="mt-8 shrink-0 px-12 py-4 text-white font-extrabold text-xl uppercase tracking-wider rounded-full shadow-lg transform transition-all duration-200"
          :class="current && !isAnimating ? 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-xl hover:-translate-y-1 active:scale-95' : 'bg-gray-700 opacity-50 cursor-not-allowed'"
        >
          Wybierz <span v-if="current">{{ current.name }}</span>
        </button>
        
      </div>

      <div v-else-if="contestants.length === 1 && stageName === 'Zwycięzca!'" class="flex flex-col items-center justify-center h-full">
        <h1 class="text-5xl font-black text-emerald-400 mb-12 uppercase tracking-widest animate-bounce">{{ contestants[0].name }}</h1>
        <div class="w-full max-w-md h-[600px]">
          <ProfileCard :idol="contestants[0]" class="w-full h-full shadow-[0_0_50px_rgba(16,185,129,0.5)] border-4 border-emerald-500 cursor-default hover:scale-100" />
        </div>
      </div>
      
      <div v-else class="h-full flex items-center justify-center text-2xl text-gray-500 font-bold animate-pulse">
        Czekaj pls
      </div>
    </template>
    
  </div>
</template>