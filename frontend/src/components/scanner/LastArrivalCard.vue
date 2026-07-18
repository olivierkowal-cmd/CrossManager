<script setup>
import { getRaceLabel } from "../../utils/categoryLabel"

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

<div
class="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden"
>

<div
v-if="arrival"
class="animate-fade"
>

<div
class="bg-green-600 py-8 text-center text-white"
>

<div class="text-8xl">

✅

</div>

<h2
class="mt-3 text-4xl font-black"
>

{{ arrival.participant.prenom }}
{{ arrival.participant.nom }}

</h2>

<p
class="mt-2 text-2xl font-semibold text-green-100"
>

{{ getRaceLabel(arrival.participant.categorie) }}

</p>

</div>

<div class="grid grid-cols-2 gap-5 p-6">

<div
class="rounded-2xl bg-slate-100 p-5 text-center"
>

<p class="text-slate-500">

Position

</p>

<p
class="mt-2 text-5xl font-black text-sky-700"
>

{{ arrival.position }}

</p>

</div>

<div
class="rounded-2xl bg-slate-100 p-5 text-center"
>

<p class="text-slate-500">

Temps

</p>

<p
class="mt-2 text-5xl font-black text-green-700"
>

{{ formatTime(arrival.elapsedTime) }}

</p>

</div>

</div>

<div class="border-t p-6">

<div
class="flex items-center justify-between text-lg"
>

<span class="text-slate-500">

📱 Scanner

</span>

<strong
class="text-3xl font-black"
>

{{ arrival.scanner.replace("Scanner ", "") }}

</strong>

</div>

<div
class="mt-4 flex items-center justify-between text-lg"
>

<span class="text-slate-500">

🕒 Heure

</span>

<strong>

{{ formatClock(arrival.arrivalTime) }}

</strong>

</div>

</div>

</div>

<div
v-else
class="flex h-[520px] flex-col items-center justify-center"
>

<div class="text-8xl">

📷

</div>

<h2
class="mt-6 text-4xl font-black text-slate-700"
>

Scanner prêt

</h2>

<p
class="mt-3 text-xl text-slate-400"
>

En attente d'un dossard...

</p>

</div>

</div>

</template>

<style scoped>

.animate-fade{

animation:arrival .35s ease;

}

@keyframes arrival{

0%{

opacity:0;
transform:scale(.95);

}

100%{

opacity:1;
transform:scale(1);

}

}

</style>