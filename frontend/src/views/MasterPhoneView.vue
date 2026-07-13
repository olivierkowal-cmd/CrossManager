<script setup>
import { computed, ref } from "vue"
import { useRaceManagerStore } from "../stores/raceManagerStore"
import { useRaceStore } from "../stores/raceStore"

import RaceCard from "../components/departures/RaceCard.vue"
import CountdownModal from "../components/departures/CountdownModal.vue"

const raceManager = useRaceManagerStore()
const raceStore = useRaceStore()

const showCountdown = ref(false)
const countdownValue = ref("")
const currentRace = ref(null)

const races = computed(() => {

  return raceManager.races.map((race) => ({

    ...race,

    participants: raceStore.participants.filter(
      (p) => p.categorie === race.categorie
    ).length,

  }))

})

const waiting = computed(() =>
  races.value.filter(r => r.status === "waiting").length
)

const running = computed(() =>
  races.value.filter(r => r.status === "running").length
)

const finished = computed(() =>
  races.value.filter(r => r.status === "finished").length
)

async function start(categorie) {

  const race = races.value.find(r => r.categorie === categorie)

  if (!race) return

  currentRace.value = race

  showCountdown.value = true

  raceManager.startCountdown(categorie)

  for (const value of [3,2,1]){

    countdownValue.value = value

    await new Promise(resolve=>setTimeout(resolve,1000))

  }

  countdownValue.value="GO !"

  raceManager.startRace(categorie)

  await new Promise(resolve=>setTimeout(resolve,1000))

  showCountdown.value=false

}
</script>

<template>

<section class="space-y-8">

<div class="rounded-3xl bg-slate-950 p-8 text-white">

<p class="text-sky-400 uppercase tracking-[0.4em] font-bold">

ISM Rèves

</p>

<h1 class="mt-3 text-4xl font-black">

Téléphone maître

</h1>

<p class="mt-3 text-slate-300">

Pilotage des départs

</p>

<div class="mt-8 grid gap-4 md:grid-cols-3">

<div class="rounded-2xl bg-slate-900 p-5">

<p class="text-slate-400">

En attente

</p>

<p class="mt-2 text-5xl font-black text-yellow-400">

{{ waiting }}

</p>

</div>

<div class="rounded-2xl bg-slate-900 p-5">

<p class="text-slate-400">

En cours

</p>

<p class="mt-2 text-5xl font-black text-green-400">

{{ running }}

</p>

</div>

<div class="rounded-2xl bg-slate-900 p-5">

<p class="text-slate-400">

Terminées

</p>

<p class="mt-2 text-5xl font-black text-blue-400">

{{ finished }}

</p>

</div>

</div>

</div>

<div class="grid gap-6 lg:grid-cols-2">

<RaceCard

v-for="race in races"

:key="race.id"

:race="race"

@start="start"

/>

</div>

<CountdownModal

:visible="showCountdown"

:title="currentRace?.label"

:participants="currentRace?.participants ?? 0"

:value="countdownValue"

/>

</section>

</template>