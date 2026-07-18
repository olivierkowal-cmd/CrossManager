<script setup>
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import { useRaceStore } from "../stores/raceStore"
import { useRaceManagerStore } from "../stores/raceManagerStore"

import { exportResultsToExcel } from "../services/excelExport.js"
import { exportResultsToPDF } from "../services/pdfExport.js"

import ConfirmDialog from "../components/ConfirmDialog.vue"

const router = useRouter()

const raceStore = useRaceStore()
const raceManager = useRaceManagerStore()

const route = useRoute()

const showNewProjectDialog = ref(false)

const title = computed(() => {
  return route.meta.title ?? "CrossManager"
})

const today = computed(() => {
  return new Date().toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
})

function newProject() {
  showNewProjectDialog.value = true
}

function confirmNewProject() {
  showNewProjectDialog.value = false
  raceStore.resetRace()
  router.push("/")
}

function cancelNewProject() {
  showNewProjectDialog.value = false
}

async function exportExcel() {

  const races = raceManager.races.filter(
    race => race.results.length > 0
  )

  if (races.length === 0) {
    alert("Aucun résultat à exporter.")
    return
  }

  await exportResultsToExcel(races)

}

function exportPDF() {

  const races = raceManager.races.filter(
    race => race.results.length > 0
  )

  if (races.length === 0) {
    alert("Aucun résultat à exporter.")
    return
  }

  exportResultsToPDF(
    races,
    raceStore.settings
  )

}
</script>

<template>

  <header class="header">

    <div>

      <p class="subtitle">
        {{ raceStore.settings.schoolName }}
      </p>

      <h1 class="title">
        {{ title }}
      </h1>

    </div>

    <div class="right">

      <div class="date">
        {{ today }}
      </div>

      <button
        class="action-btn"
        @click="newProject"
      >
        🆕 Nouveau projet
      </button>

      <button class="action-btn">
        💾 Sauvegarder
      </button>

      <button
        class="action-btn"
        @click="exportExcel"
      >
        📊 Excel
      </button>

      <button
        class="action-btn"
        @click="exportPDF"
      >
        📄 PDF
      </button>

      <div class="badge">
        🏁 {{ raceStore.settings.eventName }}
      </div>

    </div>

  </header>

  <ConfirmDialog
    :show="showNewProjectDialog"
    title="Nouveau projet"
    message="Toutes les données seront supprimées. Cette action est irréversible."
    @confirm="confirmNewProject"
    @cancel="cancelNewProject"
  />

</template>

<style scoped>
.header{
  min-height:84px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:0 28px;
  background:white;
  border-bottom:1px solid #e2e8f0;
  box-shadow:0 2px 10px rgba(0,0,0,.04);
}

.subtitle{
  margin:0;
  color:#0284c7;
  text-transform:uppercase;
  letter-spacing:.25em;
  font-size:.75rem;
  font-weight:700;
}

.title{
  margin-top:4px;
  font-size:1.8rem;
  font-weight:800;
  color:#0f172a;
}

.right{
  display:flex;
  align-items:center;
  gap:12px;
  flex-wrap:wrap;
}

.date{
  color:#64748b;
  font-weight:600;
}

.badge{
  background:#dcfce7;
  color:#15803d;
  padding:10px 18px;
  border-radius:999px;
  font-weight:700;
}

.action-btn{
  border:none;
  background:#f1f5f9;
  color:#0f172a;
  padding:10px 16px;
  border-radius:12px;
  cursor:pointer;
  font-weight:700;
  transition:.2s;
}

.action-btn:hover{
  background:#0ea5e9;
  color:white;
}
</style>