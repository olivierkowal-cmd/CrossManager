<script setup>
import { computed } from "vue"

import { useRaceManagerStore } from "../../stores/raceManagerStore"
import { useRaceStore } from "../../stores/raceStore"

const raceManager = useRaceManagerStore()
const raceStore = useRaceStore()

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
</script>

<template>

<div class="rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">

  <p class="text-sky-400 font-bold uppercase tracking-[0.40em]">
    Tableau de bord
  </p>

  <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

    <div class="rounded-3xl bg-sky-600 p-6">

      <p class="text-sm uppercase text-sky-100">
        Courses
      </p>

      <p class="mt-2 text-5xl font-black">
        {{ raceManager.races.length }}
      </p>

      <p class="mt-3 text-sky-100">
        ⏳ {{ waiting }}
        •
        🟢 {{ running }}
        •
        ✅ {{ finished }}
      </p>

    </div>

    <div class="rounded-3xl bg-green-600 p-6">

      <p class="text-sm uppercase text-green-100">
        Participants
      </p>

      <p class="mt-2 text-5xl font-black">
        {{ raceStore.participants.length }}
      </p>

    </div>

    <div class="rounded-3xl bg-violet-600 p-6">

      <p class="text-sm uppercase text-violet-100">
        Arrivées
      </p>

      <p class="mt-2 text-5xl font-black">
        {{ arrivals }}
      </p>

    </div>

    <div class="rounded-3xl bg-amber-500 p-6">

      <p class="text-sm uppercase text-amber-100">
        Progression
      </p>

      <p class="mt-2 text-5xl font-black">
        {{ progress }}%
      </p>

    </div>

  </div>

</div>

</template>