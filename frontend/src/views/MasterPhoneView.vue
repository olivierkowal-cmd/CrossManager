<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue"

import { onMounted, onUnmounted, ref } from "vue"
import { listenScanners } from "../services/firestoreService"

import { useRaceManagerStore } from "../stores/raceManagerStore"
import { useRaceStore } from "../stores/raceStore"
import { useScannerStore } from "../stores/scannerStore"
import { useEventStore } from "../stores/eventStore"


import RaceCard from "../components/departures/RaceCard.vue"
import CountdownModal from "../components/departures/CountdownModal.vue"


const raceManager = useRaceManagerStore()
const raceStore = useRaceStore()

const scanners = ref({})

let unsubscribe = null

onMounted(() => {

  unsubscribe = listenScanners((data) => {

    scanners.value = data

    console.log("📱 Scanners reçus :", data)

  })

})

onUnmounted(() => {

  if (unsubscribe) {

    unsubscribe()

  }

})

const scannerStore = useScannerStore()
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

const scanners = computed(() =>

  Object.entries(scannerStore.scannerStatus).map(

    ([name, scanner]) => ({

      name,

      ...scanner,

    })

  )

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

      <div class="rounded-2xl bg-slate-900 p-5">
        <p class="text-slate-400">En attente</p>
        <p class="mt-2 text-5xl font-black text-yellow-400">
          {{ waiting }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-900 p-5">
        <p class="text-slate-400">En cours</p>
        <p class="mt-2 text-5xl font-black text-green-400">
          {{ running }}
        </p>
      </div>

      <div class="rounded-2xl bg-slate-900 p-5">
        <p class="text-slate-400">Terminées</p>
        <p class="mt-2 text-5xl font-black text-blue-400">
          {{ finished }}
        </p>
      </div>

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
        />

      </div>

    </div>

    <div class="space-y-6">

      <div class="rounded-3xl bg-slate-950 p-6 text-white">

        <h2 class="text-2xl font-black">
          📱 État des scanners
        </h2>

        <div class="mt-5 space-y-3">

          <div
            v-for="scanner in scanners"
            :key="scanner.name"
            class="flex items-center justify-between rounded-2xl bg-slate-900 p-4"
          >

            <div>

              <p class="font-bold">
                {{ scanner.name }}
              </p>

              <p class="text-sm text-slate-400">
                {{ scanner.scans }} scans
              </p>

            </div>

            <div class="text-right">

              <p class="text-xl">
                {{ scanner.connected ? "🟢" : "🔴" }}
              </p>

              <p class="text-xs text-slate-400">
                {{ scanner.network }}
              </p>

            </div>

          </div>

        </div>

      </div>

      <div class="rounded-3xl bg-slate-950 p-6 text-white">

        <h2 class="text-2xl font-black">
          📜 Activité
        </h2>

        <div class="mt-5 space-y-2">

          <div
            v-for="event in events"
            :key="event.id"
            class="rounded-xl bg-slate-900 p-3"
          >

            <div class="flex items-center justify-between">

              <span class="font-medium">
                {{ event.message }}
              </span>

              <span class="text-xs text-slate-400">
                {{ new Date(event.timestamp).toLocaleTimeString("fr-BE") }}
              </span>

            </div>

          </div>

          <div
            v-if="events.length === 0"
            class="text-slate-400"
          >
            Aucun événement.
          </div>

        </div>

      </div>

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