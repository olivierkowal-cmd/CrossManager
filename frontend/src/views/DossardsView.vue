<script setup>
import { computed } from "vue"
import { useRaceStore } from "../stores/raceStore"
import DossardCard from "../components/DossardCard.vue"

const raceStore = useRaceStore()

const participants = computed(() => raceStore.participants)

function imprimer() {
  window.print()
}

function exporterPDF() {
  alert("L'export PDF sera ajouté dans l'étape suivante.")
}
</script>

<template>
  <section class="space-y-6">

    <!-- Barre d'actions -->
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div class="flex justify-between items-center">

        <div>
          <p class="uppercase tracking-[0.35em] text-sky-600 text-sm font-semibold">
            CrossManager
          </p>

          <h1 class="text-3xl font-bold mt-2">
            Dossards
          </h1>

          <p class="text-slate-500 mt-2">
            Impression des dossards ISM Rèves
          </p>
        </div>

        <div class="flex gap-3">

          <button
            class="rounded-xl bg-sky-600 text-white px-6 py-3 font-semibold hover:bg-sky-700"
          >
            Générer
          </button>

          <button
            class="rounded-xl border border-slate-300 px-6 py-3 font-semibold"
            @click="exporterPDF"
          >
            Export PDF
          </button>

          <button
            class="rounded-xl border border-slate-300 px-6 py-3 font-semibold"
            @click="imprimer"
          >
            Imprimer
          </button>

        </div>

      </div>

    </div>

    <!-- Les dossards -->

    <div
      class="grid grid-cols-2 gap-8 print:grid-cols-2"
    >

      <DossardCard
        v-for="participant in participants"
        :key="participant.id"
        :participant="participant"
      />

    </div>

  </section>
</template>

<style scoped>

@media print {

button{
display:none;
}

section{
padding:0;
margin:0;
}

}

</style>