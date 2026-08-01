<script setup>

defineProps({

  title: String,

  value: [String, Number],

  subtitle: String,

  color: String,

})

</script>

<template>

<div
  :class="[
    'rounded-3xl p-6 text-white shadow-lg',
    color,
  ]"
>

  <p
    class="text-sm uppercase tracking-wider opacity-80"
  >
    {{ title }}
  </p>

  <p
    class="mt-2 text-5xl font-black"
  >
    {{ value }}
  </p>

  <p
    v-if="subtitle"
    class="mt-3 opacity-80"
  >
    {{ subtitle }}
  </p>

</div>

</template>
