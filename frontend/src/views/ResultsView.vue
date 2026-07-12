<script setup>
import { computed } from 'vue'
import { useRaceStore } from '../stores/raceStore'

const raceStore = useRaceStore()
const sortedArrivals = computed(() => [...raceStore.arrivals].slice(0, 5))
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">Résultats</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">Classement temporaire</h2>

      <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 font-semibold text-slate-700">Place</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Nom</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Dossard</th>
              <th class="px-4 py-3 font-semibold text-slate-700">Temps</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="(arrival, index) in sortedArrivals" :key="arrival.id">
              <td class="px-4 py-3 font-semibold text-slate-700">{{ index + 1 }}</td>
              <td class="px-4 py-3">{{ arrival.name }}</td>
              <td class="px-4 py-3">{{ arrival.bib }}</td>
              <td class="px-4 py-3">{{ arrival.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
