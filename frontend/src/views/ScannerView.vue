<script setup>
import { ref } from "vue"

import { useScannerStore } from "../stores/scannerStore"
import { useAppStore } from "../stores/appStore"

import ScannerCamera from "../components/scanner/ScannerCamera.vue"
import LastArrivalCard from "../components/scanner/LastArrivalCard.vue"

const scannerStore = useScannerStore()
const app = useAppStore()

if (app.mode !== "scanner") {
  app.setScanner(1)
}

const message = ref("")
const messageColor = ref("")
const success = ref(false)

function beep(duration = 120, frequency = 900) {

  try {

    const context = new AudioContext()

    const oscillator = context.createOscillator()

    const gain = context.createGain()

    oscillator.connect(gain)

    gain.connect(context.destination)

    oscillator.frequency.value = frequency

    gain.gain.value = 0.15

    oscillator.start()

    oscillator.stop(
      context.currentTime + duration / 1000
    )

  }

  catch {}

}

function successBeep(){

  beep(120,950)

}

function warningBeep(){

  beep(300,650)

}

function errorBeep(){

  beep(450,350)

}

function vibrate(duration=80){

  if(navigator.vibrate){

    navigator.vibrate(duration)

  }

}

async function onScanned(code){

  const result = await scannerStore.scanParticipant(
    code,
    app.deviceName
  )

  console.log("Résultat :", result)
  console.log("Participant :", result.participant)

  if(result.success){

    success.value = true

    successBeep()

    vibrate(70)

    message.value =
      `${result.participant.prenom} ${result.participant.nom}`

    messageColor.value =
      "bg-green-600"

  }

  else if(result.duplicate){

    success.value = false

    warningBeep()

    vibrate(250)

    message.value =
      "Participant déjà scanné"

    messageColor.value =
      "bg-orange-500"

  }

  else{

    success.value = false

    errorBeep()

    vibrate([120,80,120])

    message.value =
      result.message

    messageColor.value =
      "bg-red-600"

  }

  setTimeout(()=>{

    message.value=""

    success.value=false

  },1800)

}
</script>

<template>

<section class="space-y-8">

  <div>

    <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">
      {{ app.deviceName }}
    </p>

    <h1 class="mt-2 text-4xl font-black">
      Scanner QR
    </h1>

    <p class="mt-2 text-slate-500">
      Scanner les dossards des participants
    </p>

  </div>

  <!-- Validation -->

  <transition name="scan">

    <div
      v-if="message"
      :class="messageColor"
      class="overflow-hidden rounded-3xl shadow-2xl"
    >

      <!-- Succès -->

      <div
  v-if="success"
  class="py-10 text-center text-white"
>

  <div class="text-8xl">
    ✅
  </div>

  <h2 class="mt-4 text-5xl font-black">
    {{ scannerStore.lastArrival?.participant.prenom }}
    {{ scannerStore.lastArrival?.participant.nom }}
  </h2>

  <p class="mt-2 text-2xl text-green-100">
    {{ scannerStore.lastArrival?.participant.categorie }}
  </p>

  <div class="mx-auto mt-8 max-w-md rounded-2xl bg-white/10 p-6">

    <div class="flex justify-between text-2xl">
      <span>Temps</span>

      <strong>
        {{ Math.floor((scannerStore.lastArrival?.elapsedTime ?? 0)/60000)
          .toString()
          .padStart(2,"0") }}
        :
        {{
          Math.floor(((scannerStore.lastArrival?.elapsedTime ?? 0)%60000)/1000)
            .toString()
            .padStart(2,"0")
        }}
      </strong>

    </div>

    <div class="mt-4 flex justify-between text-2xl">

      <span>Position</span>

      <strong>

        {{ scannerStore.lastArrival?.position }}

      </strong>

    </div>

    <div class="mt-4 flex justify-between text-xl">

      <span>Scanner</span>

      <strong>

        {{ scannerStore.lastArrival?.scanner }}

      </strong>

    </div>

  </div>

</div>

      <!-- Erreur -->

      <div
        v-else
        class="py-10 text-center text-white"
      >

        <div class="text-8xl">
          ❌
        </div>

        <h2 class="mt-4 text-4xl font-black">

          {{ message }}

        </h2>

      </div>

    </div>

  </transition>

  <!-- Caméra -->

  <div class="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">

    <ScannerCamera
      @scanned="onScanned"
    />

    <LastArrivalCard
      :arrival="scannerStore.lastArrival"
    />

  </div>

</section>

</template>

<style scoped>

.scan-enter-active,
.scan-leave-active{

  transition:
    opacity .30s ease,
    transform .30s ease;

}

.scan-enter-from,
.scan-leave-to{

  opacity:0;

  transform:scale(.92);

}

</style>