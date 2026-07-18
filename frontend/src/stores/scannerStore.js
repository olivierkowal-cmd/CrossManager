import { defineStore } from "pinia"
import { ref, computed } from "vue"

import { useRaceStore } from "./raceStore"
import { useRaceManagerStore } from "./raceManagerStore"

export const useScannerStore = defineStore("scanner", () => {

  const raceStore = useRaceStore()
  const raceManager = useRaceManagerStore()

  const arrivals = ref([])

  const lastArrival = ref(null)
  const totalScans = computed(() => arrivals.value.length)

  function scanParticipant(participantId, scanner = "Scanner 1") {

   let participant = null

if (
  typeof participantId === "string" &&
  participantId.startsWith("CM-")
) {

  participant = raceStore.participants.find(
    p => p.qr === participantId.trim()
  )

} else {

  const id = Number(participantId)

  participant = raceStore.participants.find(
    p =>
      Number(p.id) === id ||
      Number(p.dossard) === id
  )

}

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
    
    totalScans,

    scanParticipant,

    resetScanner,

  }

})