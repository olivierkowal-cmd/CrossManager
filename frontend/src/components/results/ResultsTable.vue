<script setup>
import { getRaceLabel } from "../../utils/categoryLabel"

defineProps({

  results: {
    type: Array,
    default: () => [],
  },

})

function formatTime(milliseconds) {

  if (!milliseconds) return "00:00"

  const total = Math.floor(milliseconds / 1000)

  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`

}

function medal(position) {

  if (position === 1) return "🥇"

  if (position === 2) return "🥈"

  if (position === 3) return "🥉"

  return position

}
</script>

<template>

<div class="overflow-hidden rounded-3xl border bg-white shadow-xl">

  <div class="bg-sky-700 p-6 text-white">

    <h2 class="text-3xl font-black tracking-wide">

      🏆 Classement officiel

    </h2>

  </div>

  <table class="w-full">

    <thead class="bg-slate-100">

      <tr>

        <th class="p-4 text-left">
          #
        </th>

        <th class="p-4 text-left">
          Nom
        </th>

        <th class="p-4 text-left">
          Course
        </th>

        <th class="p-4 text-left">
          Scanner
        </th>

        <th class="p-4 text-right">
          Temps
        </th>

      </tr>

    </thead>

    <tbody>

      <tr
        v-for="runner in results"
        :key="runner.participant.id"
        :class="[
          'border-t transition hover:bg-sky-50',
          runner.position === 1 ? 'bg-yellow-50' : '',
          runner.position === 2 ? 'bg-slate-100' : '',
          runner.position === 3 ? 'bg-orange-50' : '',
        ]"
      >

        <td class="p-4 text-2xl font-black">

          {{ medal(runner.position) }}

        </td>

        <td class="p-4">

          <p class="text-lg font-bold">

            {{ runner.participant.prenom }}
            {{ runner.participant.nom }}

          </p>

        </td>

        <td class="p-4 font-semibold">

          {{ getRaceLabel(runner.participant.categorie) }}

        </td>

        <td class="p-4 font-semibold">

          {{ runner.scanner.replace("Scanner ", "S") }}

        </td>

        <td class="p-4 text-right text-xl font-black text-sky-700">

          {{ formatTime(runner.elapsedTime) }}

        </td>

      </tr>

      <tr v-if="!results.length">

        <td
          colspan="5"
          class="p-16 text-center text-slate-400"
        >

          <div class="text-7xl">

            🏁

          </div>

          <p class="mt-5 text-2xl">

            Aucun résultat disponible

          </p>

        </td>

      </tr>

    </tbody>

  </table>

</div>

</template>