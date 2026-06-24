<script setup>
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const availableLocales = [
  { code: 'en', label: 'English' },
  { code: 'pl', label: 'Polski' }
]

const storageKey = 'kpop_i18n_locale'

const setLocale = (newLocale) => {
  if (availableLocales.some((item) => item.code === newLocale)) {
    locale.value = newLocale
  }
}

onMounted(() => {
  const savedLocale = window.localStorage.getItem(storageKey)
  if (savedLocale && availableLocales.some((item) => item.code === savedLocale)) {
    locale.value = savedLocale
  } else {
    locale.value = 'pl'
  }
})

watch(locale, (newLocale) => {
  window.localStorage.setItem(storageKey, newLocale)
})
</script>

<template>
  <div class="inline-flex rounded-full border border-gray-700 bg-gray-800/90 p-1 shadow-lg backdrop-blur">
    <button
      v-for="item in availableLocales"
      :key="item.code"
      type="button"
      class="rounded-full px-3 py-1.5 text-sm font-semibold transition-all"
      :class="locale === item.code ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'"
      @click="setLocale(item.code)"
    >
      {{ item.label }}
    </button>
  </div>
</template>
