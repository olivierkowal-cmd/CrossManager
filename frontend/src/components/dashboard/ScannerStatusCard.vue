<script setup>

defineProps({
  name: {
    type: String,
    required: true,
  },

  scanner: {
    type: Object,
    required: true,
  },
})

function formatTimestamp(timestamp) {

  if (!timestamp) return "--"

  try {

    return timestamp.toDate().toLocaleTimeString("fr-BE")

  }

  catch {

    return "--"

  }

}

</script>

<template>

<div
  class="flex items-center justify-between rounded-2xl bg-slate-900 p-4"
>

  <div>

    <p class="text-lg font-bold">
      {{ name }}
    </p>

    <p class="text-sm text-slate-400">
      📷 {{ scanner.scans ?? 0 }} scans
    </p>

    <p class="text-xs text-slate-500">
      ❤️ {{ formatTimestamp(scanner.heartbeat) }}
    </p>

    <p class="text-xs text-slate-500">
      Dernier scan :
      {{ formatTimestamp(scanner.lastScan) }}
    </p>

  </div>

  <div class="text-right space-y-1">

    <p class="text-2xl">
      {{ scanner.connected ? "🟢" : "🔴" }}
    </p>

    <p class="text-xs text-slate-400">
      🔋 {{ scanner.battery ?? 100 }} %
    </p>

    <p class="text-xs text-slate-400">
      📶 {{ scanner.network ?? "--" }}
    </p>

    <p class="text-xs text-slate-500">
      v{{ scanner.version ?? "1.0" }}
    </p>

  </div>

</div>

</template>