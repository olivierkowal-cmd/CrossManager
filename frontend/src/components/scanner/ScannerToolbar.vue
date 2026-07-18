<script setup>

const emit = defineEmits([
  "manual",
  "flash",
  "sound",
  "vibration",
  "settings"
])

</script>

<template>

<div class="rounded-3xl border border-slate-200 bg-white shadow-sm p-5">

<div class="grid grid-cols-5 gap-4">

<button
class="rounded-2xl border p-4 hover:bg-slate-100 transition"
@click="$emit('manual')"
>

<div class="text-3xl">⌨️</div>

<p class="mt-2 text-sm font-semibold">
Manuel
</p>

</button>

<button
class="rounded-2xl border p-4 hover:bg-slate-100 transition"
@click="$emit('flash')"
>

<div class="text-3xl">🔦</div>

<p class="mt-2 text-sm font-semibold">
Lampe
</p>

</button>

<button
class="rounded-2xl border p-4 hover:bg-slate-100 transition"
@click="$emit('sound')"
>

<div class="text-3xl">🔊</div>

<p class="mt-2 text-sm font-semibold">
Son
</p>

</button>

<button
class="rounded-2xl border p-4 hover:bg-slate-100 transition"
@click="$emit('vibration')"
>

<div class="text-3xl">📳</div>

<p class="mt-2 text-sm font-semibold">
Vibreur
</p>

</button>

<button
class="rounded-2xl border p-4 hover:bg-slate-100 transition"
@click="$emit('settings')"
>

<div class="text-3xl">⚙️</div>

<p class="mt-2 text-sm font-semibold">
Réglages
</p>

</button>

</div>

</div>

</template>