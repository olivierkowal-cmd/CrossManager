<script setup>
import { computed } from "vue"
import { useEventStore } from "../../stores/eventStore"

const eventStore = useEventStore()

const events = computed(() => eventStore.events)

function icon(type) {

  switch (type) {

    case "arrival":
      return "🏁"

    case "start":
      return "🚦"

    case "scanner":
      return "📱"

    case "warning":
      return "⚠️"

    case "success":
      return "✅"

    default:
      return "ℹ️"

  }

}

function color(type) {

  switch (type) {

    case "arrival":
      return "text-green-400"

    case "start":
      return "text-sky-400"

    case "scanner":
      return "text-violet-400"

    case "warning":
      return "text-red-400"

    case "success":
      return "text-emerald-400"

    default:
      return "text-slate-300"

  }

}

function formatTime(date) {

  return new Date(date).toLocaleTimeString("fr-BE")

}
</script>

<template>

<div class="rounded-3xl bg-slate-900 p-6 shadow-xl">

  <div class="mb-6 flex items-center justify-between">

    <h2 class="text-2xl font-black text-white">

      📜 Événements

    </h2>

    <button
      class="rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
      @click="eventStore.clearEvents()"
    >

      Effacer

    </button>

  </div>

  <div
    v-if="events.length === 0"
    class="rounded-2xl border-2 border-dashed border-slate-700 py-12 text-center text-slate-500"
  >

    Aucun événement

  </div>

  <div
    v-else
    class="space-y-3 max-h-[420px] overflow-y-auto"
  >

    <div
      v-for="event in events"
      :key="event.id"
      class="flex items-center justify-between rounded-2xl bg-slate-800 px-4 py-3"
    >

      <div class="flex items-center gap-3">

        <span class="text-2xl">

          {{ icon(event.type) }}

        </span>

        <span
          class="font-semibold"
          :class="color(event.type)"
        >

          {{ event.message }}

        </span>

      </div>

      <span class="text-sm text-slate-400">

        {{ formatTime(event.time) }}

      </span>

    </div>

  </div>

</div>

</template>