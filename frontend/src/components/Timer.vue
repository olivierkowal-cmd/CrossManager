<script setup>
// Composant de chronométrage utilisé sur le tableau de bord et le téléphone maître.
import { computed } from 'vue'
import { useRaceStore } from '../stores/raceStore'

const raceStore = useRaceStore()

const displayTime = computed(() => raceStore.timer.elapsed)
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p class="text-sm font-medium text-slate-500">Chronomètre</p>
    <p class="mt-2 text-4xl font-semibold tracking-wider text-sky-700">{{ displayTime }}</p>
    <p class="mt-2 text-sm text-slate-500">
      {{ raceStore.timer.started ? (raceStore.timer.paused ? 'En pause' : 'Course en cours') : 'Prêt à démarrer' }}
    </p>
  </div>
</template>
