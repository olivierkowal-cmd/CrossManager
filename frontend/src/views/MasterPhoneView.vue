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

const countdownRunning = ref(false)
const flash = ref("")

const races = computed(() => {

  return raceManager.races.map(race => ({

    ...race,

    participants: raceStore.participants.filter(
      participant => participant.categorie === race.categorie
    ).length,

  }))

})

const waiting = computed(() =>
  races.value.filter(
    race => race.status === "waiting"
  ).length
)

const running = computed(() =>
  races.value.filter(
    race => race.status === "running"
  ).length
)

const finished = computed(() =>
  races.value.filter(
    race => race.status === "finished"
  ).length
)

function sleep(ms){

  return new Promise(resolve=>setTimeout(resolve,ms))

}

function beep(power=false){

  try{

    const ctx=new AudioContext()

    const osc=ctx.createOscillator()

    const gain=ctx.createGain()

    osc.frequency.value=power ? 1400 : 900

    gain.gain.value=power ? .35 : .12

    osc.connect(gain)

    gain.connect(ctx.destination)

    osc.start()

    osc.stop(ctx.currentTime+(power?.28:.08))

  }

  catch{}

}

function speak(text){

  if(!("speechSynthesis" in window)) return

  speechSynthesis.cancel()

  const utterance=new SpeechSynthesisUtterance(text)

  utterance.lang="fr-FR"

  utterance.rate=.90

  utterance.pitch=1

  speechSynthesis.speak(utterance)

}

function vibrate(duration=120){

  if(navigator.vibrate){

    navigator.vibrate(duration)

  }

}

async function start(categorie){

  if(countdownRunning.value) return

  countdownRunning.value=true

  const race=races.value.find(
    race=>race.categorie===categorie
  )

  if(!race){

    countdownRunning.value=false

    return

  }

  currentRace.value=race

  showCountdown.value=true

  raceManager.startCountdown(categorie)

  for (const value of [5, 4, 3, 2, 1]) {

  countdownValue.value = value

  flash.value = "blue"

  beep()

  vibrate(70)

  speak(String(value))

  setTimeout(() => {

    flash.value = ""

  }, 180)

  await sleep(1000)

}

countdownValue.value = "GO !"

flash.value = "green"

beep(true)

vibrate([300,120,300])

speak("Partez !")

setTimeout(() => {

  flash.value = ""

}, 900)

  raceManager.startRace(categorie)

  await sleep(1200)

  showCountdown.value=false

  countdownRunning.value=false

}
</script>

<template>

<section class="space-y-8">

  <div class="rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">

    <p class="text-sky-400 uppercase tracking-[0.40em] font-bold">
      ISM RÈVES
    </p>

    <h1 class="mt-3 text-5xl font-black">
      Téléphone maître
    </h1>

    <p class="mt-3 text-slate-300 text-lg">
      Pilotage des départs
    </p>

    <div class="mt-10 grid gap-5 md:grid-cols-3">

      <div class="rounded-3xl bg-slate-900 p-6 text-center">

        <p class="text-slate-400 text-lg">
          En attente
        </p>

        <p class="mt-3 text-6xl font-black text-yellow-400">
          {{ waiting }}
        </p>

      </div>

      <div class="rounded-3xl bg-slate-900 p-6 text-center">

        <p class="text-slate-400 text-lg">
          En cours
        </p>

        <p class="mt-3 text-6xl font-black text-green-400">
          {{ running }}
        </p>

      </div>

      <div class="rounded-3xl bg-slate-900 p-6 text-center">

        <p class="text-slate-400 text-lg">
          Terminées
        </p>

        <p class="mt-3 text-6xl font-black text-blue-400">
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
  :title="currentRace?.categorie"
  :participants="currentRace?.participants ?? 0"
  :value="countdownValue"
  :flash="flash"
/>

</section>

</template>