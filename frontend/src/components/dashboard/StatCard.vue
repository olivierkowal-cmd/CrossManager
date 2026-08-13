<script setup>

defineProps({

  title: String,

  value: Number,

  color: String,

})

const colors = {

  yellow: "text-yellow-400",

  green: "text-green-400",

  blue: "text-blue-400",

}

</script>

<template>

<div class="rounded-2xl bg-slate-900 p-5">

  <p class="text-slate-400">

    {{ title }}

  </p>

  <p
    class="mt-2 text-5xl font-black"
    :class="colors[color]"
  >

    {{ value }}

  </p>

</div>

</template>