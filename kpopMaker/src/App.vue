<script setup>
import { ref,onMounted } from 'vue'
import ProfileCard from './components/ProfileCard.vue'
const contestants = ref([])
const current = ref(null)
const fetchContestants = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/contestants')
    const data = await response.json()
    console.log(data)
    contestants.value=data
  } catch (error) {
    console.error(error)
  }
}
onMounted(() => {
  fetchContestants()
})

const selectWinner = (clicked) => {
  console.log( clicked)
  current.value=clicked
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <div v-if="contestants.length>0" class="flex flex-col items-center justify-center">
    <div class="flex gap-8 items-center">
      
      <ProfileCard 
        :idol="contestants[0]" 
        @click="selectWinner(contestants[0])"
      />
      
      <div class="text-2xl font-black italic">VS</div>
      
      <ProfileCard 
        :idol="contestants[1]" 
        @click="selectWinner(contestants[1])"
      />
      </div>
      
      <button v-if="current!=null" class="m-12 bg-green-800 text-white font-bold text-3xl pb-2 pt-2 pl-4 pr-4">Wybierz</button>
    </div>
    <div v-else class="text-2xl text-gray-500 font-bold">
      Czekaj pls
    </div>
  </div>
  
</template>