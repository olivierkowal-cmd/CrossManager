<script setup>
import { computed } from "vue"

import { useRaceManagerStore } from "../stores/raceManagerStore"
import { useRaceStore } from "../stores/raceStore"

import {
  resetRaceFirestore,
} from "../services/raceService"

import RaceCard from "../components/departures/RaceCard.vue"


const raceManager = useRaceManagerStore()
const raceStore = useRaceStore()


// =====================================================
// COURSES
// =====================================================

const races = computed(() => {

  return raceManager.races.map((race) => ({

    ...race,

    participants:
      raceStore.participants.filter(
        participant =>
          participant.categorie ===
          race.categorie
      ).length

  }))

})


// =====================================================
// DÉMARRER UNE COURSE
// =====================================================

function start(categorie) {

  raceManager.startRace(categorie)

}


// =====================================================
// RÉINITIALISER UNE COURSE
// =====================================================

async function reset(categorie) {

  try {

    // -----------------------------------------------
    // Réinitialisation dans Firebase
    // -----------------------------------------------

    await resetRaceFirestore(
      categorie
    )


    // -----------------------------------------------
    // Réinitialisation locale
    // -----------------------------------------------

    raceManager.resetRace(
      categorie
    )


    console.log(
      "🔄 Course réinitialisée dans Firebase :",
      categorie
    )

  } catch (error) {

    console.error(
      "❌ Impossible de réinitialiser la course :",
      error
    )

    alert(
      "Impossible de réinitialiser la course dans Firebase."
    )

  }

}

</script>


<template>

<section class="space-y-8">

  <div>

    <p
      class="uppercase tracking-[0.35em] text-sky-600 text-sm font-semibold"
    >
      CrossManager
    </p>

    <h1 class="mt-2 text-3xl font-bold">
      Gestion des départs
    </h1>

    <p class="mt-2 text-slate-500">
      Vue générale des différentes courses.
    </p>

  </div>


  <div class="grid gap-6 lg:grid-cols-2">

    <RaceCard
      v-for="race in races"
      :key="race.id"
      :race="race"
      @start="start"
      @reset="reset"
    />

  </div>

</section>

</template>