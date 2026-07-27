<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const now = ref(new Date())

let interval = null

function updateClock() {
  now.value = new Date()
}

onMounted(() => {

  updateClock()

  interval = setInterval(updateClock, 1000)

})

onUnmounted(() => {

  clearInterval(interval)

})

function format(date) {

  return date.toLocaleTimeString("fr-BE", {

    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",

  })

}
</script>

<template>

<div
  class="rounded-3xl bg-slate-900 px-6 py-5 text-center text-white shadow-lg"
>

  <p
    class="text-xs uppercase tracking-[0.35em] text-slate-400"
  >
    Heure officielle
  </p>

  <p
    class="mt-2 whitespace-nowrap font-mono text-5xl font-black"
  >
    {{ format(now) }}
  </p>

</div>

</template>