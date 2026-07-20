<script setup>
import { computed } from "vue"

import { useRaceManagerStore } from "../stores/raceManagerStore"
import { useRaceStore } from "../stores/raceStore"

import RaceCard from "../components/departures/RaceCard.vue"


const raceManager =
  useRaceManagerStore()

const raceStore =
  useRaceStore()


// ==================================================
// LISTE DES COURSES
// ==================================================

const races =
  computed(() => {

    return raceManager.races.map(
      race => ({

        ...race,

        participants:
          raceStore.participants.filter(
            participant =>
              participant.categorie ===
              race.categorie
          ).length,

      })
    )

  })


// ==================================================
// DÉMARRER UNE COURSE
// ==================================================

async function start(
  categorie
) {

  const total =
    raceStore.participants.filter(
      participant =>
        participant.categorie ===
        categorie
    ).length


  raceManager.setParticipants(
    categorie,
    total
  )


  await raceManager.startCountdown(
    categorie
  )

}


// ==================================================
// RÉINITIALISER UNE COURSE
// ==================================================

async function reset(
  categorie
) {

  const race =
    raceManager.getRace(
      categorie
    )


  if (
    !race
  ) {

    return

  }


  // ==================================================
  // DEMANDER CONFIRMATION
  // ==================================================

  const confirmed =
    window.confirm(
      `Voulez-vous vraiment réinitialiser la course ${race.label} ?\n\nToutes les arrivées et tous les résultats de cette course seront supprimés.`
    )


  if (
    !confirmed
  ) {

    return

  }


  // ==================================================
  // SESSION ACTIVE
  // ==================================================

  const sessionId =
    raceStore.settings.sessionId ||
    "cross-2026"


  // ==================================================
  // RÉINITIALISATION
  // ==================================================

  const result =
    await raceManager.resetRace(
      categorie,
      sessionId
    )


  if (
    result.success
  ) {

    console.log(
      "✅ Course réinitialisée :",
      categorie,
      "| Arrivées supprimées :",
      result.deletedArrivals
    )

  }

  else {

    console.error(
      "❌ Impossible de réinitialiser la course :",
      result
    )


    alert(
      "Une erreur est survenue pendant la réinitialisation de la course."
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


    <h1
      class="mt-2 text-3xl font-bold"
    >
      Gestion des départs
    </h1>


    <p
      class="mt-2 text-slate-500"
    >
      Vue générale des différentes courses.
    </p>

  </div>


  <div
    class="grid gap-6 lg:grid-cols-2"
  >

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