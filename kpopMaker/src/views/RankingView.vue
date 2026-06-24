<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { handleFetchError } from '../utils/errorHandler'

const { t } = useI18n()
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
    await handleFetchError(response, t)

    const freshData = await response.json()
    rankingList.value = freshData
    sessionStorage.setItem('kpop_ranking_cache', JSON.stringify(freshData))
  } catch (error) {
    console.error(t('ranking.refreshFailed'), error)
  } finally {
    isLoading.value = false
  }
}

const getRankColor = (index) => {
  if (index === 0) return 'text-yellow-400'
  if (index === 1) return 'text-gray-300'
  if (index === 2) return 'text-amber-600'
  return 'text-emerald-500'
}

onMounted(() => {
  fetchRanking()
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 p-8 font-sans">

    <div class="max-w-4xl mx-auto">
      <router-link to="/" class="text-emerald-400 hover:text-emerald-300 font-bold text-sm tracking-wide transition-colors duration-200 mb-8 inline-block">
        &larr; {{ $t('ranking.backToGame') }}
      </router-link>

      <div class="mb-10 text-center">
        <h1 class="text-4xl md:text-5xl font-black text-white uppercase tracking-widest mb-2">
          {{ $t('ranking.title') }}
        </h1>
        <p class="text-gray-400 text-lg">{{ $t('ranking.description') }}</p>
      </div>

      <div v-if="isLoading" class="text-center text-gray-400 text-xl animate-pulse font-bold mt-20">
        {{ $t('ranking.loading') }}
      </div>

      <div v-else class="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">

        <div class="divide-y divide-gray-700/50">
          <router-link
            v-for="(idol, index) in rankingList"
            :key="idol.id"
            :to="`/${idol.name.toLowerCase()}`"
            class="flex items-center justify-between p-5 md:px-8 hover:bg-gray-700/50 transition-colors duration-200 group cursor-pointer"
          >
            <div class="flex items-center gap-6">
              <span
                class="font-black text-2xl md:text-3xl w-10 text-center"
                :class="getRankColor(index)"
              >
                #{{ index + 1 }}
              </span>

              <div class="flex flex-col">
                <span class="text-xl font-bold text-gray-100 group-hover:text-emerald-400 transition-colors">
                  {{ idol.name }}
                </span>
                <span class="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {{ idol.group }}
                </span>
              </div>
            </div>

            <div class="flex flex-col items-end">
              <div class="bg-gray-900 border border-gray-700 group-hover:border-emerald-500/50 px-4 py-2 rounded-lg transition-colors">
                <span class="text-lg font-black text-white">{{ idol.totalPoints }}</span>
                <span class="text-xs font-bold text-gray-400 ml-1">{{ $t('ranking.pointsLabel') }}</span>
              </div>
            </div>
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>