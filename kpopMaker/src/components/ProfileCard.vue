<script setup>
defineProps({
  idol: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="relative w-96 overflow-hidden shadow-xl cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl">
    
    <img 
      v-if="idol.images && idol.images.length > 0"
      :src="idol.images[0]" 
      :alt="idol.name" 
      class="w-full h-full object-cover"
    />
    
    <div class="absolute bottom-0 w-full p-2">
      <h2 class="text-2xl font-bold text-white">{{ idol.name }} ({{ idol.group }})</h2>
        <ul class="text-white">
          <li>
            a
          </li>
          <li>
            b
          </li>
        </ul>
    </div>

  </div>
</template>