<script setup>
import { ref,watch } from 'vue'

const props = defineProps({
  idol: {
    type: Object,
    required: true
  }
})
watch(() => props.idol, () => {
  currentIndex.value = 0
})
const currentIndex = ref(0)
const nextImage = () => {
  if (props.idol.images && props.idol.images.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % props.idol.images.length
  }
}

const prevImage = () => {
  if (props.idol.images && props.idol.images.length > 0) {
    currentIndex.value = (currentIndex.value - 1 + props.idol.images.length) % props.idol.images.length
  }
}
</script>

<template>
  <div class="relative w-full h-full rounded-2xl overflow-hidden shadow-xl cursor-pointer transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl bg-gray-800"> 
    <img 
      v-if="idol.images && idol.images.length > 0"
      :src="idol.images[currentIndex]" 
      :alt="idol.name" 
      class="w-full h-full object-cover select-none"
    />
    
    <div v-else class="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
      <span class="text-white text-7xl font-black opacity-20">
        {{ idol.name ? idol.name.charAt(0).toUpperCase() : '?' }}
      </span>
    </div>
    
    <div v-if="idol.images && idol.images.length > 1" class="absolute inset-0 flex justify-between">
      <div 
        class="w-1/3 h-full z-10 bg-gradient-to-r from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" 
        @click.stop="prevImage"
      ></div>
      <div 
        class="w-1/3 h-full z-10 bg-gradient-to-l from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" 
        @click.stop="nextImage"
      ></div>
    </div>
    
    <div class="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 z-20 pointer-events-none">
      <p class="text-gray-300 text-sm font-semibold mb-1 uppercase tracking-wider">{{ idol.group }}</p>
      <h2 class="text-white text-3xl font-bold">{{ idol.name }}</h2>
      
      <a 
        v-if="idol.description"
        :href="idol.description" 
        target="_blank" 
        rel="noopener noreferrer"
        class="inline-block mt-2 text-emerald-400 hover:text-emerald-300 font-bold text-sm tracking-wide transition-colors duration-200 pointer-events-auto relative z-20"
        @click.stop
      >
        @ Instagram
      </a>
    </div>

  </div>
</template>