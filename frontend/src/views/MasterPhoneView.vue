<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from "vue"
import {
  listenScanners,
} from "../services/firestoreService"

import { useRaceManagerStore } from "../stores/raceManagerStore"
import { useRaceStore } from "../stores/raceStore"
import { useEventStore } from "../stores/eventStore"


import RaceCard from "../components/departures/RaceCard.vue"
import CountdownModal from "../components/departures/CountdownModal.vue"
import ScannerStatusCard from "../components/dashboard/ScannerStatusCard.vue"
import StatCard from "../components/dashboard/StatCard.vue"
import EventTimeline from "../components/dashboard/EventTimeline.vue"

import {
  startRaceFirestore,
  finishRaceFirestore,
  resetRaceFirestore,
} from "../services/raceService"

const raceManager = useRaceManagerStore()
const raceStore = useRaceStore()

const scanners = ref({})
const previousScanners = ref({})

let unsubscribeScanners = null
let unsubscribeRaces = null

onMounted(() => {

  unsubscribeScanners = listenScanners((data) => {

    scanners.value = data

    console.log("📱 Scanners reçus :", data)

  })

  unsubscribeRaces = raceManager.startListening()

  console.log("🏁 Écoute Firestore des courses démarrée")

})

onUnmounted(() => {

  if (unsubscribeScanners) {

    unsubscribeScanners()

  }

  if (unsubscribeRaces) {

    unsubscribeRaces()

  }

})

const eventStore = useEventStore()

const showCountdown = ref(false)
const countdownValue = ref("")
const currentRace = ref(null)

const races = computed(() =>

  raceManager.races.map(race => ({

    ...race,

    participants: raceStore.participants.filter(

      p => p.categorie === race.categorie

    ).length,

  }))

)

const waiting = computed(() =>
  races.value.filter(r => r.status === "waiting").length
)

const running = computed(() =>
  races.value.filter(r => r.status === "running").length
)

const finished = computed(() =>
  races.value.filter(r => r.status === "finished").length
)

const events = computed(() =>
  eventStore.events.slice(0, 10)
)

async function start(categorie) {

  const race = races.value.find(
    r => r.categorie === categorie
  )

  if (!race) return

  currentRace.value = race

  showCountdown.value = true

  raceManager.startCountdown(categorie)

  for (const value of [3, 2, 1]) {

    countdownValue.value = value

    await new Promise(resolve =>
      setTimeout(resolve, 1000)
    )

  }

  countdownValue.value = "GO !"

await startRaceFirestore(categorie)

raceManager.startRace(categorie)

  eventStore.addEvent(
    "start",
    `Départ ${race.label}`
  )

  await new Promise(resolve =>
    setTimeout(resolve, 1000)
  )

  showCountdown.value = false

}

async function finish(categorie) {

  console.log("⛔ FINISH CLIQUÉ :", categorie)

  await finishRaceFirestore(categorie)

  console.log("🔥 Firestore finish envoyé")

  raceManager.finishRace(categorie)

  console.log("✅ Course terminée dans le store")

}

async function reset(categorie) {

  await resetRaceFirestore(categorie)

  raceManager.resetRace(categorie)

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
      Centre de supervision
    </p>

    <div class="mt-8 grid gap-4 md:grid-cols-3">

      <StatCard
  title="En attente"
  :value="waiting"
  color="yellow"
/>

<StatCard
  title="En cours"
  :value="running"
  color="green"
/>

<StatCard
  title="Terminées"
  :value="finished"
  color="blue"
/>

    </div>

  </div>

  <div class="grid gap-6 xl:grid-cols-2">

    <div>

      <h2 class="mb-4 text-2xl font-black">
        🚦 Courses
      </h2>

      <div class="space-y-4">

      <RaceCard
  v-for="race in races"
  :key="race.id"
  :race="race"
  @start="start"
  @finish="finish"
  @reset="reset"
/>

      </div>

    </div>

    <div class="space-y-6">

      <div class="rounded-3xl bg-slate-950 p-6 text-white">

        <h2 class="text-2xl font-black">
          📱 État des scanners
        </h2>

        <div class="mt-5 space-y-3">

  <ScannerStatusCard
    v-for="(scanner, name) in scanners"
    :key="name"
    :name="name"
    :scanner="scanner"
  />

</div>
      </div>

    <EventTimeline :events="events" />
    </div>

  </div>

  <CountdownModal
    :visible="showCountdown"
    :title="currentRace?.label"
    :participants="currentRace?.participants ?? 0"
    :value="countdownValue"
  />

</section>

</template>