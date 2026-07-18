<script setup>
import { computed } from "vue"

const props = defineProps({

  race: {
    type: Object,
    required: true,
  },

})

const progress = computed(() => {

  if (!props.race.participants) return 0

  return Math.min(
    100,
    Math.round((props.race.arrivals / props.race.participants) * 100)
  )

})

const statusClass = computed(() => {

  switch (props.race.status) {

    case "running":
      return "bg-green-100 text-green-700"

    case "finished":
      return "bg-sky-100 text-sky-700"

    case "countdown":
      return "bg-orange-100 text-orange-700"

    default:
      return "bg-yellow-100 text-yellow-700"

  }

})

const statusLabel = computed(() => {

  switch (props.race.status) {

    case "running":
      return "En cours"

    case "finished":
      return "Terminée"

    case "countdown":
      return "Compte à rebours"

    default:
      return "En attente"

  }

})

function elapsedTime() {

  if (!props.race.startTime) {

    return "--:--"

  }

  const end =
    props.race.finishTime ?? Date.now()

  const total = Math.floor(
    (end - props.race.startTime) / 1000
  )

  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

}
</script>

<template>

<div class="rounded-3xl border bg-white p-6 shadow-sm">

<div class="flex items-center justify-between">

<div>

<h2 class="text-xl font-bold">

{{ race.label }}

</h2>

<p class="mt-1 text-slate-500">

{{ race.arrivals }} / {{ race.participants }} arrivés

</p>

</div>

<span
class="rounded-full px-4 py-2 text-sm font-semibold"
:class="statusClass"
>

{{ statusLabel }}

</span>

</div>

<div
class="mt-6 h-4 overflow-hidden rounded-full bg-slate-200"
>

<div
class="h-full rounded-full bg-sky-600 transition-all duration-500"
:style="{ width: progress + '%' }"
></div>

</div>

<div class="mt-5 flex justify-between text-sm">

<span>

{{ progress }} %

</span>

<span>

⏱ {{ elapsedTime() }}

</span>

</div>

</div>

</template>