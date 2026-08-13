<script setup>

defineProps({

  events: {
    type: Array,
    default: () => [],
  },

})

</script>

<template>

<div class="rounded-3xl bg-slate-950 p-6 text-white">

  <h2 class="text-2xl font-black">
    📜 Activité
  </h2>

  <div class="mt-5 space-y-2">

    <div
      v-for="event in events"
      :key="event.id"
      class="rounded-xl bg-slate-900 p-3"
    >

      <div class="flex items-center justify-between">

        <span class="font-medium">

          {{ event.message }}

        </span>

        <span class="text-xs text-slate-400">

          {{ new Date(event.timestamp).toLocaleTimeString("fr-BE") }}

        </span>

      </div>

    </div>

    <div
      v-if="events.length === 0"
      class="text-slate-400"
    >
      Aucun événement.
    </div>

  </div>

</div>

</template>