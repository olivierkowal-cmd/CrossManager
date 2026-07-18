<script setup>
import { computed } from "vue"

const props = defineProps({
  arrivals: {
    type: Array,
    default: () => [],
  },

  limit: {
    type: Number,
    default: 10,
  },
})

const lastScans = computed(() => {
  return [...props.arrivals]
    .reverse()
    .slice(0, props.limit)
})

function formatElapsed(ms) {
  if (!ms) return "--:--"

  const total = Math.floor(ms / 1000)

  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
</script>

<template>

<div class="rounded-3xl border border-slate-200 bg-white shadow-sm">

  <div class="border-b border-slate-200 p-5">

    <h2 class="text-xl font-bold">
      Historique des scans
    </h2>

    <p class="mt-1 text-sm text-slate-500">
      {{ lastScans.length }} derniers scans
    </p>

  </div>

  <div
    v-if="lastScans.length"
    class="max-h-[520px] overflow-y-auto"
  >

    <div
      v-for="scan in lastScans"
      :key="`${scan.participant.id}-${scan.arrivalTime}`"
      class="flex items-center justify-between border-b border-slate-100 px-5 py-4 hover:bg-slate-50"
    >

      <div>

        <p class="font-bold text-slate-900">

          {{ scan.participant.prenom }}
          {{ scan.participant.nom }}

        </p>

        <p class="mt-1 text-sm text-slate-500">

          {{ scan.participant.categorie }}

          •

          {{ scan.scanner }}

        </p>

      </div>

      <div class="text-right">

        <p class="text-lg font-bold text-sky-700">

          #{{ scan.position }}

        </p>

        <p class="text-sm text-slate-500">

          {{ formatElapsed(scan.elapsedTime) }}

        </p>

      </div>

    </div>

  </div>

  <div
    v-else
    class="p-12 text-center text-slate-400"
  >

    <div class="text-5xl">
      📋
    </div>

    <p class="mt-4">
      Aucun scan enregistré
    </p>

  </div>

</div>

</template>