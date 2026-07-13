<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"

const props = defineProps({
  race: {
    type: Object,
    required: true,
  },
})

const now = ref(Date.now())

let interval = null

onMounted(() => {
  interval = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

const elapsed = computed(() => {
  if (!props.race.startTime) return 0

  if (props.race.status === "finished" && props.race.finishTime) {
    return props.race.finishTime - props.race.startTime
  }

  return now.value - props.race.startTime
})

const formatted = computed(() => {
  const total = Math.floor(elapsed.value / 1000)

  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
})
</script>

<template>
  <span class="font-mono text-lg font-bold text-slate-800">
    {{ formatted }}
  </span>
</template>