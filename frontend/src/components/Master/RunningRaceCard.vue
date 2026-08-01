<script setup>

defineProps({

  race: {
    type: Object,
    required: true,
  },

})

</script>

<template>

<div
  class="rounded-3xl bg-slate-900 p-6 text-white shadow-lg"
>

  <div class="flex items-center justify-between">

    <h3
      class="text-2xl font-black"
    >
      {{ race.label }}
    </h3>

    <span
      class="rounded-full bg-green-600 px-3 py-1 text-sm font-bold"
    >
      EN COURS
    </span>

  </div>

  <div
    class="mt-5 flex justify-between text-lg"
  >

    <span>

      {{ race.arrivals }}

      /

      {{ race.participants }}

    </span>

    <span>

      {{
        race.participants
          ? Math.round(
              race.arrivals /
              race.participants *
              100
            )
          : 0
      }} %

    </span>

  </div>

  <div
    class="mt-3 h-4 overflow-hidden rounded-full bg-slate-700"
  >

    <div
      class="h-full rounded-full bg-green-500 transition-all duration-500"
      :style="{
        width:
          (
            race.participants
              ? race.arrivals /
                race.participants *
                100
              : 0
          ) + '%'
      }"
    >
    </div>

  </div>

</div>

</template>