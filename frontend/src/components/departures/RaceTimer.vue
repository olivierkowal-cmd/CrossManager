<script setup>

import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from "vue"


const props = defineProps({

  race: {

    type: Object,

    required: true,

  },

})


const now = ref(Date.now())

let interval = null


// =====================================================
// HORLOGE
// =====================================================

onMounted(() => {

  interval = setInterval(() => {

    now.value = Date.now()

  }, 1000)

})


onUnmounted(() => {

  if (interval) {

    clearInterval(interval)

  }

})


// =====================================================
// CONVERSION TIMESTAMP
// =====================================================

function timestampToMilliseconds(value) {

  if (!value) {
    return null
  }


  // Timestamp Firestore
  if (
    typeof value === "object" &&
    typeof value.toMillis === "function"
  ) {

    return value.toMillis()

  }


  // Date JavaScript
  if (value instanceof Date) {

    return value.getTime()

  }


  // Nombre
  if (typeof value === "number") {

    // Secondes Unix
    if (value < 100000000000) {

      return value * 1000

    }

    // Millisecondes Unix
    return value

  }


  // Chaîne de caractères
  if (typeof value === "string") {

    const numericValue = Number(value)

    if (!Number.isNaN(numericValue)) {

      if (numericValue < 100000000000) {

        return numericValue * 1000

      }

      return numericValue

    }


    const parsedDate = Date.parse(value)

    if (!Number.isNaN(parsedDate)) {

      return parsedDate

    }

  }


  return null

}


// =====================================================
// TEMPS ÉCOULÉ
// =====================================================

const elapsed = computed(() => {

  const startTime =
    timestampToMilliseconds(
      props.race.startTime
    )


  if (!startTime) {

    return 0

  }


  if (
    props.race.status === "finished" &&
    props.race.finishTime
  ) {

    const finishTime =
      timestampToMilliseconds(
        props.race.finishTime
      )


    if (finishTime) {

      return Math.max(
        0,
        finishTime - startTime
      )

    }

  }


  return Math.max(
    0,
    now.value - startTime
  )

})


// =====================================================
// FORMATAGE
// =====================================================

const formatted = computed(() => {

  const totalSeconds =
    Math.floor(
      elapsed.value / 1000
    )


  const hours =
    Math.floor(
      totalSeconds / 3600
    )


  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    )


  const seconds =
    totalSeconds % 60


  if (hours > 0) {

    return (
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`
    )

  }


  return (
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`
  )

})

</script>


<template>

  <span
    class="font-mono text-lg font-bold text-slate-800"
  >

    {{ formatted }}

  </span>

</template>