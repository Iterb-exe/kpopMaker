<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ProfileCard from './components/ProfileCard.vue'
import TournamentSidebar from './components/TournamentSidebar.vue'
import WinnerSummary from './components/WinnerSummary.vue'

const contestants = ref([])
const winners = ref([])
const points = ref([])
const currentIndex = ref(0)
const current = ref(null)
const stageName = ref('')
const isAnimating = ref(false)
const loserIndex = ref(null)
const winnerIndex = ref(null)
const previewIdol = ref(null)
const initialGroupCounts = ref({})

const leftCardRef = ref(null)
const rightCardRef = ref(null)
const winnerSummaryRef = ref(null)

const goHome = () => { window.location.href = '/' }

const shuffle = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

const handleKeydown = (event) => {
  if (event.code === 'Space' || event.key === ' ') {
    event.preventDefault() 
    
    if (stageName.value === 'Zwycięzca!') {
      winnerSummaryRef.value?.cycleWinnerImage()
      return
    }

    if (isAnimating.value) return

    if (current.value === contestants.value[currentIndex.value]) {
      leftCardRef.value?.nextImage()
    } else if (current.value === contestants.value[currentIndex.value + 1]) {
      rightCardRef.value?.nextImage()
    }
    return
  }

  if (stageName.value === 'Zwycięzca!' || isAnimating.value) return

  if (event.key === 'ArrowLeft') {
    current.value = contestants.value[currentIndex.value]
  } 
  else if (event.key === 'ArrowRight') {
    current.value = contestants.value[currentIndex.value + 1]
  } 
  else if (event.key === 'Enter') {
    if (current.value) {
      selectWinner()
    }
  }
}

const updateStageName = (count) => {
  if (count === 2) stageName.value = 'Finał'
  else if (count === 4) stageName.value = 'Półfinał'
  else if (count === 8) stageName.value = 'Ćwierćfinał'
  else stageName.value = `1/${count / 2}`
}

const groupStats = computed(() => {
  if (!initialGroupCounts.value || Object.keys(initialGroupCounts.value).length === 0) return []
  const currentCounts = {}
  contestants.value.forEach(idol => {
    if (idol.group) {
      currentCounts[idol.group] = (currentCounts[idol.group] || 0) + 1
    }
  })
  const stats = []
  for (const [group, total] of Object.entries(initialGroupCounts.value)) {
    const current = currentCounts[group] || 0
    if (current > 0) {
      const percentage = Math.round((current / total) * 100)
      stats.push({ group, current, total, percentage })
    }
  }
  return stats
})

const initTournament = (data) => {
  const counts = {}
  data.forEach(idol => {
    if (idol.group) {
      counts[idol.group] = (counts[idol.group] || 0) + 1
    }
  })
  initialGroupCounts.value = counts
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
    const response = await fetch('/api/contestants')
    const data = await response.json()
    const path = decodeURI(window.location.pathname.substring(1)).toLowerCase()
    if (path === 'winner') {
      const shuffled = shuffle(data)
      const debugWinner = shuffled[0]
      contestants.value = [debugWinner]
      points.value = [...shuffled.slice(1, 8), debugWinner]
      stageName.value = 'Zwycięzca!'
      return
    }
    if (path && path !== 'index.html') {
      const found = data.find(idol => idol.name.toLowerCase() === path)
      if (found) {
        previewIdol.value = found
        return
      }
    }
    setTimeout(() => {
      data.forEach(idol => {
        if (idol.images && idol.images.length > 0) {
          const img = new Image()
          const pathParts = idol.images[0].replaceAll('\\', '/').split('/')
          let fileName = pathParts[pathParts.length - 1].replaceAll(' ', '_')
          const cloudName = "dur68snjw"
          img.src = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${fileName}`
        }
      })
    }, 1000)
    initTournament(data)
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchContestants()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const closerLook = (clicked) => {
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
    if (contestants.value.length < 9){
      points.value.push(contestants.value[loserIndex.value])
      if(contestants.value.length == 2){
        points.value.push(contestants.value[winnerIndex.value])
      }
    }
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

const handleGoHome = () => {
  goHome()
}
</script>

<template>
  <div class="relative h-screen flex flex-col p-6 box-border bg-gray-900 overflow-hidden">
    
    <div v-if="previewIdol" class="flex flex-col items-center justify-center h-full">
      <div class="absolute top-6 left-8">
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
      <TournamentSidebar 
        v-if="stageName !== 'Zwycięzca!'"
        :stage-name="stageName"
        :current-index="currentIndex"
        :contestants="contestants"
        :group-stats="groupStats"
        :points="points"
      />

      <div v-if="contestants.length > 1" class="flex flex-col items-center h-full pt-12">
        <div class="flex-1 w-full max-w-6xl flex gap-8 items-center justify-center min-h-0">
          <ProfileCard 
            :key="contestants[currentIndex].id"
            ref="leftCardRef"
            :idol="contestants[currentIndex]" 
            @click="closerLook(contestants[currentIndex])"
            class="flex-1 transition-all duration-500 ease-out"
            :class="{
              'opacity-0 scale-75 pointer-events-none blur-sm': loserIndex === currentIndex,
              'scale-105 ring-4 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] z-20': winnerIndex === currentIndex,
              'opacity-100': loserIndex !== currentIndex,
              'ring-4 ring-emerald-300 scale-[1.02] shadow-[0_0_30px_rgba(251,191,36,0.4)] z-10': current === contestants[currentIndex] && !isAnimating
            }"
          />
          
          <div class="text-3xl font-black italic text-gray-400 shrink-0 mx-4 transition-opacity duration-500" :class="isAnimating ? 'opacity-0' : 'opacity-100'">VS</div>
          
          <ProfileCard
            :key="contestants[currentIndex + 1].id"
            ref="rightCardRef"
            :idol="contestants[currentIndex + 1]" 
            @click="closerLook(contestants[currentIndex + 1])"
            class="flex-1 transition-all duration-500 ease-out"
            :class="{
              'opacity-0 scale-75 pointer-events-none blur-sm': loserIndex === currentIndex + 1,
              'scale-105 ring-4 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] z-20': winnerIndex === currentIndex + 1,
              'opacity-100': loserIndex !== currentIndex + 1,
              'ring-4 ring-emerald-300 scale-[1.02] shadow-[0_0_30px_rgba(251,191,36,0.4)] z-10': current === contestants[currentIndex + 1] && !isAnimating
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

      <div v-else-if="contestants.length === 1 && stageName === 'Zwycięzca!'" class="flex flex-col items-center justify-center h-full w-full overflow-hidden">
        <WinnerSummary 
          ref="winnerSummaryRef"
          :contestant="contestants[0]"
          :points="points"
          @go-home="handleGoHome"
        />
      </div>
      
      <div v-else class="h-full flex items-center justify-center text-2xl text-gray-500 font-bold animate-pulse">
        Czekaj pls
      </div>
    </template>
  </div>
</template>