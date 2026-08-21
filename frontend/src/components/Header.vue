<script setup>

import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"

import { useRaceStore } from "../stores/raceStore"
import { useRaceManagerStore } from "../stores/raceManagerStore"
import { useScannerStore } from "../stores/scannerStore"

import {
  resetRaceFirestore,
  saveRaceFirestore,
} from "../services/raceService"

import {
  saveParticipant,
  deleteParticipantFirestore,
} from "../services/participantService"

import {
  exportResultsToExcel,
} from "../services/excelExport.js"

import {
  exportResultsToPDF,
} from "../services/pdfExport.js"

import ConfirmDialog from "./ConfirmDialog.vue"


const router = useRouter()
const route = useRoute()

const raceStore = useRaceStore()
const raceManager = useRaceManagerStore()
const scannerStore = useScannerStore()

const showNewProjectDialog = ref(false)
const showRestoreDialog = ref(false)

const resetting = ref(false)
const saving = ref(false)
const restoring = ref(false)

const restoreInput = ref(null)


// =====================================================
// TITRE
// =====================================================

const title = computed(() => {

  return route.meta.title || "Dashboard"

})


// =====================================================
// DATE
// =====================================================

const today = computed(() => {

  return new Date().toLocaleDateString(
    "fr-BE",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  )

})


// =====================================================
// NOUVEAU PROJET
// =====================================================

function newProject() {

  if (resetting.value) {
    return
  }

  showNewProjectDialog.value = true

}


// =====================================================
// CONFIRMATION NOUVEAU PROJET
// =====================================================

async function confirmNewProject() {

  if (resetting.value) {
    return
  }

  resetting.value = true

  try {

    console.log(
      "🧹 Début de la réinitialisation complète..."
    )


    // -------------------------------------------------
    // Réinitialiser toutes les courses Firestore
    // -------------------------------------------------

    const racesToReset = [
      ...raceManager.races,
    ]


    for (const race of racesToReset) {

      if (!race?.categorie) {
        continue
      }

      await resetRaceFirestore(
        race.categorie
      )

      console.log(
        "✅ Course réinitialisée :",
        race.categorie
      )

    }


    // -------------------------------------------------
    // Réinitialiser localement
    // -------------------------------------------------

    raceManager.resetAllRaces()

    scannerStore.resetScanner()

    raceStore.arrivals = []

    raceStore.timer.started = false
    raceStore.timer.paused = false
    raceStore.timer.officialStartTime = null
    raceStore.timer.elapsed = 0


    // -------------------------------------------------
    // Conserver les paramètres de l'école
    // -------------------------------------------------

    raceStore.settings.schoolName =
      "ISM Rèves"

    raceStore.settings.eventName =
      "Cross scolaire 2026"


    showNewProjectDialog.value = false


    console.log(
      "✅ Nouveau projet prêt"
    )


    await router.push("/")


  } catch (error) {

    console.error(
      "❌ Erreur réinitialisation :",
      error
    )


    alert(
      "Impossible de réinitialiser les courses.\n\nVérifie la connexion."
    )

  } finally {

    resetting.value = false

  }

}


// =====================================================
// ANNULER NOUVEAU PROJET
// =====================================================

function cancelNewProject() {

  if (resetting.value) {
    return
  }

  showNewProjectDialog.value = false

}


// =====================================================
// SAUVEGARDER
// =====================================================

function saveProject() {

  if (saving.value) {
    return
  }

  saving.value = true

  try {

    const backup = {

      version: "1.0",

      application: "CrossManager",

      savedAt:
        new Date().toISOString(),

      settings: {
        ...raceStore.settings,
      },

      participants:
        raceStore.participants.map(
          participant => ({
            ...participant,
          })
        ),

      races:
        raceManager.races.map(
          race => ({

            id: race.id,

            categorie:
              race.categorie,

            label:
              race.label,

            status:
              race.status,

            startTime:
              race.startTime,

            finishTime:
              race.finishTime,

            participants:
              race.participants,

            arrivals:
              race.arrivals,

            results:
              Array.isArray(race.results)
                ? race.results.map(
                    result => ({

                      ...result,

                      participant:
                        result.participant
                          ? {
                              ...result.participant,
                            }
                          : null,

                    })
                  )
                : [],

          })
        ),

    }


    const json =
      JSON.stringify(
        backup,
        null,
        2
      )


    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json;charset=utf-8",
        }
      )


    const url =
      URL.createObjectURL(blob)


    const now =
      new Date()


    const filename =
      `CrossManager_Sauvegarde_${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}_${String(
        now.getHours()
      ).padStart(2, "0")}-${String(
        now.getMinutes()
      ).padStart(2, "0")}.json`


    const link =
      document.createElement("a")

    link.href = url
    link.download = filename

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    URL.revokeObjectURL(url)


    console.log(
      "💾 Sauvegarde créée :",
      filename
    )


    alert(
      "Sauvegarde créée avec succès."
    )


  } catch (error) {

    console.error(
      "❌ Erreur sauvegarde :",
      error
    )


    alert(
      "Impossible de créer la sauvegarde."
    )

  } finally {

    saving.value = false

  }

}


// =====================================================
// OUVRIR RESTAURATION
// =====================================================

function openRestore() {

  if (restoring.value) {
    return
  }

  restoreInput.value?.click()

}


// =====================================================
// SÉLECTION DU FICHIER
// =====================================================

async function handleRestoreSelection(event) {

  const file =
    event.target.files?.[0]


  event.target.value = ""


  if (!file) {
    return
  }


  if (
    !file.name
      .toLowerCase()
      .endsWith(".json")
  ) {

    alert(
      "Veuillez sélectionner un fichier de sauvegarde JSON."
    )

    return

  }


  try {

    const text =
      await file.text()


    const backup =
      JSON.parse(text)


    // -------------------------------------------------
    // Vérification minimale
    // -------------------------------------------------

    if (
      !backup ||
      backup.application !== "CrossManager" ||
      !Array.isArray(backup.participants) ||
      !Array.isArray(backup.races)
    ) {

      throw new Error(
        "Fichier de sauvegarde CrossManager invalide."
      )

    }


    // -------------------------------------------------
    // Conserver temporairement la sauvegarde
    // -------------------------------------------------

    pendingBackup.value =
      backup

    pendingBackupName.value =
      file.name

    showRestoreDialog.value =
      true


  } catch (error) {

    console.error(
      "❌ Fichier de sauvegarde invalide :",
      error
    )


    alert(
      "Ce fichier n'est pas une sauvegarde CrossManager valide."
    )

  }

}


// =====================================================
// SAUVEGARDE EN ATTENTE
// =====================================================

const pendingBackup =
  ref(null)

const pendingBackupName =
  ref("")


// =====================================================
// ANNULER RESTAURATION
// =====================================================

function cancelRestore() {

  if (restoring.value) {
    return
  }

  pendingBackup.value = null
  pendingBackupName.value = ""

  showRestoreDialog.value = false

}


// =====================================================
// CONFIRMER RESTAURATION
// =====================================================

async function confirmRestore() {

  if (
    restoring.value ||
    !pendingBackup.value
  ) {

    return

  }


  restoring.value = true


  try {

    const backup =
      pendingBackup.value


    console.log(
      "📂 Début restauration :",
      pendingBackupName.value
    )


    // =================================================
    // 1. SUPPRIMER LES PARTICIPANTS ACTUELS
    // =================================================

    const currentParticipants =
      [...raceStore.participants]


    for (
      const participant
      of currentParticipants
    ) {

      await deleteParticipantFirestore(
        participant.id
      )

    }


    console.log(
      "🗑️ Participants actuels supprimés"
    )


    // =================================================
    // 2. RECRÉER LES PARTICIPANTS
    // =================================================

    for (
      const participant
      of backup.participants
    ) {

      await saveParticipant(
        participant
      )

    }


    console.log(
      "👥 Participants restaurés :",
      backup.participants.length
    )


    // =================================================
    // 3. RESTAURER LES COURSES
    // =================================================

    for (
      const race
      of backup.races
    ) {

      await saveRaceFirestore(
        race
      )

    }


    console.log(
      "🏁 Courses restaurées :",
      backup.races.length
    )


    // =================================================
    // 4. RESTAURER LES PARAMÈTRES
    // =================================================

    if (
      backup.settings &&
      typeof backup.settings === "object"
    ) {

      raceStore.settings =
        {
          ...raceStore.settings,
          ...backup.settings,
        }

    }


    // =================================================
    // 5. RESTAURER LOCALEMENT LES PARTICIPANTS
    // =================================================

    raceStore.setParticipants(
      backup.participants
    )


    // =================================================
    // 6. RESTAURER LOCALEMENT LES COURSES
    // =================================================

    backup.races.forEach(
      backupRace => {

        const localRace =
          raceManager.getRace(
            backupRace.categorie
          )


        if (!localRace) {
          return
        }


        localRace.id =
          backupRace.id

        localRace.categorie =
          backupRace.categorie

        localRace.label =
          backupRace.label

        localRace.status =
          backupRace.status ??
          "waiting"

        localRace.startTime =
          backupRace.startTime ??
          null

        localRace.finishTime =
          backupRace.finishTime ??
          null

        localRace.participants =
          Number(
            backupRace.participants ?? 0
          )

        localRace.arrivals =
          Number(
            backupRace.arrivals ?? 0
          )

        localRace.results =
          Array.isArray(
            backupRace.results
          )
            ? backupRace.results
            : []

      }
    )


    // =================================================
    // 7. RESTAURER LES ARRIVÉES LOCALES
    // =================================================

    raceStore.arrivals = []


    raceManager.races.forEach(
      race => {

        if (
          Array.isArray(
            race.results
          )
        ) {

          race.results.forEach(
            result => {

              raceStore.arrivals.push({

                participantId:
                  result.participant?.id,

                scanTime:
                  result.arrivalTime,

                device:
                  result.scanner ??
                  "Scanner",

              })

            }
          )

        }

      }
    )


    // =================================================
    // 8. FERMER
    // =================================================

    pendingBackup.value = null

    pendingBackupName.value = ""

    showRestoreDialog.value = false


    console.log(
      "========================================"
    )

    console.log(
      "✅ RESTAURATION TERMINÉE"
    )

    console.log(
      "========================================"
    )


    alert(
      "Sauvegarde restaurée avec succès."
    )


    // =================================================
    // 9. RECHARGER L'APPLICATION
    // =================================================

    window.location.reload()


  } catch (error) {

    console.error(
      "❌ ERREUR RESTAURATION :",
      error
    )


    alert(
      "Impossible de restaurer cette sauvegarde.\n\nVérifie la connexion à Firestore."
    )

  } finally {

    restoring.value = false

  }

}


// =====================================================
// EXPORT EXCEL
// =====================================================

async function exportExcel() {

  const races =
    raceManager.races.filter(
      race =>
        Array.isArray(
          race.results
        ) &&
        race.results.length > 0
    )


  if (races.length === 0) {

    alert(
      "Aucun résultat à exporter."
    )

    return

  }


  try {

    await exportResultsToExcel(
      races
    )

  } catch (error) {

    console.error(
      "Erreur export Excel :",
      error
    )

    alert(
      "Erreur lors de l'export Excel."
    )

  }

}


// =====================================================
// EXPORT PDF
// =====================================================

function exportPDF() {

  const races =
    raceManager.races.filter(
      race =>
        Array.isArray(
          race.results
        ) &&
        race.results.length > 0
    )


  if (races.length === 0) {

    alert(
      "Aucun résultat à exporter."
    )

    return

  }


  try {

    exportResultsToPDF(
      races,
      raceStore.settings
    )

  } catch (error) {

    console.error(
      "Erreur export PDF :",
      error
    )

    alert(
      "Erreur lors de l'export PDF."
    )

  }

}

</script>


<template>

  <header class="header">

    <!-- =================================================
         GAUCHE
    ================================================== -->

    <div>

      <p class="subtitle">
        ISM Rèves
      </p>


      <h1 class="title">
        {{ title }}
      </h1>

    </div>


    <!-- =================================================
         DROITE
    ================================================== -->

    <div class="right">

      <div class="date">
        {{ today }}
      </div>


      <!-- =================================================
           NOUVEAU PROJET
      ================================================== -->

      <button
        class="action-btn"
        type="button"
        :disabled="resetting"
        @click="newProject"
      >

        <span v-if="!resetting">
          🆕 Nouveau projet
        </span>

        <span v-else>
          ⏳ Réinitialisation...
        </span>

      </button>


      <!-- =================================================
           SAUVEGARDER
      ================================================= -->

      <button
        class="action-btn"
        type="button"
        :disabled="saving"
        @click="saveProject"
      >

        <span v-if="!saving">
          💾 Sauvegarder
        </span>

        <span v-else>
          💾 Sauvegarde...
        </span>

      </button>


      <!-- =================================================
           RESTAURER
      ================================================= -->

      <input
        ref="restoreInput"
        type="file"
        accept=".json,application/json"
        class="hidden"
        @change="handleRestoreSelection"
      />


      <button
        class="action-btn"
        type="button"
        :disabled="restoring"
        @click="openRestore"
      >

        <span v-if="!restoring">
          📂 Restaurer
        </span>

        <span v-else>
          ⏳ Restauration...
        </span>

      </button>


      <!-- =================================================
           EXCEL
      ================================================= -->

      <button
        class="action-btn"
        type="button"
        @click="exportExcel"
      >
        📊 Excel
      </button>


      <!-- =================================================
           PDF
      ================================================= -->

      <button
        class="action-btn"
        type="button"
        @click="exportPDF"
      >
        📄 PDF
      </button>


      <!-- =================================================
           ÉVÉNEMENT
      ================================================= -->

      <div class="badge">

        🏁 {{ raceStore.settings.eventName }}

      </div>

    </div>

  </header>


  <!-- ===================================================
       CONFIRMATION NOUVEAU PROJET
  ==================================================== -->

  <ConfirmDialog
    :show="showNewProjectDialog"
    title="Nouveau projet"
    message="Les courses et leurs résultats seront réinitialisés. Les participants seront conservés."
    @confirm="confirmNewProject"
    @cancel="cancelNewProject"
  />


  <!-- ===================================================
       CONFIRMATION RESTAURATION
  ==================================================== -->

  <div
    v-if="showRestoreDialog"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
  >

    <div
      class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
    >

      <p
        class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600"
      >
        Restauration
      </p>


      <h2
        class="mt-2 text-2xl font-bold text-slate-900"
      >
        Restaurer cette sauvegarde ?
      </h2>


      <p class="mt-4 text-sm text-slate-600">

        Le fichier :

      </p>


      <p
        class="mt-1 break-all rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-800"
      >

        {{ pendingBackupName }}

      </p>


      <div
        v-if="pendingBackup"
        class="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"
      >

        <p class="font-bold">
          ⚠️ Attention
        </p>

        <p class="mt-1">

          La restauration remplacera les participants,
          les courses et les résultats actuellement
          présents dans Firestore.

        </p>

      </div>


      <div
        class="mt-6 flex justify-end gap-3"
      >

        <button
          class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
          :disabled="restoring"
          @click="cancelRestore"
        >

          Annuler

        </button>


        <button
          class="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          :disabled="restoring"
          @click="confirmRestore"
        >

          <span v-if="!restoring">
            Restaurer
          </span>

          <span v-else>
            Restauration...
          </span>

        </button>

      </div>

    </div>

  </div>

</template>


<style scoped>

.header {

  min-height: 84px;

  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 20px;

  padding: 0 28px;

  background: white;

  border-bottom:
    1px solid #e2e8f0;

  box-shadow:
    0 2px 10px
    rgba(0, 0, 0, 0.04);

}


.subtitle {

  margin: 0;

  color: #0284c7;

  text-transform: uppercase;

  letter-spacing: 0.25em;

  font-size: 0.75rem;

  font-weight: 700;

}


.title {

  margin-top: 4px;

  font-size: 1.8rem;

  font-weight: 800;

  color: #0f172a;

}


.right {

  display: flex;

  align-items: center;

  justify-content: flex-end;

  gap: 10px;

  flex-wrap: wrap;

}


.date {

  color: #64748b;

  font-size: 0.9rem;

  font-weight: 600;

}


.badge {

  background: #dcfce7;

  color: #15803d;

  padding: 10px 18px;

  border-radius: 999px;

  font-weight: 700;

  white-space: nowrap;

}


.action-btn {

  border: none;

  background: #f1f5f9;

  color: #0f172a;

  padding: 10px 14px;

  border-radius: 12px;

  cursor: pointer;

  font-weight: 700;

  transition:
    background 0.2s,
    color 0.2s,
    opacity 0.2s;

}


.action-btn:hover:not(:disabled) {

  background: #0ea5e9;

  color: white;

}


.action-btn:disabled {

  cursor: not-allowed;

  opacity: 0.5;

}


@media (max-width: 1100px) {

  .header {

    align-items: flex-start;

    flex-direction: column;

    padding: 18px;

  }


  .right {

    justify-content: flex-start;

  }

}

</style>