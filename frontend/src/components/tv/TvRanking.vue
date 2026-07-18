<script setup>
import { computed } from "vue"
import { getRaceLabel } from "../../utils/categoryLabel"

const props = defineProps({

  ranking: {
    type: Array,
    default: () => [],
  },

})

const podium = computed(() => props.ranking.slice(0, 3))
const others = computed(() => props.ranking.slice(3))

function formatElapsed(milliseconds) {

  if (!milliseconds) return "00:00"

  const total = Math.floor(milliseconds / 1000)

  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

}

function medal(position) {

  if (position === 1) return "🥇"
  if (position === 2) return "🥈"
  if (position === 3) return "🥉"

  return position

}
</script>

<template>

<div class="rounded-3xl bg-white shadow-xl border">

  <div class="bg-sky-700 p-6 text-white">

    <h2 class="text-4xl font-black tracking-wide">

      🏆 CLASSEMENT EN DIRECT

    </h2>

  </div>

  <div v-if="ranking.length">

    <!-- Podium -->

    <div
      v-for="runner in podium"
      :key="runner.participant.id"
      class="flex items-center justify-between border-b bg-gradient-to-r from-yellow-100 to-white px-8 py-6 shadow-sm"
    >

      <div class="flex items-center gap-6">

        <div class="text-5xl">

          {{ medal(runner.position) }}

        </div>

        <div>

          <p class="text-3xl font-black">

            {{ runner.participant.prenom }}
            {{ runner.participant.nom }}

          </p>

          <p class="text-slate-500 text-xl">

            {{ getRaceLabel(runner.participant.categorie) }}

          </p>

        </div>

      </div>

      <div class="text-5xl font-black text-sky-700">

        {{ formatElapsed(runner.elapsedTime) }}

      </div>

    </div>

    <!-- Autres -->

    <div
      v-for="runner in others"
      :key="runner.participant.id"
      class="flex items-center justify-between border-b px-8 py-5 transition hover:bg-sky-50"
    >

      <div class="flex items-center gap-5">

        <div class="w-12 text-center text-2xl font-bold">

          {{ runner.position }}

        </div>

        <div>

          <p class="text-2xl font-semibold">

            {{ runner.participant.prenom }}
            {{ runner.participant.nom }}

          </p>

          <p class="text-slate-500">

            {{ getRaceLabel(runner.participant.categorie) }}

          </p>

        </div>

      </div>

      <div class="text-3xl font-bold">

        {{ formatElapsed(runner.elapsedTime) }}

      </div>

    </div>

  </div>

  <div
    v-else
    class="py-24 text-center text-slate-400"
  >

    <div class="text-8xl">

      🏁

    </div>

    <p class="mt-6 text-3xl">

      En attente du départ

    </p>

  </div>

</div>

</template>