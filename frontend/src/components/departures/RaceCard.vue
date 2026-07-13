<script setup>
import RaceStatusBadge from "./RaceStatusBadge.vue"
import RaceTimer from "./RaceTimer.vue"

const props = defineProps({
  race: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["start"])

function startRace() {
  emit("start", props.race.categorie)
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

    <button
      v-if="race.status === 'waiting'"
      @click="startRace"
      class="mt-8 w-full rounded-xl bg-sky-600 py-3 text-lg font-semibold text-white transition hover:bg-sky-700"
    >
      🏁 Démarrer
    </button>

    <button
      v-else-if="race.status === 'running'"
      disabled
      class="mt-8 w-full rounded-xl bg-green-600 py-3 text-lg font-semibold text-white opacity-90"
    >
      🟢 Course en cours
    </button>

    <button
      v-else-if="race.status === 'countdown'"
      disabled
      class="mt-8 w-full rounded-xl bg-orange-500 py-3 text-lg font-semibold text-white"
    >
      ⏳ Compte à rebours
    </button>

    <button
      v-else
      disabled
      class="mt-8 w-full rounded-xl bg-slate-700 py-3 text-lg font-semibold text-white"
    >
      ✅ Terminée
    </button>
  </div>
</template>