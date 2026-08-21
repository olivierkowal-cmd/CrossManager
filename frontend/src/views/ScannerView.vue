<script setup>
import { onMounted, onUnmounted, ref } from "vue"

import {
  updateScannerStatus,
  disconnectScanner,
} from "../services/scannerService"

import { useScannerStore } from "../stores/scannerStore"
import { useAppStore } from "../stores/appStore"

import ScannerCamera from "../components/scanner/ScannerCamera.vue"
import LastArrivalCard from "../components/scanner/LastArrivalCard.vue"


const scannerStore = useScannerStore()
const app = useAppStore()


console.log(
  "📱 ScannerView chargé",
  app.deviceName
)


// =====================================================
// MODE SCANNER
// =====================================================

if (app.mode !== "scanner") {

  app.setScanner(1)

}


// =====================================================
// MESSAGE
// =====================================================

const message = ref("")
const messageColor = ref("")

let heartbeat = null


// =====================================================
// NOM DU SCANNER ACTUEL
// =====================================================

const currentScannerName = () => {

  return app.deviceName

}


// =====================================================
// DÉMARRER LE HEARTBEAT
// =====================================================

async function startHeartbeat() {

  // Sécurité : supprimer l'ancien intervalle

  if (heartbeat) {

    clearInterval(heartbeat)

    heartbeat = null

  }


  try {

    await updateScannerStatus(
      currentScannerName()
    )

    console.log(
      "✅ Heartbeat envoyé :",
      currentScannerName()
    )

  } catch (e) {

    console.error(
      "❌ Erreur Firebase :",
      e
    )

  }


  heartbeat = setInterval(
    async () => {

      try {

        await updateScannerStatus(

          currentScannerName(),

          {

            scans:
              scannerStore.arrivals.length,

          }

        )

        console.log(
          "❤️ Heartbeat :",
          currentScannerName()
        )

      } catch (e) {

        console.error(
          "❌ Erreur heartbeat :",
          e
        )

      }

    },
    5000
  )

}


// =====================================================
// CHANGER DE SCANNER
// =====================================================

async function changeScanner(event) {

  const newScannerId =
    Number(event.target.value)


  if (
    !Number.isInteger(newScannerId) ||
    newScannerId < 1 ||
    newScannerId > 4
  ) {

    return

  }


  const oldScannerName =
    currentScannerName()


  const newScannerName =
    `Scanner ${newScannerId}`


  // -------------------------------------------------
  // Rien ne change
  // -------------------------------------------------

  if (
    oldScannerName ===
    newScannerName
  ) {

    return

  }


  console.log(
    "🔄 Changement scanner :",
    oldScannerName,
    "→",
    newScannerName
  )


  // -------------------------------------------------
  // Déconnecter l'ancien scanner
  // -------------------------------------------------

  try {

    await disconnectScanner(
      oldScannerName
    )

  } catch (error) {

    console.error(
      "❌ Erreur déconnexion ancien scanner :",
      error
    )

  }


  // -------------------------------------------------
  // Changer le scanner dans Pinia
  // -------------------------------------------------

  app.setScanner(
    newScannerId
  )


  // -------------------------------------------------
  // Nouveau heartbeat
  // -------------------------------------------------

  await startHeartbeat()


  console.log(
    "✅ Scanner actif :",
    app.deviceName
  )

}


// =====================================================
// MONTAGE
// =====================================================

onMounted(async () => {

  await startHeartbeat()

})


// =====================================================
// DÉMONTAGE
// =====================================================

onUnmounted(async () => {

  if (heartbeat) {

    clearInterval(heartbeat)

    heartbeat = null

  }


  try {

    await disconnectScanner(
      currentScannerName()
    )

  } catch (error) {

    console.error(
      "❌ Erreur déconnexion scanner :",
      error
    )

  }

})


// =====================================================
// BIP
// =====================================================

function beep(duration = 120) {

  try {

    const context =
      new AudioContext()

    const oscillator =
      context.createOscillator()

    const gain =
      context.createGain()


    oscillator.connect(
      gain
    )

    gain.connect(
      context.destination
    )


    oscillator.frequency.value =
      900


    oscillator.start()


    gain.gain.setValueAtTime(
      0.15,
      context.currentTime
    )


    oscillator.stop(
      context.currentTime +
      duration / 1000
    )

  } catch (e) {}

}


// =====================================================
// VIBRATION
// =====================================================

function vibrate(duration = 80) {

  if (
    navigator.vibrate
  ) {

    navigator.vibrate(
      duration
    )

  }

}


// =====================================================
// SCAN
// =====================================================

async function onScanned(code) {

  console.log(
    "📷 QR scanné :",
    code
  )


  const result =
    await scannerStore.scanParticipant(

      code,

      app.deviceName

    )


  console.log(
    "📦 Résultat scan :",
    result
  )


  console.log(
    "📊 Historique scanner :",
    scannerStore.arrivals.length
  )


  if (result.success) {

    beep()

    vibrate()


    message.value =
      "✓ Arrivée enregistrée"


    updateScannerStatus(

      app.deviceName,

      {

        scans:
          scannerStore.arrivals.length,

        lastScan:
          new Date(),

      }

    )


    messageColor.value =
      "bg-green-100 text-green-700"

  }

  else if (result.duplicate) {

    beep(400)

    vibrate(300)


    message.value =
      "⚠ Participant déjà scanné"


    messageColor.value =
      "bg-orange-100 text-orange-700"

  }

  else {

    beep(500)


    message.value =
      result.message


    messageColor.value =
      "bg-red-100 text-red-700"

  }


  setTimeout(() => {

    message.value = ""

  }, 1800)

}

</script>


<template>

<section class="space-y-8">


  <!-- =================================================
       TITRE
  ================================================== -->

  <div>

    <p
      class="uppercase tracking-[0.35em] text-sky-600 text-sm font-semibold"
    >

      {{ app.deviceName }}

    </p>


    <h1 class="mt-2 text-3xl font-bold">

      Scanner QR

    </h1>


    <p class="mt-2 text-slate-500">

      Scanner les dossards des participants.

    </p>

  </div>


  <!-- =================================================
       CHOIX DU SCANNER
  ================================================== -->

  <div
    class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
  >

    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >

      <div>

        <p
          class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500"
        >

          Scanner utilisé

        </p>


        <p
          class="mt-1 text-sm text-slate-500"
        >

          Choisissez le numéro de ce téléphone.

        </p>

      </div>


      <select
        :value="app.scannerId"
        class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        @change="changeScanner"
      >

        <option :value="1">
          Scanner 1
        </option>

        <option :value="2">
          Scanner 2
        </option>

        <option :value="3">
          Scanner 3
        </option>

        <option :value="4">
          Scanner 4
        </option>

      </select>

    </div>

  </div>


  <!-- =================================================
       MESSAGE
  ================================================== -->

  <div
    v-if="message"
    :class="messageColor"
    class="rounded-2xl p-5 text-center text-xl font-bold"
  >

    {{ message }}

  </div>


  <!-- =================================================
       SCANNER
  ================================================== -->

  <div
    class="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]"
  >

    <ScannerCamera
      @scanned="onScanned"
    />


    <LastArrivalCard
      :arrival="scannerStore.lastArrival"
    />

  </div>


</section>

</template>