<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ProfileCard from '../components/ProfileCard.vue'
import { handleFetchError } from '../utils/errorHandler'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const idol = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('/api/contestants')
    await handleFetchError(response, t)
    const data = await response.json()
    const nameFromUrl = decodeURI(route.path.substring(1)).toLowerCase()
    idol.value = data.find(i => i.name.toLowerCase() === nameFromUrl)
  } catch (error) {
    console.error(t('idolProfile.fetchError'), error)
  } finally {
    isLoading.value = false
  }
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 overflow-hidden">

    <div v-if="isLoading" class="text-emerald-400 animate-pulse text-xl font-bold">
      {{ $t('idolProfile.loading') }}
    </div>

    <div v-else-if="idol" class="flex flex-col items-center w-full">
      <div class="w-full max-w-[400px] sm:max-w-[480px] h-[70vh] min-h-[500px] max-h-[800px] relative">
        <ProfileCard
          :idol="idol"
          :staticMode="true"
          class="w-full h-full cursor-default shadow-2xl"
        />
      </div>

      <button
        @click="goBack"
        class="mt-8 sm:mt-12 px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full transition-colors uppercase tracking-widest text-sm shadow-lg hover:-translate-y-1"
      >
        {{ $t('idolProfile.back') }}
      </button>
    </div>

    <div v-else class="text-red-400 text-xl font-bold">
      {{ $t('idolProfile.notFound') }}
    </div>

  </div>
</template>