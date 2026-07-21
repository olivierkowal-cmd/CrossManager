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
  "reset-race",
])

function startRace() {
  emit(
    "start",
    props.race.categorie
  )
}

function resetRace() {

  console.log(
    "🔄 Clic réinitialiser dans RaceCard :",
    props.race.categorie
  )

  emit(
    "reset-race",
    props.race.categorie
  )

  console.log(
    "📤 Événement reset-race émis :",
    props.race.categorie
  )

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

      <span class="text-lg font-black">
        {{ race.arrivals }} / {{ race.participants }}
      </span>

    </div>

  </div>


  <!-- COURSE EN ATTENTE -->

  <div
    v-if="race.status === 'waiting'"
    class="mt-8"
  >

    <button
      type="button"
      class="w-full rounded-2xl bg-sky-600 py-4 text-xl font-bold text-white transition hover:bg-sky-700"
      @click="startRace"
    >
      🏁 Démarrer
    </button>

  </div>


  <!-- COMPTE À REBOURS -->

  <div
    v-else-if="race.status === 'countdown'"
    class="mt-8 space-y-3"
  >

    <button
      type="button"
      disabled
      class="w-full rounded-2xl bg-orange-500 py-4 text-xl font-bold text-white animate-pulse"
    >
      ⏳ Départ en cours...
    </button>

    <button
      type="button"
      class="w-full rounded-2xl border-2 border-red-500 bg-white py-3 font-bold text-red-600 transition hover:bg-red-50"
      @click="resetRace"
    >
      🔄 Réinitialiser
    </button>

  </div>


  <!-- COURSE EN COURS -->

  <div
    v-else-if="race.status === 'running'"
    class="mt-8 space-y-3"
  >

    <button
      type="button"
      disabled
      class="w-full rounded-2xl bg-green-600 py-4 text-xl font-bold text-white"
    >
      🟢 Course en cours
    </button>

    <button
      type="button"
      class="w-full rounded-2xl border-2 border-red-500 bg-white py-3 font-bold text-red-600 transition hover:bg-red-50"
      @click="resetRace"
    >
      🔄 Réinitialiser
    </button>

  </div>


  <!-- COURSE TERMINÉE -->

  <div
    v-else
    class="mt-8 space-y-3"
  >

    <button
      type="button"
      disabled
      class="w-full rounded-2xl bg-slate-700 py-4 text-xl font-bold text-white"
    >
      ✅ Course terminée
    </button>

    <button
      type="button"
      class="w-full rounded-2xl border-2 border-red-500 bg-white py-3 font-bold text-red-600 transition hover:bg-red-50"
      @click="resetRace"
    >
      🔄 Réinitialiser
    </button>

  </div>

</div>

</template>