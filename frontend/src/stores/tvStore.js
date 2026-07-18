import { defineStore } from "pinia"
import { computed } from "vue"

import { useScannerStore } from "./scannerStore"
import { useRaceManagerStore } from "./raceManagerStore"

export const useTvStore = defineStore("tv", () => {

  const scannerStore = useScannerStore()
  const raceManager = useRaceManagerStore()

  const lastArrival = computed(() => scannerStore.lastArrival)

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