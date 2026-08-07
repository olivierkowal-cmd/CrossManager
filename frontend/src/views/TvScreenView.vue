<script setup>
import { computed } from "vue"
import { useRaceManagerStore } from "../stores/raceManagerStore"

const raceManager = useRaceManagerStore()

const runningRace = computed(() =>
  raceManager.races.find(r => r.status === "running")
)

const topArrivals = computed(() =>
  runningRace.value?.results.slice(0, 10) ?? []
)

function formatTime(ms) {

  if (!ms) return "00:00"

  const total = Math.floor(ms / 1000)

  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`

}
</script>

<template>

<section class="space-y-6">

<div class="rounded-3xl bg-slate-950 p-8 text-white">

<p class="uppercase tracking-[0.3em] text-sky-400">
Écran TV
</p>

<h1 class="mt-3 text-4xl font-black">
Classement en direct
</h1>

<div
v-if="runningRace"
class="mt-8"
>

<h2 class="text-3xl font-bold">
{{ runningRace.label }}
</h2>

<p class="text-slate-400">
{{ runningRace.arrivals }} / {{ runningRace.participants }} arrivées
</p>

<div class="mt-8 space-y-3">

<div
v-for="arrival in topArrivals"
:key="arrival.position"
class="flex justify-between rounded-xl bg-slate-900 p-4"
>

<div>

<div class="font-bold">

#{{ arrival.position }}

{{ arrival.participant.prenom }}

{{ arrival.participant.nom }}

</div>

<div class="text-slate-400">

{{ arrival.participant.dossard }}

</div>

</div>

<div class="text-2xl font-bold text-sky-400">

{{ formatTime(arrival.elapsedTime) }}

</div>

</div>

</div>

</div>

<div
v-else
class="mt-12 text-center text-3xl text-slate-400"
>

Aucune course en cours

</div>

</div>

</section>

</template>