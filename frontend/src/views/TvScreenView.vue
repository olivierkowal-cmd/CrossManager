<script setup>
import { computed, onMounted } from "vue"

import { useTvStore } from "../stores/tvStore"
import { useFirebaseStore } from "../stores/firebaseStore"

import TvHeader from "../components/tv/TvHeader.vue"
import TvClock from "../components/tv/TvClock.vue"
import TvLastArrival from "../components/tv/TvLastArrival.vue"
import TvRanking from "../components/tv/TvRanking.vue"

const tvStore = useTvStore()

const firebaseStore = useFirebaseStore()

onMounted(async () => {

  console.log(
    "📺 Écran TV : connexion Firebase..."
  )

  try {

    await firebaseStore.connect()

    console.log(
      "📺 Écran TV : Firebase connecté"
    )

  } catch (error) {

    console.error(
      "❌ Écran TV : erreur connexion Firebase :",
      error
    )

  }

})

const currentRace = computed(() => {

  if (!tvStore.runningRaces.length) {

    return null

  }

  return tvStore.runningRaces[0]

})

const ranking = computed(() => {

  if (!currentRace.value) {

    return []

  }

  return tvStore.getRanking(currentRace.value.categorie)

})
</script>

<template>

<div class="min-h-screen bg-slate-100">

<div class="mx-auto max-w-[1800px] space-y-6 p-6">

<TvHeader
:race="currentRace"
/>

<div class="grid gap-6 xl:grid-cols-[2fr_1fr]">

<div>

<TvRanking
:ranking="ranking"
/>

</div>

<div class="space-y-6">

<TvClock />

<TvLastArrival
:arrival="tvStore.lastArrival"
/>

</div>

</div>

</div>

</div>

</template>