<script setup>
import { computed } from "vue"

import { useRaceManagerStore } from "../../stores/raceManagerStore"
import { useRaceStore } from "../../stores/raceStore"
import { useScannerStore } from "../../stores/scannerStore"

import StatCard from "./StatCard.vue"
import RunningRaceCard from "./RunningRaceCard.vue"
import ScannerStatusCard from "./ScannerStatusCard.vue"
import EventTimeline from "./EventTimeline.vue"

const raceManager = useRaceManagerStore()
const raceStore = useRaceStore()
const scannerStore = useScannerStore()

const waiting = computed(() =>
  raceManager.races.filter(
    race => race.status === "waiting"
  ).length
)

const running = computed(() =>
  raceManager.races.filter(
    race => race.status === "running"
  ).length
)

const finished = computed(() =>
  raceManager.races.filter(
    race => race.status === "finished"
  ).length
)

const arrivals = computed(() =>
  raceManager.races.reduce(
    (total, race) => total + race.arrivals,
    0
  )
)

const progress = computed(() => {

  const participants =
    raceStore.participants.length

  if (!participants) {

    return 0

  }

  return Math.round(
    arrivals.value /
    participants *
    100
  )

})

const runningRaces = computed(() =>
  raceManager.races.filter(
    race => race.status === "running"
  )
)

const scanners = computed(() =>
  Object.entries(
    scannerStore.scannerStatus
  ).map(
    ([name, scanner]) => ({
      name,
      ...scanner,
    })
  )
)
</script>

<template>

<div class="space-y-8">

  <!-- ========================= -->
  <!-- DASHBOARD                 -->
  <!-- ========================= -->

  <section
    class="rounded-3xl bg-slate-950 p-8 text-white shadow-2xl"
  >

    <div class="flex items-center justify-between">

      <div>

        <p
          class="uppercase tracking-[0.35em] text-sky-400 font-bold"
        >
          CENTRE DE SUPERVISION
        </p>

        <h1
          class="mt-3 text-5xl font-black"
        >
          Téléphone maître
        </h1>

      </div>

      <div
        class="text-right"
      >

        <p class="text-slate-400">
          Courses
        </p>

        <p class="text-5xl font-black">
          {{ raceManager.races.length }}
        </p>

      </div>

    </div>

    <div
      class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
    >

      <StatCard
  icon="🏁"
  title="Courses"
  :value="raceManager.races.length"
  :subtitle="`⏳ ${waiting} • 🟢 ${running} • ✅ ${finished}`"
  color="bg-sky-600"
/>

<StatCard
  icon="👥"
  title="Participants"
  :value="raceStore.participants.length"
  subtitle="Inscrits"
  color="bg-green-600"
/>

<StatCard
  icon="🏆"
  title="Arrivées"
  :value="arrivals"
  subtitle="Enregistrées"
  color="bg-violet-600"
/>

<StatCard
  icon="📈"
  title="Progression"
  :value="`${progress}%`"
  subtitle="Du cross"
  color="bg-amber-500"
/>
    </div>

  </section>

  <!-- ========================= -->
  <!-- COURSES + SCANNERS        -->
  <!-- ========================= -->

  <section
    class="grid gap-6 xl:grid-cols-2"
  >

    <div>

      <h2
        class="mb-4 text-3xl font-black"
      >
        🟢 Courses en cours
      </h2>

      <div
        v-if="runningRaces.length"
        class="space-y-4"
      >

        <RunningRaceCard
          v-for="race in runningRaces"
          :key="race.categorie"
          :race="race"
        />

      </div>

      <div
        v-else
        class="rounded-3xl bg-slate-900 p-8 text-center text-slate-400"
      >

        Aucune course en cours

      </div>

    </div>

    <div>

      <h2
        class="mb-4 text-3xl font-black"
      >
        📱 État des scanners
      </h2>

      <div
        class="space-y-4"
      >

        <ScannerStatusCard
          v-for="scanner in scanners"
          :key="scanner.name"
          :scanner="scanner"
        />

      </div>

    </div>

  </section>

    <!-- ========================= -->
  <!-- TIMELINE                  -->
  <!-- ========================= -->

  <section>

    <h2
      class="mb-4 text-3xl font-black"
    >
      📜 Journal des événements
    </h2>

    <EventTimeline />

  </section>

</div>

</template>