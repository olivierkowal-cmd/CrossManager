<script setup>
// Liste réutilisable des arrivées récentes.
defineProps({
  arrivals: Array,
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-slate-800">Arrivées récentes</h3>
      <span class="text-sm text-slate-500">{{ arrivals.length }} éléments</span>
    </div>

    <div v-if="arrivals.length" class="space-y-2">
      <div
        v-for="arrival in arrivals"
        :key="arrival.id"
        class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
      >
        <div>
          <p class="font-medium text-slate-800">{{ arrival.name }}</p>
          <p class="text-sm text-slate-500">Dossard {{ arrival.bib }}</p>
        </div>
        <span class="rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-medium text-emerald-700">
          {{ arrival.time }}
        </span>
      </div>
    </div>

    <p v-else class="text-sm text-slate-500">Aucune arrivée enregistrée.</p>
  </div>
</template>
