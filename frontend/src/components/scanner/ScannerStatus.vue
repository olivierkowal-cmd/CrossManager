<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useAppStore } from "../../stores/appStore"
import { useScannerStore } from "../../stores/scannerStore"

const app = useAppStore()
const scannerStore = useScannerStore()

const battery = ref(null)
const online = ref(navigator.onLine)

function updateOnline() {
  online.value = navigator.onLine
}

async function loadBattery() {

  if (!("getBattery" in navigator)) return

  try {

    const manager = await navigator.getBattery()

    battery.value = Math.round(manager.level * 100)

    manager.addEventListener("levelchange", () => {
      battery.value = Math.round(manager.level * 100)
    })

  } catch (e) {
    console.error(e)
  }

}

const batteryColor = computed(() => {

  if (battery.value === null) return "text-slate-500"

  if (battery.value >= 60) return "text-green-600"

  if (battery.value >= 30) return "text-yellow-600"

  return "text-red-600"

})

const totalScans = computed(() => scannerStore.arrivals.length)

onMounted(() => {

  window.addEventListener("online", updateOnline)
  window.addEventListener("offline", updateOnline)

  loadBattery()

})

onUnmounted(() => {

  window.removeEventListener("online", updateOnline)
  window.removeEventListener("offline", updateOnline)

})
</script>

<template>

<div class="rounded-3xl border border-slate-200 bg-white shadow-sm">

<div class="border-b border-slate-200 p-5">

<h2 class="text-xl font-bold">

État du scanner

</h2>

</div>

<div class="space-y-5 p-6">

<div class="flex justify-between">

<span class="text-slate-500">

Appareil

</span>

<span class="font-bold">

{{ app.deviceName }}

</span>

</div>

<div class="flex justify-between">

<span class="text-slate-500">

Connexion

</span>

<span
:class="online ? 'text-green-600' : 'text-red-600'"
class="font-bold"
>

{{ online ? "🟢 Connecté" : "🔴 Hors ligne" }}

</span>

</div>

<div class="flex justify-between">

<span class="text-slate-500">

Batterie

</span>

<span
:class="batteryColor"
class="font-bold"
>

{{ battery !== null ? battery + "%" : "--" }}

</span>

</div>

<div class="flex justify-between">

<span class="text-slate-500">

Caméra

</span>

<span class="font-bold">

Arrière

</span>

</div>

<div class="flex justify-between">

<span class="text-slate-500">

Scans

</span>

<span class="font-bold text-sky-600">

{{ totalScans }}

</span>

</div>

<div class="flex justify-between">

<span class="text-slate-500">

Dernière activité

</span>

<span class="font-bold">

{{ scannerStore.lastArrival ? "Active" : "--" }}

</span>

</div>

</div>

</div>

</template>