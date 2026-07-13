<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { Html5Qrcode } from "html5-qrcode"

const emit = defineEmits(["scanned"])

const readerId = "crossmanager-reader"

const isRunning = ref(false)
const cameraError = ref("")
const lastCode = ref("")

let html5QrCode = null
let lock = false

async function startScanner() {

  cameraError.value = ""

  try {

    html5QrCode = new Html5Qrcode(readerId)

    await html5QrCode.start(

      {
        facingMode: "environment"
      },

      {
        fps: 10,
        qrbox: {
          width: 280,
          height: 280
        },
        aspectRatio: 1.0
      },

      async (decodedText) => {

        if (lock) return

        lock = true

        const code = decodedText.trim()

        lastCode.value = code

        emit("scanned", code)

        setTimeout(() => {

          lock = false

        }, 1000)

      },

      () => {}

    )

    isRunning.value = true

  }

  catch (error) {

    console.error(error)

    cameraError.value =
      "Impossible d'accéder à la caméra."

  }

}

async function stopScanner() {

  try {

    if (html5QrCode && isRunning.value) {

      await html5QrCode.stop()

      await html5QrCode.clear()

    }

  }

  catch (e) {

    console.error(e)

  }

  isRunning.value = false

}

onMounted(() => {

  startScanner()

})

onUnmounted(() => {

  stopScanner()

})
</script>

<template>

<div class="space-y-5">

<div
class="overflow-hidden rounded-3xl border bg-white shadow-sm"
>

<div
:id="readerId"
class="min-h-[420px] w-full"
></div>

</div>

<div
v-if="cameraError"
class="rounded-2xl bg-red-100 p-4 text-red-700"
>

{{ cameraError }}

</div>

<div
class="rounded-2xl border bg-slate-50 p-4"
>

<p class="text-sm text-slate-500">

Dernier QR détecté

</p>

<p class="mt-2 font-mono text-2xl font-bold">

{{ lastCode || "—" }}

</p>

</div>

</div>

</template>

<style scoped>

:deep(video){

width:100% !important;

border-radius:24px;

}

:deep(canvas){

display:none !important;

}

</style>