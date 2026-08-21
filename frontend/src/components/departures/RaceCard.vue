<script setup>
import RaceStatusBadge from "./RaceStatusBadge.vue"
import RaceTimer from "./RaceTimer.vue"

const props = defineProps({
  race: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  "start",
  "finish",
  "reset",
])

function startRace() {
  emit("start", props.race.categorie)
}

function finishRace() {
  emit("finish", props.race.categorie)
}

function resetRace() {
  emit("reset", props.race.categorie)
}
</script>

<template>
  <div
    class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
  >

    <div class="flex items-start justify-between">

      <div>

        <h2 class="text-xl font-bold text-slate-900">
          {{ race.label }}
        </h2>

        <p class="mt-1 text-slate-500">
          {{ race.participants }} participants
        </p>

      </div>

      <RaceStatusBadge :status="race.status" />

    </div>

    <div class="mt-6 space-y-4">

      <div class="flex items-center justify-between">

        <span class="text-slate-500">
          Départ
        </span>

        <span
          v-if="race.startTime"
          class="font-semibold"
        >
          {{ new Date(race.startTime).toLocaleTimeString() }}
        </span>

        <span
          v-else
          class="text-slate-400"
        >
          --
        </span>

      </div>

      <div class="flex items-center justify-between">

        <span class="text-slate-500">
          Temps écoulé
        </span>

        <RaceTimer :race="race" />

      </div>

      <div class="flex items-center justify-between">

        <span class="text-slate-500">
          Arrivées
        </span>

        <span class="font-bold">
          {{ race.arrivals }} / {{ race.participants }}
        </span>

      </div>

    </div>

    <!-- COURSE EN ATTENTE -->

    <button
      v-if="race.status === 'waiting'"
      @click="startRace"
      class="mt-8 w-full rounded-xl bg-sky-600 py-3 text-lg font-semibold text-white transition hover:bg-sky-700"
    >
      🏁 Démarrer
    </button>

    <!-- COURSE EN COURS -->

    <div
      v-else-if="race.status === 'running'"
      class="mt-8 space-y-3"
    >

      <button
        disabled
        class="w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white opacity-90"
      >
        🟢 Course en cours
      </button>

      <button
        @click="finishRace"
        class="w-full rounded-xl bg-red-600 py-3 text-lg font-semibold text-white transition hover:bg-red-700"
      >
        ⛔ Terminer la course
      </button>

      <button
        @click="resetRace"
        class="w-full rounded-xl bg-slate-200 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-300"
      >
        🔄 Réinitialiser
      </button>

    </div>

    <!-- COMPTE À REBOURS -->

    <div
      v-else-if="race.status === 'countdown'"
      class="mt-8 space-y-3"
    >

      <button
        disabled
        class="w-full rounded-xl bg-orange-500 py-3 text-lg font-semibold text-white"
      >
        ⏳ Compte à rebours
      </button>

      <button
        @click="resetRace"
        class="w-full rounded-xl bg-slate-200 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-300"
      >
        🔄 Annuler / Réinitialiser
      </button>

    </div>

    <!-- COURSE TERMINÉE -->

    <div
      v-else
      class="mt-8 space-y-3"
    >

      <button
        disabled
        class="w-full rounded-xl bg-slate-700 py-3 text-lg font-semibold text-white"
      >
        ✅ Terminée
      </button>

      <button
        @click="resetRace"
        class="w-full rounded-xl bg-sky-600 py-3 text-lg font-semibold text-white transition hover:bg-sky-700"
      >
        🔄 Réinitialiser la course
      </button>

    </div>

  </div>
</template>