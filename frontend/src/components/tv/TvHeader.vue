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
  class="rounded-3xl bg-sky-700 px-8 py-5 text-white shadow-lg"
>

  <div class="flex items-center justify-between">

    <div>

      <p
        class="text-xs font-semibold uppercase tracking-[0.45em] text-sky-200"
      >
        ISM RÈVES
      </p>

      <h1
        class="mt-1 text-4xl font-black"
      >
        CrossManager
      </h1>

      <p
        class="mt-1 text-xl"
      >
        {{ race ? race.label : "Aucune course en cours" }}
      </p>

    </div>

    <div class="text-5xl">
      🏃
    </div>

  </div>

</header>

</template>