<script setup>
defineProps({
  stageName: {
    type: String,
    required: true
  },
  currentIndex: {
    type: Number,
    required: true
  },
  contestants: {
    type: Array,
    required: true
  },
  groupStats: {
    type: Array,
    required: true
  },
  points: {
    type: Array,
    required: true
  }
})

const getRank = (index) => {
  if (index === 7) return '1'
  if (index === 6) return '2'
  if (index >= 4) return '3-4'
  return '5-8'
}
</script>

<template>
  <div v-if="stageName" class="absolute top-6 left-8 z-50 flex flex-col gap-4 max-w-xs w-64">
    
    <div class="bg-gray-800 border border-gray-700 px-6 py-2 rounded-full shadow-lg w-max">
      <span class="text-emerald-400 font-bold text-xl uppercase tracking-widest">{{ stageName }}</span>
      <span v-if="stageName !== 'Zwycięzca!'" class="text-gray-400 ml-2 text-sm font-medium">
        (Mecz {{ (currentIndex / 2) + 1 }} / {{ contestants.length / 2 }})
      </span>
    </div>

    <div
      class="bg-gray-800/95 border border-gray-700 p-4 rounded-xl shadow-xl backdrop-blur-sm overflow-y-auto"
    >
      <ul v-if="stageName !== 'Zwycięzca!' && groupStats.length > 0" class="flex flex-col gap-3">
        <li v-for="stat in groupStats" :key="stat.group" class="flex flex-col">
          <div class="flex justify-between items-end mb-1">
            <span class="text-gray-200 font-semibold text-sm truncate pr-2">{{ stat.group }}</span>
            <span class="text-xs text-gray-400 font-mono whitespace-nowrap">
              {{ stat.current }}/{{ stat.total }} ({{ stat.percentage }}%)
            </span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              class="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
              :style="{ width: stat.percentage + '%' }"
            ></div>
          </div>
        </li>
      </ul>
    </div>

    <router-link 
      to="/ranking"
      class="bg-gray-800/95 border border-gray-700 hover:border-emerald-500 hover:bg-gray-700 text-gray-300 hover:text-emerald-400 p-3 rounded-xl shadow-xl backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-3 font-bold uppercase tracking-wider text-sm group"
    >
      Ranking Globalny
    </router-link>

  </div>
</template>