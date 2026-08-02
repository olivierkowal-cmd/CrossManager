import { defineStore } from "pinia"
import { ref } from "vue"

import { useRaceStore } from "./raceStore"
import { useRaceManagerStore } from "./raceManagerStore"

export const useScannerStore = defineStore("scanner", () => {

  const raceStore = useRaceStore()
  const raceManager = useRaceManagerStore()

  const arrivals = ref([])

  const lastArrival = ref(null)

  function scanParticipant(participantId, scanner = "Scanner 1") {

    participantId = Number(participantId)

    const participant = raceStore.participants.find(
      p => Number(p.id) === participantId
    )

    if (!participant) {

      return {

        success: false,

        message: "Participant introuvable"

      }

    }

    const duplicate = arrivals.value.find(
      a => a.participant.id === participant.id
    )

    if (duplicate) {

      return {

        success: false,

        duplicate: true,

        participant,

        arrival: duplicate,

        message: "Participant déjà scanné"

      }

    }
    

    const result = raceManager.registerArrival(
      participant,
      scanner
    )

    if (!result.success) {

      return result

    }

    arrivals.value.push(result.arrival)

    lastArrival.value = result.arrival

    return result

  }

  function resetScanner() {

    arrivals.value = []

    lastArrival.value = null

  }

  return {

    arrivals,

    lastArrival,

    scanParticipant,

    resetScanner,

  }

})