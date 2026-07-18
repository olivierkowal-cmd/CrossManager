<script setup>

const props = defineProps({

  race: {
    type: Object,
    default: null,
  },

})

</script>

<template>

<header
class="rounded-3xl bg-sky-700 p-8 text-white shadow-lg"
>

<div class="flex items-center justify-between">

<div>

<p class="uppercase tracking-[0.45em] text-sky-200 text-sm font-semibold">

ISM RÈVES

</p>

<h1 class="mt-2 text-5xl font-black">

CrossManager

</h1>

<p class="mt-3 text-2xl">

{{ race ? race.label : "Aucune course en cours" }}

</p>

</div>

<div class="text-right">

<div class="text-7xl">

🏃

</div>

</div>

</div>

</header>

</template>