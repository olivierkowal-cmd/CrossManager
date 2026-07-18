<script setup>

defineProps({

  title: {
    type: String,
    required: true,
  },

  value: {
    type: [String, Number],
    required: true,
  },

  color: {
    type: String,
    default: "sky",
  },

  icon: {
    type: String,
    default: "📊",
  },

})

const colors = {

  sky: "text-sky-700 bg-sky-50",

  green: "text-green-700 bg-green-50",

  orange: "text-orange-700 bg-orange-50",

  purple: "text-purple-700 bg-purple-50",

  red: "text-red-700 bg-red-50",

}

</script>

<template>

<div
class="rounded-3xl border bg-white shadow-sm p-6 transition hover:shadow-lg"
>

<div class="flex items-center justify-between">

<div>

<p class="text-sm uppercase tracking-[0.25em] text-slate-500">

{{ title }}

</p>

<p
class="mt-5 text-5xl font-black"
:class="colors[color]"
>

{{ value }}

</p>

</div>

<div
class="flex h-20 w-20 items-center justify-center rounded-2xl text-5xl"
:class="colors[color]"
>

{{ icon }}

</div>

</div>

</div>

</template>