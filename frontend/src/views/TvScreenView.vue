<script setup>
import { computed } from 'vue'
import { useRaceStore } from '../stores/raceStore'

const raceStore = useRaceStore()
const topArrivals = computed(() => raceStore.arrivals.slice(0, 4))
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
      <p class="text-sm uppercase tracking-[0.3em] text-sky-400">Écran TV</p>
      <h2 class="mt-3 text-3xl font-semibold">Suivi public en direct</h2>
      <div class="mt-6 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p class="text-sm text-slate-400">Temps de course</p>
          <p class="mt-2 text-5xl font-semibold text-sky-400">{{ raceStore.formatTime(raceStore.timer.elapsed) }}</p>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p class="text-sm text-slate-400">Participants</p>
          <p class="mt-2 text-4xl font-semibold">{{ raceStore.participantCount }}</p>
        </div>
      </div>

      <div class="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p class="text-sm text-slate-400">Dernières arrivées</p>
        <div class="mt-3 space-y-2">
          <div v-for="arrival in topArrivals" :key="arrival.id" class="flex items-center justify-between rounded-xl bg-slate-800 px-3 py-2 text-sm">
            <span>{{ arrival.name }}</span>
            <span class="font-semibold text-sky-300">{{ arrival.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
