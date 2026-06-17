<script setup>
import { ref } from 'vue'
import ProfileCard from './ProfileCard.vue'
import html2canvas from 'html2canvas'

const props = defineProps({
  contestant: {
    type: Object,
    required: true
  },
  points: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['go-home'])
const summaryScreenRef = ref(null)
const winnerCardRef = ref(null)
const playerName = ref('')
const getRank = (index) => {
  if (index === 7) return '1'
  if (index === 6) return '2'
  if (index >= 4) return '3-4'
  return '5-8'
}
const cycleWinnerImage = () => {
  winnerCardRef.value?.nextImage()
}

const handleDownload = async () => {
  if (!playerName.value.trim()) {
    alert("Wpisz swoje imię, żeby pobrać wynik!")
    return
  }

  if (!summaryScreenRef.value) return
  
  try {
    const canvas = await html2canvas(summaryScreenRef.value, {
      useCORS: true,
      backgroundColor: '#111827',
      scale: 2
    })
    const safeName = playerName.value.trim().replaceAll(' ', '_')
    
    const link = document.createElement('a')
    link.download = `${safeName}-kpop.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error("Nie udało się zrobić screena:", error)
  }
}

const handleGoHome = () => {
  emit('go-home')
}
defineExpose({
  cycleWinnerImage
})
</script>

<template>
  <div class="flex flex-col items-center justify-start min-h-full w-full bg-gray-900 overflow-y-auto pt-10 pb-20 px-4">
    
    <h1 class="text-5xl font-black text-emerald-400 mb-12 uppercase tracking-widest animate-bounce mt-4">
      {{ contestant.name }}
    </h1>

    <div class="w-full max-w-sm h-[500px] mb-12 shrink-0">
      <ProfileCard
        ref="winnerCardRef"
        :idol="contestant"
        class="w-full h-full shadow-[0_0_50px_rgba(16,185,129,0.5)] border-4 border-emerald-500 cursor-default hover:scale-100"
      />
    </div>

    <div ref="summaryScreenRef" class="w-full max-w-2xl bg-gray-800/95 border border-gray-700 p-6 rounded-xl shadow-xl backdrop-blur-sm mb-8">
      <h2 class="text-emerald-400 font-bold text-xl uppercase tracking-widest mb-4 text-center">Końcowy Ranking</h2>
      <ul class="flex flex-col gap-2">
        <li v-for="(cont, index) in points" :key="cont.name" class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <span class="text-emerald-500 font-bold text-lg mr-4 w-12">#{{ getRank(index) }}</span>
          <span class="text-gray-200 font-semibold flex-1">{{ cont.name }}</span>
          <span class="text-gray-400 text-sm ml-4">{{ cont.group }}</span>
        </li>
      </ul>
    </div>

    <div class="flex flex-col items-center gap-4 mt-4" data-html2canvas-ignore="true">
      
      <input 
        v-model="playerName"
        type="text" 
        placeholder="Wpisz swoje imię..." 
        class="w-full max-w-xs px-6 py-3 bg-gray-800 border-2 border-gray-700 focus:border-emerald-500 rounded-full text-white outline-none text-center transition-colors font-semibold tracking-wider placeholder-gray-500 shadow-inner"
      />

      <div class="flex gap-4">
        <button
          @click="handleDownload"
          :disabled="!playerName.trim()"
          class="px-8 py-4 text-white font-bold rounded-full transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          :class="playerName.trim() ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-600'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Pobierz Wyniki
        </button>
        <button
          @click="handleGoHome"
          class="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full transition-colors uppercase tracking-widest text-sm shadow-lg"
        >
          Wróć do turnieju
        </button>
      </div>
      
    </div>
  </div>
</template>