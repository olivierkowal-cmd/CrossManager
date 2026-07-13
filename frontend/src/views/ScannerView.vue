<script setup>
import { ref } from "vue"

import { useScannerStore } from "../stores/scannerStore"
import { useAppStore } from "../stores/appStore"

import ScannerCamera from "../components/scanner/ScannerCamera.vue"
import LastArrivalCard from "../components/scanner/LastArrivalCard.vue"

const scannerStore = useScannerStore()
const app = useAppStore()

// Si aucun mode n'est défini,
// on considère que cette page est un scanner.
if (app.mode !== "scanner") {
  app.setScanner(1)
}

const message = ref("")
const messageColor = ref("")

function beep(duration = 120) {

  try {

    const context = new AudioContext()

    const oscillator = context.createOscillator()

    const gain = context.createGain()

    oscillator.connect(gain)

    gain.connect(context.destination)

    oscillator.frequency.value = 900

    oscillator.start()

    gain.gain.setValueAtTime(0.15, context.currentTime)

    oscillator.stop(context.currentTime + duration / 1000)

  } catch (e) {}

}

function vibrate(duration = 80) {

  if (navigator.vibrate) {

    navigator.vibrate(duration)

  }

}

function onScanned(code) {

  const result = scannerStore.scanParticipant(
    code,
    app.deviceName
  )

  if (result.success) {

    beep()

    vibrate()

    message.value = "✓ Arrivée enregistrée"

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

    message.value = result.message

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

<div>

<p class="uppercase tracking-[0.35em] text-sky-600 text-sm font-semibold">

{{ app.deviceName }}

</p>

<h1 class="mt-2 text-3xl font-bold">

Scanner QR

</h1>

<p class="mt-2 text-slate-500">

Scanner les dossards des participants.

</p>

</div>

<div
v-if="message"
:class="messageColor"
class="rounded-2xl p-5 text-center text-xl font-bold"
>

{{ message }}

</div>

<div class="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">

<ScannerCamera
@scanned="onScanned"
/>

<LastArrivalCard
:arrival="scannerStore.lastArrival"
/>

</div>

</section>

</template>