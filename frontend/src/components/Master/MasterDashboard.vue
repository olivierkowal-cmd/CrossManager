<script setup>
import { computed } from "vue"

import { useRaceManagerStore } from "../../stores/raceManagerStore"
import { useRaceStore } from "../../stores/raceStore"

import StatCard from "./StatCard.vue"
import RunningRaceCard from "./RunningRaceCard.vue"

const raceManager = useRaceManagerStore()
const raceStore = useRaceStore()

const waiting = computed(() =>
  raceManager.races.filter(r => r.status === "waiting").length
)

const running = computed(() =>
  raceManager.races.filter(r => r.status === "running").length
)

const finished = computed(() =>
  raceManager.races.filter(r => r.status === "finished").length
)

const arrivals = computed(() =>
  raceManager.races.reduce(
    (total, race) => total + race.arrivals,
    0
  )
)

const progress = computed(() => {

  if (!raceStore.participants.length) {

    return 0

  }

  return Math.round(

    arrivals.value /

    raceStore.participants.length *

    100

  )

})

const runningRaces = computed(() =>
  raceManager.races.filter(
    race => race.status === "running"
  )
)
</script>

<template>

<div class="space-y-6">

  <div class="rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">

    <p class="text-sky-400 font-bold uppercase tracking-[0.40em]">
      Tableau de bord
    </p>

    <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Courses"
        :value="raceManager.races.length"
        :subtitle="`⏳ ${waiting} • 🟢 ${running} • ✅ ${finished}`"
        color="bg-sky-600"
      />

      <StatCard
        title="Participants"
        :value="raceStore.participants.length"
        subtitle="Inscrits"
        color="bg-green-600"
      />

      <StatCard
        title="Arrivées"
        :value="arrivals"
        subtitle="Enregistrées"
        color="bg-violet-600"
      />

      <StatCard
        title="Progression"
        :value="`${progress}%`"
        subtitle="Du cross"
        color="bg-amber-500"
      />

    </div>

  </div>

  <div
    v-if="runningRaces.length"
    class="grid gap-6 lg:grid-cols-2"
  >

    <RunningRaceCard
      v-for="race in runningRaces"
      :key="race.categorie"
      :race="race"
    />

  </div>

</div>

</template>