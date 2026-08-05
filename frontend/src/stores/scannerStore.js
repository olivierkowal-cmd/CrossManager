import { defineStore } from "pinia"
import { ref } from "vue"

import { useRaceStore } from "./raceStore"
import { useRaceManagerStore } from "./raceManagerStore"
import { useEventStore } from "./eventStore"

export const useScannerStore = defineStore("scanner", () => {

  const raceStore = useRaceStore()
  const raceManager = useRaceManagerStore()
  const eventStore = useEventStore()

  const arrivals = ref([])

  const lastArrival = ref(null)

  const scannerStatus = ref({

    "Scanner 1": {
      connected: false,
      scans: 0,
      lastScan: null,
      heartbeat: null,
      battery: 100,
      network: "Wi-Fi",
    },

    "Scanner 2": {
      connected: false,
      scans: 0,
      lastScan: null,
      heartbeat: null,
      battery: 100,
      network: "Wi-Fi",
    },

    "Scanner 3": {
      connected: false,
      scans: 0,
      lastScan: null,
      heartbeat: null,
      battery: 100,
      network: "Wi-Fi",
    },

    "Scanner 4": {
      connected: false,
      scans: 0,
      lastScan: null,
      heartbeat: null,
      battery: 100,
      network: "Wi-Fi",
    },

  })

  function heartbeat(scanner) {

    if (!scannerStatus.value[scanner]) {
      return
    }

    const status = scannerStatus.value[scanner]

    const firstConnection = !status.connected

    status.connected = true
    status.heartbeat = Date.now()

    if (firstConnection) {

      eventStore.addEvent(
        "scanner",
        `${scanner} connecté`
      )

    }

  }

  function updateScannerInfo(
    scanner,
    battery,
    network
  ) {

    if (!scannerStatus.value[scanner]) {
      return
    }

    scannerStatus.value[scanner].battery = battery
    scannerStatus.value[scanner].network = network

  }

  function scanParticipant(
    participantId,
    scanner = "Scanner 1"
  ) {

    participantId = Number(participantId)

    heartbeat(scanner)

    const participant = raceStore.participants.find(
      p => Number(p.id) === participantId
    )

    if (!participant) {

      eventStore.addEvent(
        "error",
        `Participant ${participantId} introuvable`
      )

      return {

        success: false,

        message: "Participant introuvable"

      }

    }

    const duplicate = arrivals.value.find(
      a => a.participant.id === participant.id
    )

    if (duplicate) {

      eventStore.addEvent(
        "warning",
        `${participant.nom} déjà scanné`
      )

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

    scannerStatus.value[scanner].scans++

    scannerStatus.value[scanner].lastScan = Date.now()

    eventStore.addEvent(
      "arrival",
      `${participant.nom} ${participant.prenom}`
    )

    return result

  }

  function resetScanner() {

    arrivals.value = []

    lastArrival.value = null

    Object.values(scannerStatus.value).forEach(scanner => {

      scanner.connected = false
      scanner.scans = 0
      scanner.lastScan = null
      scanner.heartbeat = null

    })

  }

  setInterval(() => {

    const now = Date.now()

    Object.entries(scannerStatus.value).forEach(

      ([name, scanner]) => {

        if (

          scanner.connected &&
          scanner.heartbeat &&
          now - scanner.heartbeat > 10000

        ) {

          scanner.connected = false

          eventStore.addEvent(
            "scanner",
            `${name} déconnecté`
          )

        }

      }

    )

  }, 2000)

  return {

    arrivals,

    lastArrival,

    scannerStatus,

    heartbeat,

    updateScannerInfo,

    scanParticipant,

    resetScanner,

  }

})