<script setup>
import { ref } from 'vue'

const props = defineProps({
  tour: {
    type: Object,
    required: true
  },
  isPending: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['updateStatus', 'deleteTour'])
const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <tr 
    @click="toggleExpand"
    class="hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer border-b border-gray-700/50"
    :class="{ 'bg-gray-700/20': isExpanded }"
  >
    <td class="px-6 py-4">
      <div class="flex items-center gap-3">
        <svg 
          :class="{'rotate-90': isExpanded}" 
          class="w-5 h-5 text-gray-500 transition-transform duration-200 shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        <span class="font-bold text-gray-200 text-lg truncate">
          {{ tour.playerName }}
        </span>
      </div>
    </td>
    <td class="px-6 py-4 text-gray-400 font-medium">
      {{ formatDate(tour.createdAt) }}
    </td>
    
    <td class="px-6 py-4 text-center" v-if="isPending">
      <button 
        @click.stop="emit('updateStatus', tour.id)"
        class="w-full px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 hover:border-emerald-500 font-bold rounded-lg transition-all shadow-sm"
      >
        ✓ Dodaj
      </button>
    </td>
    
    <td class="px-6 py-4 text-center">
      <button 
        @click.stop="emit('deleteTour', tour.id)"
        class="w-full px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 hover:border-red-500 font-bold rounded-lg transition-all shadow-sm"
      >
        ✗ Usuń
      </button>
    </td>
  </tr>

  <tr v-if="isExpanded" class="bg-gray-800/80 border-b border-gray-700">
    <td :colspan="isPending ? 4 : 3" class="px-14 py-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <router-link 
          v-for="(score, index) in tour.scores" 
          :key="score.id" 
          :to="`/${score.idol.name.toLowerCase()}`"
          class="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800 transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-3">
            <span class="text-emerald-500 font-black text-sm">#{{ index + 1 }}</span>
            <span class="text-gray-200 font-semibold truncate group-hover:text-emerald-400 transition-colors">{{ score.idol.name }}</span>
          </div>
          <span class="bg-gray-700 px-2 py-1 rounded text-xs font-bold text-gray-300">{{ score.points }} pkt</span>
        </router-link>

      </div>
    </td>
  </tr>
</template>