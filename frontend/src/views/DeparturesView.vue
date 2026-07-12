<script setup>
import { useRaceStore } from '../stores/raceStore'

const raceStore = useRaceStore()
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">Départs</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">Gestion des départs</h2>
      <p class="mt-3 text-sm text-slate-500">Vue de préparation et de contrôle des coureurs au départ.</p>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="text-sm font-semibold text-slate-700">Course prête</p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">{{ raceStore.participantCount }} coureurs</p>
        </div>
        <div class="rounded-2xl bg-sky-50 p-4">
          <p class="text-sm font-semibold text-sky-700">État du départ</p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">{{ raceStore.timer.started ? 'En cours' : 'À venir' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
