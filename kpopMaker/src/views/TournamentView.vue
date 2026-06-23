<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router' 
import ProfileCard from '../components/ProfileCard.vue'
import TournamentSidebar from '../components/TournamentSidebar.vue'
import WinnerSummary from '../components/WinnerSummary.vue'

const route = useRoute()   
const router = useRouter()

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

const goHome = () => { 
  localStorage.removeItem('kpop_tournament_state')
  window.location.href = '/'
}

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

const saveTournamentState = () => {
  const state = {
    contestants: contestants.value,
    winners: winners.value,
    points: points.value,
    currentIndex: currentIndex.value,
    stageName: stageName.value,
    initialGroupCounts: initialGroupCounts.value
  }
  localStorage.setItem('kpop_tournament_state', JSON.stringify(state))
}

const fetchContestants = async () => {
  try {
    const response = await fetch('/api/contestants')
    const data = await response.json()
    const path = decodeURI(route.path.substring(1)).toLowerCase()
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
      if (import.meta.env.DEV) return;
      const cloudName = import.meta.env.VITE_CLOUD_NAME || 'dur68snjw'
      
      data.forEach(idol => {
        if (idol.images && idol.images.length > 0) {
          const img = new Image()
          const pathParts = idol.images[0].replaceAll('\\', '/').split('/')
          let fileName = pathParts[pathParts.length - 1].replaceAll(' ', '_')
          
          const isGif = fileName.toLowerCase().split('?')[0].endsWith('.gif')
          if (isGif) {
            img.src = `https://res.cloudinary.com/${cloudName}/image/upload/${fileName}`
          } else {
            img.src = `https://res.cloudinary.com/${cloudName}/image/upload/w_800,c_fill,g_auto,ar_3:4,f_auto,q_auto/${fileName}`
          }
        }
      })
    }, 1000)
    const savedState = localStorage.getItem('kpop_tournament_state')
    if (savedState) {
      const parsed = JSON.parse(savedState)
      contestants.value = parsed.contestants
      winners.value = parsed.winners
      points.value = parsed.points
      currentIndex.value = parsed.currentIndex
      stageName.value = parsed.stageName
      initialGroupCounts.value = parsed.initialGroupCounts
    } else {
      initTournament(data)
      saveTournamentState()
    }
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
    saveTournamentState()
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
      <div class="hidden min-[1710px]:block">
        <TournamentSidebar 
          v-if="stageName !== 'Zwycięzca!'"
          :stage-name="stageName"
          :current-index="currentIndex"
          :contestants="contestants"
          :group-stats="groupStats"
          :points="points"
        />
      </div>

      <div v-if="stageName && stageName !== 'Zwycięzca!'" class="min-[1710px]:hidden w-full flex justify-center pt-2 md:pt-6 shrink-0 z-10 px-2">
        <div class="bg-gray-800 border border-gray-700 px-4 md:px-6 py-2 rounded-full shadow-lg flex items-center gap-2 md:gap-3">
          
          <span class="text-emerald-400 font-bold text-sm md:text-lg uppercase tracking-widest">{{ stageName }}</span>
          
          <div class="h-4 w-px bg-gray-600"></div>
          
          <span class="text-gray-400 text-xs md:text-sm font-medium whitespace-nowrap">
            {{ (currentIndex / 2) + 1 }} / {{ contestants.length / 2 }}
          </span>

          <div class="h-4 w-px bg-gray-600"></div>
          
          <router-link 
            to="/ranking" 
            class="text-gray-400 hover:text-emerald-400 text-xs md:text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Ranking
          </router-link>

        </div>
      </div>

      <div v-if="contestants.length > 1" class="flex flex-col items-center h-full pt-4 lg:pt-12 pb-4 min-h-0 w-full px-4 lg:px-0">
        
        <div class="flex-1 w-full max-w-7xl flex flex-col lg:flex-row gap-4 lg:gap-8 items-center justify-center min-h-0">
          
          <ProfileCard 
            :key="contestants[currentIndex].id"
            ref="leftCardRef"
            :idol="contestants[currentIndex]" 
            @click="closerLook(contestants[currentIndex])"
            class="flex-1 w-full min-h-0 aspect-[4/5] lg:aspect-[3/4] max-w-[320px] sm:max-w-[400px] lg:max-w-md xl:max-w-lg transition-all duration-500 ease-out"
            :class="{
              'opacity-0 scale-75 pointer-events-none blur-sm': loserIndex === currentIndex,
              'scale-105 ring-4 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] z-20': winnerIndex === currentIndex,
              'opacity-100': loserIndex !== currentIndex,
              'ring-4 ring-emerald-300 scale-[1.02] shadow-[0_0_30px_rgba(251,191,36,0.4)] z-10': current === contestants[currentIndex] && !isAnimating
            }"
          />
          
          <div class="text-2xl lg:text-4xl font-black italic text-gray-400 shrink-0 transition-opacity duration-500" :class="isAnimating ? 'opacity-0' : 'opacity-100'">VS</div>
          
          <ProfileCard
            :key="contestants[currentIndex + 1].id"
            ref="rightCardRef"
            :idol="contestants[currentIndex + 1]" 
            @click="closerLook(contestants[currentIndex + 1])"
            class="flex-1 w-full min-h-0 aspect-[4/5] lg:aspect-[3/4] max-w-[320px] sm:max-w-[400px] lg:max-w-md xl:max-w-lg transition-all duration-500 ease-out"
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
          class="mt-6 md:mt-8 shrink-0 px-8 md:px-12 py-3 md:py-4 text-white font-extrabold text-base md:text-xl uppercase tracking-wider rounded-full shadow-lg transform transition-all duration-200"
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