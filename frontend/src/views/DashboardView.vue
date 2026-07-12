<script setup>
// Vue du tableau de bord avec résumé et accès rapide aux modules.
import { computed } from 'vue'
import { useRaceStore } from '../stores/raceStore'
import Timer from '../components/Timer.vue'
import MenuCard from '../components/MenuCard.vue'
import ArrivalList from '../components/ArrivalList.vue'

const raceStore = useRaceStore()

const summaryCards = computed(() => [
  { label: 'Participants', value: raceStore.participantCount, accent: 'sky' },
  { label: 'Arrivées', value: raceStore.arrivalCount, accent: 'emerald' },
])
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-3xl bg-gradient-to-br from-sky-700 to-blue-900 p-6 text-white shadow-xl">
      <p class="text-sm uppercase tracking-[0.3em] text-sky-100">Vue d’ensemble</p>
      <h2 class="mt-3 text-3xl font-semibold">CrossManager prêt pour votre course</h2>
      <p class="mt-2 max-w-2xl text-sm text-sky-100">
        Supervision complète de la course avec un tableau de bord clair et des modules dédiés.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="card in summaryCards" :key="card.label" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="mt-3 text-3xl font-semibold text-slate-900">{{ card.value }}</p>
      </div>
      <div class="md:col-span-2 xl:col-span-2">
        <Timer />
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div class="grid gap-4 sm:grid-cols-2">
        <MenuCard title="Téléphone maître" description="Pilotage de la course" icon="📱" to="/master-phone" />
        <MenuCard title="Scanner" description="Validation des participants" icon="📷" to="/scanner" />
        <MenuCard title="Écran TV" description="Affichage public" icon="📺" to="/tv-screen" />
        <MenuCard title="Participants" description="Liste et statuts" icon="👥" to="/participants" />
      </div>
      <ArrivalList :arrivals="raceStore.arrivals" />
    </div>
  </section>
</template>
