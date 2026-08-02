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

  subtitle: {
    type: String,
    default: "",
  },

  icon: {
    type: String,
    default: "📊",
  },

  color: {
    type: String,
    default: "bg-sky-600",
  },

})

</script>

<template>

<div
  :class="[
    'relative overflow-hidden rounded-3xl p-6 text-white shadow-lg transition-transform duration-200 hover:scale-[1.02]',
    color,
  ]"
>

  <div class="absolute right-5 top-4 text-4xl opacity-20">

    {{ icon }}

  </div>

  <p
    class="text-sm uppercase tracking-wider opacity-80"
  >

    {{ title }}

  </p>

  <p
    class="mt-3 text-5xl font-black leading-none"
  >

    {{ value }}

  </p>

  <p
    v-if="subtitle"
    class="mt-4 text-sm opacity-80"
  >

    {{ subtitle }}

  </p>

</div>

</template>