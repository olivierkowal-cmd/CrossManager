<script setup>

import { computed, ref } from "vue"

import { useRaceStore } from "../stores/raceStore"

import { CLASSES } from "../data/classes"

import DossardCard from "../components/DossardCard.vue"

import DossardFilters from "../components/DossardFilters.vue"

import QRCode from "qrcode"

import pdfMake from "pdfmake/build/pdfmake"

import pdfFonts from "pdfmake/build/vfs_fonts"


// =====================================================
// CONFIGURATION PDFMAKE
// =====================================================

pdfMake.vfs = pdfFonts.vfs


// =====================================================
// STORE
// =====================================================

const raceStore = useRaceStore()


// =====================================================
// FILTRES
// =====================================================

const classe = ref("")

const categorie = ref("")

const recherche = ref("")


// =====================================================
// ÉTAT DE GÉNÉRATION
// =====================================================

const participantsGeneres = ref([])

const generationEffectuee = ref(false)

const generationEnCours = ref(false)


// =====================================================
// PARTICIPANTS
// =====================================================

const participants = computed(() =>
  raceStore.participants
)


// =====================================================
// CLASSES
// =====================================================

const classes = computed(() =>
  CLASSES
)


// =====================================================
// CATÉGORIES
// =====================================================

const categories = computed(() =>

  [
    ...new Set(

      raceStore.participants

        .map(
          p => p.categorie
        )

        .filter(Boolean)

    )

  ].sort()

)


// =====================================================
// PARTICIPANTS FILTRÉS
// =====================================================

const participantsFiltres = computed(() => {

  return raceStore.participants.filter((p) => {


    // -------------------------------------------------
    // FILTRE CLASSE
    // -------------------------------------------------

    if (

      classe.value &&

      p.classe !== classe.value

    ) {

      return false

    }


    // -------------------------------------------------
    // FILTRE CATÉGORIE
    // -------------------------------------------------

    if (

      categorie.value &&

      p.categorie !== categorie.value

    ) {

      return false

    }


    // -------------------------------------------------
    // RECHERCHE
    // -------------------------------------------------

    if (recherche.value) {

      const txt =

        recherche.value

          .toLowerCase()

          .trim()


      const nom =

        String(
          p.nom ?? ""
        ).toLowerCase()


      const prenom =

        String(
          p.prenom ?? ""
        ).toLowerCase()


      return (

        nom.includes(txt) ||

        prenom.includes(txt)

      )

    }


    return true

  })

})


// =====================================================
// GÉNÉRER
// =====================================================

function generer() {

  participantsGeneres.value =

    [...participantsFiltres.value]


  generationEffectuee.value = true


  console.log(

    "🎟️ Dossards générés :",

    participantsGeneres.value.length

  )

}


// =====================================================
// PARTICIPANTS À AFFICHER
// =====================================================

const participantsAffiches = computed(() => {

  if (!generationEffectuee.value) {

    return participantsFiltres.value

  }


  return participantsGeneres.value

})


// =====================================================
// COULEUR PAR NIVEAU
// =====================================================

function couleurNiveau(participant) {

  const niveau =

    String(

      participant?.classe ?? ""

    ).charAt(0)


  switch (niveau) {

    case "1":

      return "#3B82F6"


    case "2":

      return "#10B981"


    case "3":

      return "#F97316"


    case "4":

      return "#EF4444"


    case "5":

      return "#8B5CF6"


    case "6":

      return "#334155"


    default:

      return "#64748B"

  }

}


// =====================================================
// CRÉATION QR CODE
// =====================================================

async function creerQRCode(value) {

  if (!value) {

    return null

  }


  return await QRCode.toDataURL(

    String(value),

    {

      width: 140,

      margin: 1,

      errorCorrectionLevel: "M",

    }

  )

}


// =====================================================
// EXPORT PDF
// =====================================================

async function exporterPDF() {

  if (generationEnCours.value) {

    return

  }


  const liste =

    participantsAffiches.value


  if (!liste.length) {

    alert(

      "Aucun participant à exporter."

    )

    return

  }


  generationEnCours.value = true


  try {

    console.log(

      "📄 Création du PDF :",

      liste.length,

      "dossards"

    )


    // =================================================
    // CRÉER UN DOSSARD
    // =================================================

    async function creerDossard(participant) {

      const qr =

        await creerQRCode(

          participant.qr

        )


      const couleur =

        couleurNiveau(

          participant

        )


      return {

        stack: [

          // -------------------------------------------
          // LOGO
          // -------------------------------------------

          {

            text: "I S M",

            alignment: "center",

            fontSize: 20,

            bold: true,

            color: "#0284C7",

            characterSpacing: 5,

            margin: [0, 6, 0, 0],

          },


          {

            text: "RÈVES",

            alignment: "center",

            fontSize: 11,

            color: "#475569",

            margin: [0, 0, 0, 5],

          },


          // -------------------------------------------
          // NUMÉRO DU DOSSARD
          // -------------------------------------------

          {

            text:

              String(

                participant.dossard ?? ""

              ),

            alignment: "center",

            fontSize: 32,

            bold: true,

            margin: [0, 3, 0, 5],

          },


          // -------------------------------------------
          // QR CODE
          // -------------------------------------------

          qr

            ? {

                image: qr,

                width: 82,

                height: 82,

                alignment: "center",

                margin: [0, 0, 0, 6],

              }

            : {

                text: "",

              },


          // -------------------------------------------
          // NOM
          // -------------------------------------------

          {

            text:

              String(

                participant.nom ?? ""

              ).toUpperCase(),

            alignment: "center",

            fontSize: 15,

            bold: true,

            margin: [0, 2, 0, 2],

          },


          // -------------------------------------------
          // PRÉNOM
          // -------------------------------------------

          {

            text:

              String(

                participant.prenom ?? ""

              ),

            alignment: "center",

            fontSize: 13,

            margin: [0, 0, 0, 3],

          },


          // -------------------------------------------
          // CLASSE
          // -------------------------------------------

          {

            text:

              `Classe ${

                participant.classe ?? ""

              }`,

            alignment: "center",

            fontSize: 11,

            margin: [0, 0, 0, 7],

          },


          // -------------------------------------------
          // BANDE DE COULEUR
          // -------------------------------------------

          {

            canvas: [

              {

                type: "rect",

                x: 0,

                y: 0,

                w: 220,

                h: 9,

                color: couleur,

              }

            ],

            margin: [0, 0, 0, 0],

          },

        ],

        alignment: "center",

        margin: [5, 5, 5, 5],

      }

    }


    // =================================================
    // CONSTRUCTION DES PAGES
    // =================================================

    const content = []


    // IMPORTANT :
    // 4 dossards maximum par page A4.

    for (

      let i = 0;

      i < liste.length;

      i += 4

    ) {

      const groupe =

        liste.slice(

          i,

          i + 4

        )


      const cards = []


      // -----------------------------------------------
      // CRÉATION DES 4 DOSSARDS
      // -----------------------------------------------

      for (

        const participant of groupe

      ) {

        cards.push(

          await creerDossard(

            participant

          )

        )

      }


      // -----------------------------------------------
      // COMPLÉTER LES CASES VIDES
      // -----------------------------------------------

      while (

        cards.length < 4

      ) {

        cards.push("")

      }


      // -----------------------------------------------
      // PAGE 2 × 2
      // -----------------------------------------------

      content.push({

        table: {

          widths: [

            "*",

            "*",

          ],

          heights: [

            360,

            360,

          ],

          body: [

            [

              cards[0],

              cards[1],

            ],

            [

              cards[2],

              cards[3],

            ],

          ],

        },


        layout: {

          hLineWidth:

            () => 0.5,

          vLineWidth:

            () => 0.5,

          hLineColor:

            () => "#CBD5E1",

          vLineColor:

            () => "#CBD5E1",

          paddingLeft:

            () => 8,

          paddingRight:

            () => 8,

          paddingTop:

            () => 8,

          paddingBottom:

            () => 8,

        },


        // ---------------------------------------------
        // NOUVELLE PAGE
        // ---------------------------------------------

        pageBreak:

          i + 4 < liste.length

            ? "after"

            : undefined,

      })

    }


    // =================================================
    // DOCUMENT PDF
    // =================================================

    const documentDefinition = {

      pageSize: "A4",


      pageMargins: [

        20,

        20,

        20,

        20,

      ],


      content,


      defaultStyle: {

        font: "Roboto",

      },

    }


    // =================================================
    // NOM DU FICHIER
    // =================================================

    let nomFichier =

      "dossards"


    if (classe.value) {

      nomFichier +=

        `_${classe.value}`

    }


    if (categorie.value) {

      nomFichier +=

        `_${categorie.value}`

    }


    nomFichier += ".pdf"


    // =================================================
    // TÉLÉCHARGEMENT
    // =================================================

    pdfMake

      .createPdf(

        documentDefinition

      )

      .download(

        nomFichier

      )


    console.log(

      "✅ PDF généré :",

      nomFichier

    )


  } catch (error) {

    console.error(

      "❌ Erreur export PDF :",

      error

    )


    alert(

      "Impossible de générer le PDF."

    )

  } finally {

    generationEnCours.value = false

  }

}


// =====================================================
// IMPRESSION
// =====================================================

function imprimer() {

  window.print()

}

</script>


<template>

<section class="space-y-6">


  <!-- =================================================
       FILTRES
  ================================================== -->

  <DossardFilters

    :classes="classes"

    :categories="categories"

    v-model:classe="classe"

    v-model:categorie="categorie"

    v-model:recherche="recherche"

  />


  <!-- =================================================
       BARRE D'ACTIONS
  ================================================== -->

  <div

    class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"

  >

    <div

      class="flex items-center justify-between"

    >


      <!-- TITRE -->

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

          Impression des dossards ISM Rèves

        </p>


        <!-- COMPTEUR -->

        <p

          v-if="generationEffectuee"

          class="mt-2 text-sm font-semibold text-emerald-600"

        >

          {{ participantsGeneres.length }}

          dossard(s) généré(s)

        </p>

      </div>


      <!-- BOUTONS -->

      <div

        class="flex gap-3"

      >


        <!-- GÉNÉRER -->

        <button

          class="rounded-xl bg-sky-600 text-white px-6 py-3 font-semibold hover:bg-sky-700 disabled:opacity-50"

          :disabled="

            generationEnCours ||

            !participantsFiltres.length

          "

          @click="generer"

        >

          Générer

        </button>


        <!-- EXPORT PDF -->

        <button

          class="rounded-xl border border-slate-300 px-6 py-3 font-semibold disabled:opacity-50"

          :disabled="

            generationEnCours ||

            !participantsAffiches.length

          "

          @click="exporterPDF"

        >

          {{

            generationEnCours

              ? "Création..."

              : "Export PDF"

          }}

        </button>


        <!-- IMPRIMER -->

        <button

          class="rounded-xl border border-slate-300 px-6 py-3 font-semibold disabled:opacity-50"

          :disabled="

            !participantsAffiches.length

          "

          @click="imprimer"

        >

          Imprimer

        </button>

      </div>

    </div>

  </div>


  <!-- =================================================
       DOSSARDS
  ================================================== -->

  <div

    class="grid grid-cols-2 gap-8 print:grid-cols-2"

  >

    <DossardCard

      v-for="participant in participantsAffiches"

      :key="participant.id"

      :participant="participant"

    />

  </div>


  <!-- =================================================
       AUCUN PARTICIPANT
  ================================================== -->

  <div

    v-if="participantsAffiches.length === 0"

    class="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500"

  >

    Aucun participant ne correspond aux filtres.

  </div>


</section>

</template>


<style scoped>

@media print {

  button {

    display: none !important;

  }


  section {

    padding: 0;

    margin: 0;

  }


  :deep(.grid) {

    gap: 12px;

  }

}

</style>