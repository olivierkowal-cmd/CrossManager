import { defineStore } from "pinia"
import { ref } from "vue"

import { addArrival, listenArrivals } from "../firebase/arrivals"
import { loadParticipants } from "../firebase/participants"
import { loadRaces } from "../firebase/races"
import { listenScanners, updateScannerStatus } from "../firebase/scanners"

export const useFirebaseStore = defineStore("firebase", () => {

  const connected = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const arrivals = ref([])
  const participants = ref([])
  const races = ref([])
  const scanners = ref([])

  let unsubscribeArrivals = null
  let unsubscribeScanners = null

  async function connect() {

    if (connected.value || loading.value) {

      return

    }

    loading.value = true
    error.value = null

    try {

      participants.value = await loadParticipants()

      races.value = await loadRaces()

      unsubscribeArrivals = listenArrivals(data => {

        arrivals.value = data

      })

      unsubscribeScanners = listenScanners(data => {

        scanners.value = data

      })

      connected.value = true

    }

    catch (err) {

      console.error(err)

      error.value = err

    }

    finally {

      loading.value = false

    }

  }

  function disconnect() {

    if (unsubscribeArrivals) {

      unsubscribeArrivals()
      unsubscribeArrivals = null

    }

    if (unsubscribeScanners) {

      unsubscribeScanners()
      unsubscribeScanners = null

    }

    connected.value = false

  }

  async function sendArrival(arrival) {

    if (!connected.value) {

      return

    }

    await addArrival(arrival)

  }

  async function updateScanner(scannerId, status) {

    if (!connected.value) {

      return

    }

    await updateScannerStatus(scannerId, status)

  }

  return {

    connected,
    loading,
    error,

    arrivals,
    participants,
    races,
    scanners,

    connect,
    disconnect,

    sendArrival,
    updateScanner,

  }

})