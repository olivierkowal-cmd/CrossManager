<script setup>
defineProps({
  scanner: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="rounded-3xl bg-slate-900 p-6 text-white shadow-lg">

    <div class="flex items-center justify-between">

      <h3 class="text-xl font-black">
        {{ scanner.name }}
      </h3>

      <span :class="scanner.connected ? 'text-green-400' : 'text-slate-500'">
        {{ scanner.connected ? '🟢 Connecté' : '⚪ En attente' }}
      </span>

    </div>

    <div class="mt-4">

      <p>
        📷 Scans :
        <strong>{{ scanner.scans }}</strong>
      </p>

      <p class="text-slate-400">
        Dernier scan :
        <span v-if="scanner.lastScan">
          {{ new Date(scanner.lastScan).toLocaleTimeString('fr-BE') }}
        </span>
        <span v-else>
          Aucun
        </span>
      </p>

    </div>

  </div>
</template>