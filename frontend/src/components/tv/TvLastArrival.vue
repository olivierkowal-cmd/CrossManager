<script setup>
import { computed } from "vue"
import { getRaceLabel } from "../../utils/categoryLabel"

const props = defineProps({
  arrival: {
    type: Object,
    default: null,
  },
})

function formatElapsed(milliseconds) {

  if (!milliseconds) return "00:00"

  const total = Math.floor(milliseconds / 1000)

  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

}

const fullName = computed(() => {

  if (!props.arrival) return ""

  return `${props.arrival.participant.prenom} ${props.arrival.participant.nom}`

})
</script>

<template>

<div
class="rounded-3xl border-4 border-green-500 bg-white p-8 shadow-xl"
>

<h2
class="text-center text-3xl font-black text-green-700"
>

🏁 Dernière arrivée

</h2>

<template v-if="arrival">

<div
class="mt-8 text-center animate-pulse"
>

<p
class="text-5xl font-black text-slate-900"
>

{{ fullName }}

</p>

<p
class="mt-4 text-2xl font-semibold text-slate-600"
>

{{ getRaceLabel(arrival.participant.categorie) }}

</p>

</div>

<div
class="mt-10 grid grid-cols-3 gap-6"
>

<div
class="rounded-2xl bg-sky-50 p-6 text-center"
>

<p
class="text-slate-500"
>

Position

</p>

<p
class="mt-2 text-5xl font-black text-sky-700"
>

{{ arrival.position }}

</p>

</div>

<div
class="rounded-2xl bg-green-50 p-6 text-center"
>

<p
class="text-slate-500"
>

Temps

</p>

<p
class="mt-2 text-5xl font-black text-green-700"
>

{{ formatElapsed(arrival.elapsedTime) }}

</p>

</div>

<div
class="rounded-2xl bg-slate-100 p-6 text-center"
>

<p
class="text-slate-500"
>

📱 Scanner

</p>

<p
class="mt-2 text-4xl font-black"
>

{{ arrival.scanner.replace("Scanner ", "") }}

</p>

</div>

</div>

</template>

<template v-else>

<div
class="py-20 text-center text-slate-400"
>

<div class="text-8xl">

🏁

</div>

<p
class="mt-6 text-3xl"
>

En attente de la première arrivée

</p>

</div>

</template>

</div>

</template>

<style scoped>

@keyframes flashArrival{

0%{
transform:scale(.96);
opacity:0;
}

100%{
transform:scale(1);
opacity:1;
}

}

.animate-pulse{

animation:flashArrival .45s ease;

}

</style>