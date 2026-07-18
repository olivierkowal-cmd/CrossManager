<script setup>
import { computed } from "vue"
import { useScannerStore } from "../../stores/scannerStore"

const scannerStore = useScannerStore()

const totalScans = computed(() => scannerStore.arrivals.length)

const duplicates = computed(() => {

  return scannerStore.arrivals.filter(a => a.duplicate).length

})

const errors = computed(() => {

  return scannerStore.arrivals.filter(a => a.error).length

})

const averageTime = computed(() => {

  if (!scannerStore.arrivals.length) {

    return "--"

  }

  const total = scannerStore.arrivals.reduce(

    (sum, arrival) => sum + arrival.elapsedTime,

    0

  )

  const average = Math.floor(total / scannerStore.arrivals.length)

  const minutes = Math.floor(average / 60000)

  const seconds = Math.floor((average % 60000) / 1000)

  return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`

})
</script>

<template>

<div class="rounded-3xl border border-slate-200 bg-white shadow-sm">

<div class="border-b border-slate-200 p-5">

<h2 class="text-xl font-bold">

Statistiques

</h2>

</div>

<div class="grid grid-cols-2 gap-4 p-6">

<div class="rounded-2xl bg-sky-50 p-5 text-center">

<p class="text-sm text-slate-500">

Scans

</p>

<p class="mt-2 text-3xl font-bold text-sky-700">

{{ totalScans }}

</p>

</div>

<div class="rounded-2xl bg-yellow-50 p-5 text-center">

<p class="text-sm text-slate-500">

Doublons

</p>

<p class="mt-2 text-3xl font-bold text-yellow-700">

{{ duplicates }}

</p>

</div>

<div class="rounded-2xl bg-red-50 p-5 text-center">

<p class="text-sm text-slate-500">

Erreurs

</p>

<p class="mt-2 text-3xl font-bold text-red-700">

{{ errors }}

</p>

</div>

<div class="rounded-2xl bg-green-50 p-5 text-center">

<p class="text-sm text-slate-500">

Temps moyen

</p>

<p class="mt-2 text-3xl font-bold text-green-700">

{{ averageTime }}

</p>

</div>

</div>

</div>

</template>