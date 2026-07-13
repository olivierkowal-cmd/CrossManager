import { defineStore } from "pinia"
import { ref } from "vue"
import { RACES } from "../data/races"

export const useRaceManagerStore = defineStore("raceManager", () => {

  const races = ref(
    RACES.map((race) => ({
      id: race.id,
      categorie: race.categorie,
      label: race.label,

      status: "waiting", // waiting | countdown | running | finished

      startTime: null,
      finishTime: null,

      participants: 0,
      arrivals: 0,

      results: [],
    }))
  )

  function getRace(categorie) {
    return races.value.find(r => r.categorie === categorie)
  }

  function startCountdown(categorie) {
    const race = getRace(categorie)
    if (!race) return

    race.status = "countdown"
  }

  function startRace(categorie) {
    const race = getRace(categorie)
    if (!race) return

    race.status = "running"
    race.startTime = Date.now()
  }

  function finishRace(categorie) {
    const race = getRace(categorie)
    if (!race) return

    race.status = "finished"
    race.finishTime = Date.now()
  }

  function resetRace(categorie) {

    const race = getRace(categorie)

    if (!race) return

    race.status = "waiting"
    race.startTime = null
    race.finishTime = null
    race.arrivals = 0
    race.results = []

  }

  function resetAllRaces() {

    races.value.forEach(race => {

      race.status = "waiting"
      race.startTime = null
      race.finishTime = null
      race.arrivals = 0
      race.results = []

    })

  }

  function setParticipants(categorie, total) {

    const race = getRace(categorie)

    if (!race) return

    race.participants = total

  }

  function registerArrival(participant, scanner = "Scanner") {

    const race = getRace(participant.categorie)

    if (!race) {

      return {
        success: false,
        message: "Course introuvable"
      }

    }

    if (race.status !== "running") {

      return {
        success: false,
        message: "La course n'est pas démarrée"
      }

    }

    const arrivalTime = Date.now()

    const elapsedTime = arrivalTime - race.startTime

    race.arrivals++

    const arrival = {

      position: race.arrivals,

      participant,

      scanner,

      arrivalTime,

      elapsedTime,

    }

    race.results.push(arrival)

    if (
      race.participants > 0 &&
      race.arrivals >= race.participants
    ) {

      finishRace(race.categorie)

    }

    return {

      success: true,

      arrival

    }

  }

  function getElapsedTime(categorie) {

    const race = getRace(categorie)

    if (!race) return 0

    if (!race.startTime) return 0

    if (race.status === "finished") {

      return race.finishTime - race.startTime

    }

    return Date.now() - race.startTime

  }

  return {

    races,

    getRace,

    startCountdown,

    startRace,

    finishRace,

    resetRace,

    resetAllRaces,

    setParticipants,

    registerArrival,

    getElapsedTime,

  }

})