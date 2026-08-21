<script setup>

import { computed } from "vue"

import { useRaceManagerStore } from "../stores/raceManagerStore"

const raceManager = useRaceManagerStore()


// =====================================================
// ARRIVÉES RÉCENTES
// =====================================================

const recentArrivals = computed(() => {

  const results = []

  raceManager.races.forEach((race) => {

    if (!Array.isArray(race.results)) {
      return
    }

    race.results.forEach((arrival) => {

      results.push({
        ...arrival,

        categorie: race.categorie,

        raceLabel: race.label,

      })

    })

  })


  // Les plus récentes en premier

  return results
    .sort(
      (a, b) =>
        (b.arrivalTime ?? 0) -
        (a.arrivalTime ?? 0)
    )
    .slice(0, 10)

})


// =====================================================
// FORMAT DU TEMPS
// =====================================================

function formatTime(milliseconds = 0) {

  const totalSeconds =
    Math.max(
      0,
      Math.floor(milliseconds / 1000)
    )


  const minutes =
    Math.floor(
      totalSeconds / 60
    )


  const seconds =
    totalSeconds % 60


  return (
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`
  )

}

</script>


<template>

  <div
    class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
  >

    <div
      class="mb-3 flex items-center justify-between"
    >

      <h3
        class="text-lg font-semibold text-slate-800"
      >
        Arrivées récentes
      </h3>


      <span
        class="text-sm text-slate-500"
      >
        {{ recentArrivals.length }} éléments
      </span>

    </div>


    <div
      v-if="recentArrivals.length"
      class="space-y-2"
    >

      <div
        v-for="arrival in recentArrivals"
        :key="`${arrival.categorie}-${arrival.participant?.id}-${arrival.arrivalTime}`"
        class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
      >

        <div>

          <p
            class="font-medium text-slate-800"
          >
            {{ arrival.participant?.nom }}
            {{ arrival.participant?.prenom }}
          </p>


          <p
            class="text-sm text-slate-500"
          >
            Dossard
            {{ arrival.participant?.dossard }}
            ·
            {{ arrival.raceLabel }}
          </p>

        </div>


        <span
          class="rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-medium text-emerald-700"
        >
          {{ formatTime(arrival.elapsedTime) }}
        </span>

      </div>

    </div>


    <p
      v-else
      class="text-sm text-slate-500"
    >
      Aucune arrivée enregistrée.
    </p>

  </div>

</template>