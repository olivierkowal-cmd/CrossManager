<script setup>
import { ref } from 'vue'
import { useRaceStore } from '../stores/raceStore'

const raceStore = useRaceStore()
const bibInput = ref('')

function validateArrival() {
  if (!bibInput.value.trim()) return
  raceStore.markArrival(bibInput.value.trim())
  bibInput.value = ''
}
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">Scanner</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">Validation des arrivées</h2>
      <p class="mt-3 text-sm text-slate-500">Saisie de démonstration pour simuler un scan de dossard.</p>

      <div class="mt-6 rounded-2xl border border-dashed border-sky-300 bg-sky-50 p-6">
        <label class="text-sm font-medium text-slate-700" for="bib">Numéro de dossard</label>
        <div class="mt-3 flex flex-col gap-3 sm:flex-row">
          <input id="bib" v-model="bibInput" class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3" placeholder="Ex. 103" />
          <button class="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white" @click="validateArrival">Valider l'arrivée</button>
        </div>
      </div>
    </div>
  </section>
</template>
