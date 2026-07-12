<script setup>
// En-tête commun affiché au-dessus de chaque vue.
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <header class="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-[0.24em] text-sky-600">CrossManager</p>
        <h1 class="text-xl font-semibold text-slate-900">{{ route.meta.title || 'Dashboard' }}</h1>
      </div>
      <div class="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
        Mode course
      </div>
    </div>
  </header>
</template>
