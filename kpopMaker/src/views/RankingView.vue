<script setup>
import { ref, onMounted } from 'vue'

const rankingList = ref([])
const isLoading = ref(true)
const fetchRanking = async () => {
  const cachedRanking = sessionStorage.getItem('kpop_ranking_cache')
  
  if (cachedRanking) {
    rankingList.value = JSON.parse(cachedRanking)
    isLoading.value = false 
  }
  try {
    const response = await fetch('/api/ranking')
    if (!response.ok) throw new Error('Błąd pobierania rankingu')
    const freshData = await response.json()
    rankingList.value = freshData 
    sessionStorage.setItem('kpop_ranking_cache', JSON.stringify(freshData))
  } catch (error) {
    console.error("Nie udało się odświeżyć rankingu w tle:", error)
  } finally {
    isLoading.value = false
  }
}
onMounted(() => {
  fetchRanking()
})
</script>

<template>
  <div style="background-color: white; color: black; padding: 40px; min-height: 100vh; font-family: sans-serif;">
    
    <router-link to="/" style="color: blue; text-decoration: underline; margin-bottom: 20px; display: inline-block;">
      Wróć
    </router-link>

    <div v-if="isLoading" style="margin-top: 20px; font-weight: bold;">
      Łączenie z bazą PostgreSQL...
    </div>

    <div v-else>
      <ol style="margin-top: 20px; font-size: 18px; line-height: 1.6;">
        <li v-for="(idol, index) in rankingList" :key="idol.id" style="margin-bottom: 8px;">
          
          <router-link 
            :to="`/${idol.name.toLowerCase()}`" 
            style="text-decoration: none; color: inherit; display: flex; align-items: center;"
          >
            <strong style="color: blue; text-decoration: underline; margin-right: 8px;">
              {{ idol.name }}
            </strong> 
            
            <span style="color: gray; font-size: 14px; margin-right: 8px;">
              ({{ idol.group }})
            </span> 
            
            <span>
              - Punkty: <strong>{{ idol.totalPoints }}</strong>
            </span>
          </router-link>

        </li>
      </ol>
    </div>
    
  </div>
</template>