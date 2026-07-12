<script setup>
import { computed } from 'vue'
import { useRaceStore } from '../stores/raceStore'
import Timer from '../components/Timer.vue'

const raceStore = useRaceStore()

const statusLabel = computed(() => {
  if (!raceStore.timer.started) return 'Prêt'
  return raceStore.timer.paused ? 'En pause' : 'Course en cours'
})

function handleStart() {
  raceStore.startRace()
}

function handlePause() {
  raceStore.pauseRace()
}

function handleStop() {
  raceStore.stopRace()
}

function handleReset() {
  raceStore.resetRace()
}
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">Téléphone maître</p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-900">Pilotage central</h2>
        </div>
        <div class="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
          {{ statusLabel }}
        </div>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div class="rounded-2xl bg-slate-950 p-6 text-white">
          <p class="text-sm text-slate-400">Chronomètre principal</p>
          <div class="mt-4">
            <Timer />
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p class="text-sm text-slate-500">Contrôles</p>
          <div class="mt-4 grid gap-3">
            <button class="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white" @click="handleStart">Démarrer</button>
            <button class="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700" @click="handlePause">Pause</button>
            <button class="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700" @click="handleStop">Stop</button>
            <button class="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700" @click="handleReset">Réinitialiser</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
