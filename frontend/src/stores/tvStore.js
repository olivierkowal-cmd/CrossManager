import { defineStore } from "pinia"
import { computed } from "vue"

import { useFirebaseStore } from "./firebaseStore"
import { useRaceManagerStore } from "./raceManagerStore"

export const useTvStore = defineStore("tv", () => {

const firebaseStore = useFirebaseStore()
const raceManager = useRaceManagerStore()

const lastArrival = computed(() => {

  const arrivals =
    firebaseStore.arrivals ?? []

  if (!arrivals.length) {
    return null
  }


  const arrival =
    [...arrivals]
      .sort(
        (a, b) =>
          Number(b.arrivalTime ?? 0) -
          Number(a.arrivalTime ?? 0)
      )[0]

const race =
  raceManager.getRace(
    arrival.categorie
  )

const result =
  race?.results?.find(
    item =>
      String(item.participant?.id) ===
      String(arrival.participantId)
  )

const position =
  result?.position ?? null


  return {

    id:
      arrival.id,

    position:
      position,

    participant: {

      id:
        arrival.participantId,

      dossard:
        arrival.dossard ?? "",

      prenom:
        arrival.prenom ?? "",

      nom:
        arrival.nom ?? "",

      classe:
        arrival.classe ?? "",

      sexe:
        arrival.sexe ?? "",

      categorie:
        arrival.categorie ?? "",

    },

    scanner:
      arrival.scanner ?? "Scanner",

    arrivalTime:
      Number(arrival.arrivalTime ?? 0),

    elapsedTime:
      Number(arrival.elapsedTime ?? 0),

  }

})

  const runningRaces = computed(() =>

    raceManager.races.filter(
      race => race.status === "running"
    )

  )

  const finishedRaces = computed(() =>

    raceManager.races.filter(
      race => race.status === "finished"
    )

  )

  function getRanking(categorie) {

    const race = raceManager.getRace(categorie)

    if (!race) return []

    return [...race.results].sort(
      (a, b) => a.position - b.position
    )

  }

  return {

    lastArrival,

    runningRaces,

    finishedRaces,

    getRanking,

  }

})