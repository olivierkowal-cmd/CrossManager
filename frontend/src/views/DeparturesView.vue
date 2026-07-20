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
// COURSES
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

async function resetRace(
  categorie
) {

  console.log(
    "🔄 Événement reset-race reçu dans DeparturesView :",
    categorie
  )


  const race =
    raceManager.getRace(
      categorie
    )


  if (
    !race
  ) {

    console.error(
      "❌ Course introuvable :",
      categorie
    )

    return

  }


  // ==================================================
  // CONFIRMATION
  // ==================================================

  const confirmed =
    window.confirm(
      `Voulez-vous vraiment réinitialiser la course ${race.label} ?\n\nLes arrivées et les résultats de cette course seront supprimés.`
    )


  if (
    !confirmed
  ) {

    return

  }


  // ==================================================
  // SESSION
  // ==================================================

  const sessionId =
    raceStore.settings?.sessionId ||
    "cross-2026"


  console.log(
    "🔄 Réinitialisation en cours :",
    categorie,
    "| Session :",
    sessionId
  )


  try {

    // ==================================================
    // APPEL RACEMANAGER
    // ==================================================

    const result =
      await raceManager.resetRace(
        categorie,
        sessionId
      )


    console.log(
      "🔄 Résultat réinitialisation :",
      result
    )


    if (
      !result?.success
    ) {

      alert(
        result?.message ||
        "Impossible de réinitialiser la course."
      )

      return

    }


    console.log(
      "✅ Course réinitialisée avec succès :",
      categorie
    )


  } catch (
    error
  ) {

    console.error(
      "❌ Erreur pendant la réinitialisation :",
      error
    )


    alert(
      "Une erreur est survenue pendant la réinitialisation."
    )

  }

}
</script>


<template>

<section class="space-y-8">

  <div>

    <p
      class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600"
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

      @reset-race="resetRace"

    />

  </div>

</section>

</template>