<script setup>
import { computed, ref } from "vue"

import { useRaceStore } from "../stores/raceStore"

import DossardCard from "../components/DossardCard.vue"
import DossardFilters from "../components/DossardFilters.vue"

import { exportBibsToPDF } from "../services/bibExport.js"

const raceStore = useRaceStore()

// ==========================
// Filtres
// ==========================

const classe = ref("")
const categorie = ref("")
const recherche = ref("")

// ==========================
// Options d'impression
// ==========================

const bibLayout = ref(4)

const bibColor = ref("#0284c7")

const qrSize = ref("medium")

const showLogo = ref(true)
const showName = ref(true)
const showClass = ref(true)
const showCategory = ref(false)
const showQR = ref(true)

// ==========================
// Données
// ==========================

const classes = computed(() =>
  [
    ...new Set(
      raceStore.participants
        .map((p) => p.classe)
        .filter(Boolean)
    ),
  ].sort()
)

const categories = computed(() =>
  [
    ...new Set(
      raceStore.participants
        .map((p) => p.categorie)
        .filter(Boolean)
    ),
  ].sort()
)

// ==========================
// Participants filtrés
// ==========================

const participantsFiltres = computed(() => {

  return raceStore.participants.filter((p) => {

    // Filtre classe

    if (
      classe.value &&
      p.classe !== classe.value
    ) {
      return false
    }

    // Filtre catégorie

    if (
      categorie.value &&
      p.categorie !== categorie.value
    ) {
      return false
    }

    // Recherche nom / prénom

    if (recherche.value) {

      const txt =
        recherche.value
          .toLowerCase()
          .trim()

      const nom =
        p.nom?.toLowerCase() ?? ""

      const prenom =
        p.prenom?.toLowerCase() ?? ""

      const dossard =
        String(
          p.dossard ?? ""
        ).toLowerCase()

      if (
        !nom.includes(txt) &&
        !prenom.includes(txt) &&
        !dossard.includes(txt)
      ) {
        return false
      }

    }

    return true

  })

})

// ==========================
// Classe dynamique aperçu
// ==========================

const previewGridClass = computed(() => {

  switch (bibLayout.value) {

    case 1:
      return "layout-1"

    case 2:
      return "layout-2"

    case 8:
      return "layout-8"

    case 4:
    default:
      return "layout-4"

  }

})

// ==========================
// Export PDF
// ==========================

async function exporterPDF() {

  if (
    participantsFiltres.value.length === 0
  ) {

    alert(
      "Aucun participant à exporter."
    )

    return

  }

  const options = {

    layout:
      bibLayout.value,

    color:
      bibColor.value,

    qrSize:
      qrSize.value,

    showLogo:
      showLogo.value,

    showName:
      showName.value,

    showClass:
      showClass.value,

    showCategory:
      showCategory.value,

    showQR:
      showQR.value,

  }

  try {

    await exportBibsToPDF(
      participantsFiltres.value,
      raceStore.settings,
      options
    )

  } catch (error) {

    console.error(
      "Erreur export PDF :",
      error
    )

    alert(
      "Une erreur est survenue pendant la génération du PDF."
    )

  }

}

// ==========================
// Impression navigateur
// ==========================

function imprimer() {

  if (
    participantsFiltres.value.length === 0
  ) {

    alert(
      "Aucun dossard à imprimer."
    )

    return

  }

  window.print()

}
</script>


<template>

  <section class="dossards-page space-y-6">

    <!-- ==========================
         ZONE NON IMPRIMÉE
    =========================== -->

    <div class="no-print space-y-6">

      <!-- FILTRES -->

      <DossardFilters
        :classes="classes"
        :categories="categories"
        v-model:classe="classe"
        v-model:categorie="categorie"
        v-model:recherche="recherche"
      />


      <!-- EN-TÊTE -->

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        <div
          class="flex flex-wrap justify-between items-center gap-6"
        >

          <div>

            <p
              class="uppercase tracking-[0.35em] text-sky-600 text-sm font-semibold"
            >
              CrossManager
            </p>

            <h1
              class="text-3xl font-bold mt-2"
            >
              Dossards
            </h1>

            <p
              class="text-slate-500 mt-2"
            >
              {{ participantsFiltres.length }}
              dossard(s) sélectionné(s)
            </p>

          </div>


          <!-- ACTIONS -->

          <div
            class="flex flex-wrap gap-3"
          >

            <button
              type="button"
              class="rounded-xl bg-sky-600 text-white px-6 py-3 font-semibold transition hover:bg-sky-700"
              @click="exporterPDF"
            >
              📄 Export PDF
            </button>

            <button
              type="button"
              class="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold transition hover:bg-slate-50"
              @click="imprimer"
            >
              🖨️ Imprimer
            </button>

          </div>

        </div>

      </div>


      <!-- ==========================
           OPTIONS
      =========================== -->

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        <h2
          class="text-xl font-bold"
        >
          Options des dossards
        </h2>

        <p
          class="mt-1 text-sm text-slate-500"
        >
          Personnalisez les dossards avant de les imprimer ou de les exporter.
        </p>


        <div
          class="grid gap-8 mt-6 md:grid-cols-2 xl:grid-cols-4"
        >

          <!-- DISPOSITION -->

          <div>

            <label
              class="font-semibold"
            >
              Dossards par page
            </label>

            <select
              v-model.number="bibLayout"
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"
            >

              <option :value="1">
                1 par page
              </option>

              <option :value="2">
                2 par page
              </option>

              <option :value="4">
                4 par page
              </option>

              <option :value="8">
                8 par page
              </option>

            </select>

          </div>


          <!-- COULEUR -->

          <div>

            <label
              class="font-semibold"
            >
              Couleur
            </label>

            <div
              class="mt-2 flex items-center gap-3"
            >

              <input
                v-model="bibColor"
                type="color"
                class="h-12 w-20 cursor-pointer rounded-xl border border-slate-300 bg-white"
              />

              <span
                class="text-sm font-medium text-slate-500"
              >
                {{ bibColor }}
              </span>

            </div>

          </div>


          <!-- QR -->

          <div>

            <label
              class="font-semibold"
            >
              Taille du QR Code
            </label>

            <select
              v-model="qrSize"
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"
            >

              <option value="small">
                Petit
              </option>

              <option value="medium">
                Moyen
              </option>

              <option value="large">
                Grand
              </option>

            </select>

          </div>


          <!-- AFFICHAGE -->

          <div>

            <p
              class="font-semibold"
            >
              Informations affichées
            </p>

            <div
              class="mt-3 space-y-2"
            >

              <label
                class="flex cursor-pointer items-center gap-2"
              >

                <input
                  v-model="showLogo"
                  type="checkbox"
                />

                Logo

              </label>


              <label
                class="flex cursor-pointer items-center gap-2"
              >

                <input
                  v-model="showName"
                  type="checkbox"
                />

                Nom et prénom

              </label>


              <label
                class="flex cursor-pointer items-center gap-2"
              >

                <input
                  v-model="showClass"
                  type="checkbox"
                />

                Classe

              </label>


              <label
                class="flex cursor-pointer items-center gap-2"
              >

                <input
                  v-model="showCategory"
                  type="checkbox"
                />

                Catégorie

              </label>


              <label
                class="flex cursor-pointer items-center gap-2"
              >

                <input
                  v-model="showQR"
                  type="checkbox"
                />

                QR Code

              </label>

            </div>

          </div>

        </div>

      </div>


      <!-- ==========================
           RÉSUMÉ
      =========================== -->

      <div
        class="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4"
      >

        <div
          class="flex flex-wrap items-center justify-between gap-4"
        >

          <div>

            <p
              class="font-semibold text-sky-900"
            >
              Configuration actuelle
            </p>

            <p
              class="mt-1 text-sm text-sky-700"
            >
              {{ bibLayout }}
              dossard(s) par page
              ·
              QR {{ qrSize }}
            </p>

          </div>

          <div
            class="text-sm font-semibold text-sky-800"
          >
            {{ participantsFiltres.length }}
            dossard(s) à générer
          </div>

        </div>

      </div>

    </div>


    <!-- ==========================
         APERÇU / ZONE IMPRIMABLE
    =========================== -->

    <div
      class="print-zone"
    >

      <!-- TITRE APERÇU -->

      <div
        class="no-print flex justify-between items-center mb-4"
      >

        <h2
          class="text-xl font-bold"
        >
          Aperçu
        </h2>

        <span
          class="text-slate-500"
        >
          {{ participantsFiltres.length }}
          participant(s)
        </span>

      </div>


      <!-- AUCUN PARTICIPANT -->

      <div
        v-if="participantsFiltres.length === 0"
        class="no-print rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"
      >

        <div
          class="text-5xl"
        >
          🏷️
        </div>

        <p
          class="mt-4 text-lg font-semibold text-slate-700"
        >
          Aucun dossard à afficher
        </p>

        <p
          class="mt-1 text-sm text-slate-500"
        >
          Importez des participants ou modifiez vos filtres.
        </p>

      </div>


      <!-- GRILLE DOSSARDS -->

      <div
        v-else
        class="dossards-grid"
        :class="previewGridClass"
      >

        <DossardCard
          v-for="participant in participantsFiltres"
          :key="participant.id"
          :participant="participant"
          :settings="raceStore.settings"
          :color="bibColor"
          :qr-size="qrSize"
          :show-logo="showLogo"
          :show-name="showName"
          :show-class="showClass"
          :show-category="showCategory"
          :showQR="showQR"
        />

      </div>

    </div>

  </section>

</template>


<style scoped>

/*
==================================================
APERÇU ÉCRAN
==================================================
*/

.dossards-grid {
  display: grid;
  gap: 2rem;
}

/* 1 dossard */

.layout-1 {
  grid-template-columns:
    minmax(0, 700px);

  justify-content: center;
}

/* 2 dossards */

.layout-2 {
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
}

/* 4 dossards */

.layout-4 {
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
}

/* 8 dossards */

.layout-8 {
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
}


/*
==================================================
TABLETTE
==================================================
*/

@media (max-width: 1100px) {

  .layout-8 {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}


/*
==================================================
MOBILE
==================================================
*/

@media (max-width: 700px) {

  .layout-1,
  .layout-2,
  .layout-4,
  .layout-8 {
    grid-template-columns: 1fr;
  }

}


/*
==================================================
IMPRESSION
==================================================
*/

@media print {

  /*
  Cache toute l'interface
  */

  .no-print {
    display: none !important;
  }


  /*
  Nettoyage général
  */

  .dossards-page {
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-zone {
    margin: 0 !important;
    padding: 0 !important;
  }


  /*
  Grille commune
  */

  .dossards-grid {
    display: grid !important;

    gap: 0 !important;

    width: 100% !important;

    margin: 0 !important;

    padding: 0 !important;
  }


  /*
  1 dossard par page
  */

  .layout-1 {
    grid-template-columns:
      1fr !important;
  }

  .layout-1 > * {
    break-after: page;
    page-break-after: always;

    min-height: 95vh;
  }

  .layout-1 > *:last-child {
    break-after: auto;
    page-break-after: auto;
  }


  /*
  2 dossards par page
  */

  .layout-2 {
    grid-template-columns:
      1fr !important;
  }

  .layout-2 > * {
    min-height: 48vh;

    break-inside: avoid;
    page-break-inside: avoid;
  }

  .layout-2 > *:nth-child(2n) {
    break-after: page;
    page-break-after: always;
  }

  .layout-2 > *:last-child {
    break-after: auto;
    page-break-after: auto;
  }


  /*
  4 dossards par page
  */

  .layout-4 {
    grid-template-columns:
      repeat(2, 1fr) !important;
  }

  .layout-4 > * {
    min-height: 48vh;

    break-inside: avoid;
    page-break-inside: avoid;
  }

  .layout-4 > *:nth-child(4n) {
    break-after: page;
    page-break-after: always;
  }

  .layout-4 > *:last-child {
    break-after: auto;
    page-break-after: auto;
  }


  /*
  8 dossards par page
  */

  .layout-8 {
    grid-template-columns:
      repeat(2, 1fr) !important;
  }

  .layout-8 > * {
    min-height: 24vh;

    break-inside: avoid;
    page-break-inside: avoid;
  }

  .layout-8 > *:nth-child(8n) {
    break-after: page;
    page-break-after: always;
  }

  .layout-8 > *:last-child {
    break-after: auto;
    page-break-after: auto;
  }

}


/*
==================================================
FORMAT PAGE IMPRIMANTE
==================================================
*/

@page {

  size: A4 portrait;

  margin: 8mm;

}

</style>