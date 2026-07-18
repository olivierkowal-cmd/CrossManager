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
  class="group rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
>

  <div class="flex items-start justify-between">

    <div>

      <h2 class="text-2xl font-black text-slate-900">

        {{ race.label }}

      </h2>

      <p class="mt-2 text-slate-500">

        👥 {{ race.participants }} participants

      </p>

    </div>

    <RaceStatusBadge
      :status="race.status"
    />

  </div>

  <div class="mt-8 space-y-5">

    <div class="flex justify-between">

      <span class="text-slate-500">

        🕒 Départ

      </span>

      <span
        v-if="race.startTime"
        class="font-bold"
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

    <div class="flex justify-between">

      <span class="text-slate-500">

        ⏱ Chrono

      </span>

      <RaceTimer
        :race="race"
      />

    </div>

    <div class="flex justify-between">

      <span class="text-slate-500">

        🏁 Arrivées

      </span>

      <span class="font-black text-lg">

        {{ race.arrivals }} / {{ race.participants }}

      </span>

    </div>

  </div>

  <button
    v-if="race.status === 'waiting'"
    @click="startRace"
    class="mt-8 w-full rounded-2xl bg-sky-600 py-4 text-xl font-bold text-white transition-all duration-300 hover:bg-sky-700 hover:scale-[1.02] active:scale-95"
  >

    🏁 Démarrer

  </button>

  <button
    v-else-if="race.status === 'countdown'"
    disabled
    class="mt-8 w-full rounded-2xl bg-orange-500 py-4 text-xl font-bold text-white animate-pulse"
  >

    ⏳ Départ en cours...

  </button>

  <button
    v-else-if="race.status === 'running'"
    disabled
    class="mt-8 w-full rounded-2xl bg-green-600 py-4 text-xl font-bold text-white"
  >

    🟢 Course en cours

  </button>

  <button
    v-else
    disabled
    class="mt-8 w-full rounded-2xl bg-slate-700 py-4 text-xl font-bold text-white"
  >

    ✅ Course terminée

  </button>

</div>

</template>