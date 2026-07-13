<script setup>
const props = defineProps({
  arrival: {
    type: Object,
    default: null,
  },
})

function formatTime(ms) {
  if (!ms) return "--:--"

  const total = Math.floor(ms / 1000)

  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function formatClock(time) {
  if (!time) return "--:--:--"

  return new Date(time).toLocaleTimeString()
}
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">

    <h2 class="text-xl font-bold text-slate-900">
      Dernière arrivée
    </h2>

    <template v-if="arrival">

      <div class="mt-6">

        <p class="text-3xl font-black text-green-600">
          ✓ {{ arrival.participant.prenom }} {{ arrival.participant.nom }}
        </p>

        <p class="mt-2 text-lg text-slate-600">
          {{ arrival.participant.categorie }}
        </p>

      </div>

      <div class="mt-8 grid grid-cols-2 gap-4">

        <div class="rounded-2xl bg-slate-50 p-4">

          <p class="text-sm text-slate-500">
            Position
          </p>

          <p class="mt-2 text-3xl font-bold">
            {{ arrival.position }}
          </p>

        </div>

        <div class="rounded-2xl bg-slate-50 p-4">

          <p class="text-sm text-slate-500">
            Temps
          </p>

          <p class="mt-2 text-3xl font-bold">
            {{ formatTime(arrival.elapsedTime) }}
          </p>

        </div>

      </div>

      <div class="mt-6 grid grid-cols-2 gap-4">

        <div class="rounded-2xl bg-slate-50 p-4">

          <p class="text-sm text-slate-500">
            Scanner
          </p>

          <p class="mt-2 font-bold">
            {{ arrival.scanner }}
          </p>

        </div>

        <div class="rounded-2xl bg-slate-50 p-4">

          <p class="text-sm text-slate-500">
            Heure
          </p>

          <p class="mt-2 font-bold">
            {{ formatClock(arrival.arrivalTime) }}
          </p>

        </div>

      </div>

    </template>

    <template v-else>

      <div class="py-16 text-center text-slate-400">

        <div class="text-6xl">
          🏁
        </div>

        <p class="mt-4 text-lg">
          Aucun participant scanné
        </p>

      </div>

    </template>

  </div>
</template>