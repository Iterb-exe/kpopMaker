<script setup>
import { ref } from 'vue'
import ProfileCard from './ProfileCard.vue'

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
const winnerCardRef = ref(null)
const playerName = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)

const getRank = (index) => {
  if (index === 7) return '1'
  if (index === 6) return '2'
  if (index >= 4) return '3-4'
  return '5-8'
}

const calculatePoints = (index) => {
  if (index === 7) return 10 
  if (index === 6) return 7  
  if (index >= 4) return 5   
  return 4             
}

const cycleWinnerImage = () => {
  winnerCardRef.value?.nextImage()
}

const handleSubmitResults = async () => {
  if (!playerName.value.trim() || isSubmitting.value) return
  
  isSubmitting.value = true

  const scoresPayload = props.points.map((cont, index) => {
    return {
      idolId: cont.id,
      points: calculatePoints(index)
    }
  })

  try {
    const response = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: playerName.value.trim(),
        scores: scoresPayload
      })
    })

    if (!response.ok) throw new Error("Błąd sieci")
    
    isSuccess.value = true
  } catch (error) {
    console.error("Nie udało się zapisać wyniku:", error)
    alert("Wystąpił błąd podczas zapisywania w bazie danych.")
  } finally {
    isSubmitting.value = false
  }
}

const handleGoHome = () => {
  emit('go-home')
}
defineExpose({ cycleWinnerImage })
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

    <div class="w-full max-w-2xl bg-gray-800/95 border border-gray-700 p-6 rounded-xl shadow-xl backdrop-blur-sm mb-8">
      <h2 class="text-emerald-400 font-bold text-xl uppercase tracking-widest mb-4 text-center">Końcowy Ranking</h2>
      <ul class="flex flex-col gap-2">
        <li v-for="(cont, index) in points" :key="cont.name" class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <span class="text-emerald-500 font-bold text-lg mr-4 w-12">#{{ getRank(index) }}</span>
          <span class="text-gray-200 font-semibold flex-1">{{ cont.name }}</span>
          <span class="text-gray-400 text-sm ml-4">{{ cont.group }}</span>
        </li>
      </ul>
    </div>

    <div class="flex flex-col items-center gap-4 mt-4">
      
      <template v-if="!isSuccess">
        <input 
          v-model="playerName"
          type="text" 
          placeholder="Wpisz się" 
          class="w-full max-w-xs px-6 py-3 bg-gray-800 border-2 border-gray-700 focus:border-emerald-500 rounded-full text-white outline-none text-center transition-colors font-semibold tracking-wider placeholder-gray-500 shadow-inner"
        />

        <div class="flex gap-4">
          <button
            @click="handleSubmitResults"
            :disabled="!playerName.trim() || isSubmitting"
            class="px-8 py-4 text-white font-bold rounded-full transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            :class="playerName.trim() && !isSubmitting ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-600'"
          >
            <svg v-if="!isSubmitting" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            <svg v-else class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ isSubmitting ? 'Wysyłanie...' : 'Wyślij Wynik' }}
          </button>
          
          <button
            @click="handleGoHome"
            class="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full transition-colors uppercase tracking-widest text-sm shadow-lg"
          >
            Wróć do turnieju
          </button>
        </div>
      </template>

      <template v-else>
        <div class="bg-emerald-900/50 border border-emerald-500 text-emerald-400 px-8 py-4 rounded-xl flex flex-col items-center gap-3">
          <span class="font-bold tracking-widest uppercase">Sukces!</span>
          <span class="text-sm text-center">Wynik został wysłany. Po akceptacji trafi do rankingu</span>
        </div>
        <button
            @click="handleGoHome"
            class="mt-4 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full transition-colors uppercase tracking-widest text-sm shadow-lg"
          >
            Wróć do strony głównej
        </button>
      </template>

    </div>
  </div>
</template>