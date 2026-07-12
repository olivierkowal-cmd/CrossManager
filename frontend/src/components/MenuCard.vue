<script setup>
// Carte de navigation réutilisable pour les modules principaux.
defineProps({
  title: String,
  description: String,
  icon: String,
  to: String,
})
</script>

<template>
  <router-link
    :to="to"
    class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-400 hover:shadow-md"
  >
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-lg font-semibold text-slate-800">{{ title }}</h3>
        <p class="mt-2 text-sm text-slate-500">{{ description }}</p>
      </div>
      <div class="rounded-xl bg-sky-100 p-3 text-sky-700">
        <span class="text-xl">{{ icon }}</span>
      </div>
    </div>
  </router-link>
</template>
