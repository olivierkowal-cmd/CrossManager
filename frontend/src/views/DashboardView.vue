<script setup>
import { computed } from "vue"

import { useRaceStore } from "../stores/raceStore"
import { useRaceManagerStore } from "../stores/raceManagerStore"
import { useScannerStore } from "../stores/scannerStore"

import StatCard from "../components/dashboard/StatCard.vue"
import RaceOverviewCard from "../components/dashboard/RaceOverviewCard.vue"

const raceStore = useRaceStore()
const raceManager = useRaceManagerStore()
const scannerStore = useScannerStore()

const participants = computed(() => raceStore.participants.length)

const totalCourses = computed(() => raceManager.races.length)

const running = computed(() => {

  return raceManager.getRunningRace() ? 1 : 0

})

const waiting = computed(() =>
  raceManager.getWaitingRaces().length
)

const finished = computed(() =>
  raceManager.getFinishedRaces().length
)

const arrivals = computed(() =>
  scannerStore.totalScans
)

const lastArrival = computed(() =>
  scannerStore.lastArrival ?? null
)

const races = computed(() => raceManager.races)
</script>

<template>

<section class="space-y-8">

<div class="rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-700 p-8 text-white shadow-xl">

  <p class="uppercase tracking-[0.35em] text-sky-100 text-sm font-semibold">
    CrossManager
  </p>

  <h1 class="mt-3 text-5xl font-black">
    🏁 Bienvenue
  </h1>

  <p class="mt-4 text-xl">
    {{ raceStore.settings.schoolName || "Nom de l'établissement" }}
  </p>

  <p class="text-sky-100">
    {{ raceStore.settings.eventName || "Nom de l'événement" }}
  </p>

</div>

<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

<StatCard

title="Participants"

:value="participants"

icon="👥"

color="sky"

/>

<StatCard

title="Courses"

:value="totalCourses"

icon="🏁"

color="green"

/>

<StatCard

title="Arrivées"

:value="arrivals"

icon="🏃"

color="purple"

/>

<StatCard

title="En cours"

:value="running"

icon="🟢"

color="orange"

/>

</div>

<div class="grid gap-6 xl:grid-cols-[2fr_1fr]">

<div class="space-y-5">

<RaceOverviewCard

v-for="race in races"

:key="race.id"

:race="race"

/>

</div>

<div class="space-y-6">

<div
class="rounded-3xl border bg-white p-6 shadow-sm"
>

<h2 class="text-2xl font-bold">

Statistiques

</h2>

<div class="mt-6 space-y-4">

<div class="flex justify-between">

<span>En attente</span>

<strong>{{ waiting }}</strong>

</div>

<div class="flex justify-between">

<span>En cours</span>

<strong>{{ running }}</strong>

</div>

<div class="flex justify-between">

<span>Terminées</span>

<strong>{{ finished }}</strong>

</div>

<div class="flex justify-between">

<span>Arrivées</span>

<strong>{{ arrivals }}</strong>

</div>

</div>

</div>

<div
class="rounded-3xl border bg-white p-6 shadow-sm"
>

<h2 class="text-2xl font-bold">

Dernière arrivée

</h2>

<div
v-if="lastArrival"
class="mt-6"
>

<p
class="text-3xl font-black text-green-700"
>

✓ {{ lastArrival.participant.prenom }}

{{ lastArrival.participant.nom }}

</p>

<p class="mt-2">

{{ lastArrival.participant.categorie }}

</p>

<p class="mt-4">

Position :

<strong>

{{ lastArrival.position }}

</strong>

</p>

<p>

Scanner :

<strong>

{{ lastArrival.scanner }}

</strong>

</p>

</div>

<div
v-else
class="py-16 text-center text-slate-400"
>

<div class="text-6xl">

🏁

</div>

<p class="mt-4">

Aucune arrivée enregistrée

</p>

</div>

</div>

</div>

</div>

</section>

</template>