<template>
  <div id="app">
    <!-- Upewnij się, że z-index jest bardzo wysoki -->
    <div class="fixed top-4 right-4 z-[9999]">
      <LanguageSwitcher />
    </div>
    
    <router-view />
  </div>
</template>

<script setup>
import LanguageSwitcher from './components/LanguageSwitcher.vue'
</script>