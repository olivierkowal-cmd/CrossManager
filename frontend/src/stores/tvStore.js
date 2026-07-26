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

  return [...arrivals]
    .sort(
      (a, b) =>
        Number(b.arrivalTime ?? 0) -
        Number(a.arrivalTime ?? 0)
    )[0]

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