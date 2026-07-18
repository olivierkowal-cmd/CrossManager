<script setup>
import { computed, ref } from "vue"

import { useRaceManagerStore } from "../stores/raceManagerStore"

import ResultsTable from "../components/results/ResultsTable.vue"

import { exportResultsToExcel } from "../services/excelExport"

const raceManager = useRaceManagerStore()

const selectedCategory = ref("all")
const search = ref("")

const categories = computed(() => {

  return raceManager.races.map(r => ({

    label: r.label,

    value: r.categorie,

  }))

})

const results = computed(() => {

  let list = raceManager.races.flatMap(r => r.results)

  if (selectedCategory.value !== "all") {

    list = list.filter(
      r => r.participant.categorie === selectedCategory.value
    )

  }

  if (search.value.trim()) {

    const value = search.value.toLowerCase()

    list = list.filter(r => {

      const fullname =
        `${r.participant.prenom} ${r.participant.nom}`.toLowerCase()

      return fullname.includes(value)

    })

  }

  return [...list].sort(
    (a, b) => a.elapsedTime - b.elapsedTime
  )

})

function exportPdf() {

  alert("Export PDF disponible prochainement.")

}

function exportExcel() {

  exportResultsToExcel(raceManager.races)

}

function printResults() {

  window.print()

}
</script>

<template>

<section class="space-y-8">

  <div>

    <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">

      CrossManager

    </p>

    <h1 class="mt-2 text-4xl font-black">

      Résultats

    </h1>

    <p class="mt-2 text-slate-500">

      Classements et arrivées.

    </p>

  </div>

  <div class="grid gap-4 md:grid-cols-[1fr_300px_auto_auto_auto]">

    <input

      v-model="search"

      type="text"

      placeholder="🔍 Rechercher un participant..."

      class="rounded-xl border p-3"

    />

    <select

      v-model="selectedCategory"

      class="rounded-xl border p-3"

    >

      <option value="all">

        Toutes les catégories

      </option>

      <option

        v-for="category in categories"

        :key="category.value"

        :value="category.value"

      >

        {{ category.label }}

      </option>

    </select>

    <button

      class="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"

      @click="exportPdf"

    >

      📄 PDF

    </button>

    <button

      class="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"

      @click="exportExcel"

    >

      📊 Excel

    </button>

    <button

      class="rounded-xl bg-slate-800 px-6 py-3 font-bold text-white transition hover:bg-slate-900"

      @click="printResults"

    >

      🖨 Imprimer

    </button>

  </div>

  <ResultsTable

    :results="results"

  />

</section>

</template>