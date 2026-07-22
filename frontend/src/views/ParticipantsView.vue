<script setup>
import {
  computed,
  reactive,
  ref,
} from "vue"

import {
  useRaceStore,
} from "../stores/raceStore"


// ==================================================
// STORE
// ==================================================

const raceStore =
  useRaceStore()


// ==================================================
// IMPORT EXCEL
// ==================================================

const fileInput =
  ref(null)

const importMessage =
  ref("")

const isImporting =
  ref(false)


// ==================================================
// MODALE PARTICIPANT
// ==================================================

const isDialogOpen =
  ref(false)

const editingParticipant =
  ref(null)

const formError =
  ref("")


// ==================================================
// FILTRES
// ==================================================

const searchQuery =
  ref("")

const filterClasse =
  ref("")

const filterCategorie =
  ref("")

const filterSexe =
  ref("")

const filterPresence =
  ref("")


// ==================================================
// TRI PROFESSIONNEL DU TABLEAU
// ==================================================

const sortKey =
  ref("dossard")

const sortDirection =
  ref("asc")


// ==================================================
// CHANGER LE TRI
// ==================================================

function setSort(
  key
) {

  // Même colonne :
  // on inverse simplement le sens.

  if (
    sortKey.value === key
  ) {

    sortDirection.value =
      sortDirection.value === "asc"
        ? "desc"
        : "asc"

    return

  }


  // Nouvelle colonne :
  // on commence en ordre croissant.

  sortKey.value =
    key

  sortDirection.value =
    "asc"

}


// ==================================================
// ICÔNE DU TRI
// ==================================================

function sortIcon(
  key
) {

  if (
    sortKey.value !== key
  ) {

    return "↕"

  }


  return sortDirection.value === "asc"
    ? "↑"
    : "↓"

}


// ==================================================
// SÉLECTION MULTIPLE
// ==================================================

const selectedParticipants =
  ref([])


// ==================================================
// FORMULAIRE
// ==================================================

const form = reactive({

  dossard: "",

  nom: "",

  prenom: "",

  sexe: "F",

  niveau: "1",

  classe: "",

  categorie: "",

  present: false,

})


// ==================================================
// FORMULAIRE VIDE
// ==================================================

function emptyForm() {

  return {

    dossard: "",

    nom: "",

    prenom: "",

    sexe: "F",

    niveau: "1",

    classe: "",

    categorie: "",

    present: false,

  }

}


// ==================================================
// LISTE DES CLASSES
// ==================================================

const classes =
  computed(() => {

    return [

      ...new Set(

        raceStore.participants

          .map(
            participant =>
              participant.classe
          )

          .filter(Boolean)

      ),

    ].sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          "fr",
          {
            sensitivity: "base",
            numeric: true,
          }
        )
    )

  })


// ==================================================
// LISTE DES CATÉGORIES
// ==================================================

const categories =
  computed(() => {

    return [

      ...new Set(

        raceStore.participants

          .map(
            participant =>
              participant.categorie
          )

          .filter(Boolean)

      ),

    ].sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          "fr",
          {
            sensitivity: "base",
            numeric: true,
          }
        )
    )

  })


// ==================================================
// PARTICIPANTS FILTRÉS ET TRIÉS
// ==================================================

const filteredParticipants =
  computed(() => {

    return raceStore.participants

      // ==================================================
      // FILTRES
      // ==================================================

      .filter(
        participant => {

          // ----------------------------------------------
          // RECHERCHE GLOBALE
          // ----------------------------------------------

          if (
            searchQuery.value
          ) {

            const query =
              searchQuery.value
                .toLowerCase()
                .trim()


            const nom =
              String(
                participant.nom ??
                ""
              )
                .toLowerCase()


            const prenom =
              String(
                participant.prenom ??
                ""
              )
                .toLowerCase()


            const dossard =
              String(
                participant.dossard ??
                ""
              )
                .toLowerCase()


            const classe =
              String(
                participant.classe ??
                ""
              )
                .toLowerCase()


            const categorie =
              String(
                participant.categorie ??
                ""
              )
                .toLowerCase()


            const sexe =
              String(
                participant.sexe ??
                ""
              )
                .toLowerCase()


            const qr =
              String(
                participant.qr ??
                ""
              )
                .toLowerCase()


            if (

              !nom.includes(query) &&

              !prenom.includes(query) &&

              !dossard.includes(query) &&

              !classe.includes(query) &&

              !categorie.includes(query) &&

              !sexe.includes(query) &&

              !qr.includes(query)

            ) {

              return false

            }

          }


          // ----------------------------------------------
          // CLASSE
          // ----------------------------------------------

          if (

            filterClasse.value &&

            participant.classe !==
              filterClasse.value

          ) {

            return false

          }


          // ----------------------------------------------
          // CATÉGORIE
          // ----------------------------------------------

          if (

            filterCategorie.value &&

            participant.categorie !==
              filterCategorie.value

          ) {

            return false

          }


          // ----------------------------------------------
          // SEXE
          // ----------------------------------------------

          if (

            filterSexe.value &&

            participant.sexe !==
              filterSexe.value

          ) {

            return false

          }


          // ----------------------------------------------
          // PRÉSENTS
          // ----------------------------------------------

          if (
            filterPresence.value ===
            "present"
          ) {

            if (
              !participant.present
            ) {

              return false

            }

          }


          // ----------------------------------------------
          // ABSENTS
          // ----------------------------------------------

          if (
            filterPresence.value ===
            "absent"
          ) {

            if (
              participant.present
            ) {

              return false

            }

          }


          return true

        }
      )


      // ==================================================
      // TRI
      // ==================================================

      .sort(
        (a, b) => {

          const key =
            sortKey.value


          let valueA =
            a[key] ?? ""

          let valueB =
            b[key] ?? ""


          // ----------------------------------------------
          // DOSSARD = TRI NUMÉRIQUE
          // ----------------------------------------------

          if (
            key === "dossard"
          ) {

            valueA =
              Number(valueA) || 0

            valueB =
              Number(valueB) || 0


            return sortDirection.value === "asc"
              ? valueA - valueB
              : valueB - valueA

          }


          // ----------------------------------------------
          // PRÉSENCE = TRI BOOLÉEN
          // ----------------------------------------------

          if (
            key === "present"
          ) {

            valueA =
              Boolean(valueA)
                ? 1
                : 0

            valueB =
              Boolean(valueB)
                ? 1
                : 0


            return sortDirection.value === "asc"
              ? valueA - valueB
              : valueB - valueA

          }


          // ----------------------------------------------
          // AUTRES COLONNES = TRI TEXTE
          // ----------------------------------------------

          const comparison =
            String(valueA)
              .localeCompare(
                String(valueB),
                "fr",
                {
                  sensitivity:
                    "base",

                  numeric:
                    true,
                }
              )


          return sortDirection.value === "asc"
            ? comparison
            : -comparison

        }
      )

  })


// ==================================================
// FIN PARTIE 1
// La PARTIE 2 continue directement ici.
// ==================================================

// ==================================================
// TOUS LES PARTICIPANTS FILTRÉS SÉLECTIONNÉS
// ==================================================

const allFilteredSelected =
  computed(() => {

    if (
      filteredParticipants.value.length === 0
    ) {

      return false

    }


    return filteredParticipants.value.every(
      participant =>

        selectedParticipants.value.includes(
          participant.id
        )
    )

  })


// ==================================================
// SÉLECTIONNER / DÉSÉLECTIONNER TOUS
// ==================================================

function toggleSelectAll() {

  const filteredIds =
    filteredParticipants.value.map(
      participant =>
        participant.id
    )


  // Si tous les participants actuellement affichés
  // sont sélectionnés, on les désélectionne.

  if (
    allFilteredSelected.value
  ) {

    selectedParticipants.value =
      selectedParticipants.value.filter(
        id =>
          !filteredIds.includes(
            id
          )
      )

    return

  }


  // Sinon on ajoute tous les participants affichés
  // à la sélection existante.

  const ids =
    new Set(
      selectedParticipants.value
    )


  filteredParticipants.value.forEach(
    participant => {

      ids.add(
        participant.id
      )

    }
  )


  selectedParticipants.value =
    [...ids]

}


// ==================================================
// ANNULER LA SÉLECTION
// ==================================================

function clearSelection() {

  selectedParticipants.value =
    []

}


// ==================================================
// MARQUER LA SÉLECTION PRÉSENTE / ABSENTE
// ==================================================

function setSelectedPresence(
  present
) {

  if (
    selectedParticipants.value.length === 0
  ) {

    return

  }


  selectedParticipants.value.forEach(
    id => {

      const participant =
        raceStore.participants.find(
          participant =>
            participant.id === id
        )


      if (
        !participant
      ) {

        return

      }


      raceStore.updateParticipant({

        ...participant,

        present,

      })

    }
  )


  clearSelection()

}


// ==================================================
// SUPPRIMER LA SÉLECTION
// ==================================================

function deleteSelectedParticipants() {

  const count =
    selectedParticipants.value.length


  if (
    count === 0
  ) {

    return

  }


  const confirmation =
    window.confirm(

      `Supprimer définitivement ${count} participant(s) sélectionné(s) ?`

    )


  if (
    !confirmation
  ) {

    return

  }


  const ids =
    [
      ...selectedParticipants.value,
    ]


  ids.forEach(
    id => {

      raceStore
        .deleteParticipant(
          id
        )

    }
  )


  clearSelection()

}


// ==================================================
// CARTES RÉSUMÉ
// ==================================================

const summaryCards =
  computed(() => [

    {

      label:
        "Total",

      value:
        raceStore.participantCount,

      icon:
        "👥",

    },

    {

      label:
        "Présents",

      value:
        raceStore.presentCount,

      icon:
        "✅",

    },

    {

      label:
        "Absents",

      value:

        raceStore.participantCount -

        raceStore.presentCount,

      icon:
        "❌",

    },

    {

      label:
        "Catégories",

      value:
        raceStore.categories.length,

      icon:
        "🏃",

    },

  ])


// ==================================================
// OUVRIR AJOUT PARTICIPANT
// ==================================================

function openCreateDialog() {

  editingParticipant.value =
    null

  formError.value =
    ""


  Object.assign(
    form,
    emptyForm()
  )


  form.dossard =
    raceStore
      .generateNextBibNumber()


  isDialogOpen.value =
    true

}


// ==================================================
// OUVRIR MODIFICATION PARTICIPANT
// ==================================================

function openEditDialog(
  participant
) {

  editingParticipant.value =
    participant

  formError.value =
    ""


  Object.assign(
    form,
    {

      dossard:
        participant.dossard,

      nom:
        participant.nom,

      prenom:
        participant.prenom,

      sexe:
        participant.sexe ||
        "F",

      niveau:
        participant.niveau ||
        participant.classe
          ?.charAt(0) ||
        "1",

      classe:
        participant.classe,

      categorie:
        participant.categorie,

      present:
        Boolean(
          participant.present
        ),

    }
  )


  isDialogOpen.value =
    true

}


// ==================================================
// FERMER LA MODALE
// ==================================================

function closeDialog() {

  isDialogOpen.value =
    false

  editingParticipant.value =
    null

  formError.value =
    ""


  Object.assign(
    form,
    emptyForm()
  )

}


// ==================================================
// CATÉGORIE AUTOMATIQUE
// ==================================================

function updateAutomaticCategory() {

  if (
    !form.classe
  ) {

    form.niveau =
      ""

    form.categorie =
      ""

    return

  }


  form.niveau =
    form.classe
      .charAt(0)


  form.categorie =
    raceStore
      .generateCategory(
        form.classe,
        form.sexe
      )

}


// ==================================================
// VALIDATION DU FORMULAIRE
// ==================================================

function validateForm() {

  formError.value =
    ""


  // ----------------------------------------------
  // NOM
  // ----------------------------------------------

  if (
    !String(
      form.nom
    ).trim()
  ) {

    formError.value =
      "Le nom est obligatoire."

    return false

  }


  // ----------------------------------------------
  // PRÉNOM
  // ----------------------------------------------

  if (
    !String(
      form.prenom
    ).trim()
  ) {

    formError.value =
      "Le prénom est obligatoire."

    return false

  }


  // ----------------------------------------------
  // DOSSARD
  // ----------------------------------------------

  if (
    !String(
      form.dossard
    ).trim()
  ) {

    formError.value =
      "Le numéro de dossard est obligatoire."

    return false

  }


  // ----------------------------------------------
  // CLASSE
  // ----------------------------------------------

  if (
    !String(
      form.classe
    ).trim()
  ) {

    formError.value =
      "La classe est obligatoire."

    return false

  }


  // ----------------------------------------------
  // SEXE
  // ----------------------------------------------

  if (
    !form.sexe
  ) {

    formError.value =
      "Le sexe est obligatoire."

    return false

  }


  return true

}


// ==================================================
// ENREGISTRER PARTICIPANT
// ==================================================

function submitForm() {

  if (
    !validateForm()
  ) {

    return

  }


  const classe =
    String(
      form.classe
    ).trim()


  const sexe =
    String(
      form.sexe
    )
      .trim()
      .toUpperCase()


  const categorie =

    form.categorie

      ? String(
          form.categorie
        ).trim()

      : raceStore
          .generateCategory(
            classe,
            sexe
          )


  const payload = {

    dossard:
      form.dossard,

    nom:
      String(
        form.nom
      ).trim(),

    prenom:
      String(
        form.prenom
      ).trim(),

    sexe,

    niveau:
      form.niveau ||
      classe.charAt(0),

    classe,

    categorie,

    present:
      Boolean(
        form.present
      ),

  }


  let result


  // ----------------------------------------------
  // MODIFICATION
  // ----------------------------------------------

  if (
    editingParticipant.value
  ) {

    result =
      raceStore
        .updateParticipant({

          id:
            editingParticipant
              .value.id,

          ...payload,

        })

  }


  // ----------------------------------------------
  // AJOUT
  // ----------------------------------------------

  else {

    result =
      raceStore
        .addParticipant(
          payload
        )

  }


  if (
    !result?.success
  ) {

    formError.value =

      result?.message ||

      "Impossible d'enregistrer le participant."

    return

  }


  closeDialog()

}


// ==================================================
// SUPPRIMER UN PARTICIPANT
// ==================================================

function removeParticipant(
  participant
) {

  const name =
    `${participant.prenom ?? ""} ${participant.nom ?? ""}`
      .trim()


  const confirmation =
    window.confirm(

      `Supprimer le participant ${name} (dossard ${participant.dossard}) ?`

    )


  if (
    !confirmation
  ) {

    return

  }


  const result =
    raceStore
      .deleteParticipant(
        participant.id
      )


  if (
    !result?.success
  ) {

    window.alert(

      result?.message ||

      "Impossible de supprimer le participant."

    )

    return

  }


  selectedParticipants.value =
    selectedParticipants.value.filter(
      id =>
        id !== participant.id
    )

}


// ==================================================
// CHANGER LA PRÉSENCE
// ==================================================

function togglePresence(
  participant
) {

  raceStore
    .updateParticipant({

      ...participant,

      present:
        !participant.present,

    })

}


// ==================================================
// OUVRIR L'IMPORT EXCEL
// ==================================================

function openExcelImport() {

  fileInput.value
    ?.click()

}


// ==================================================
// TRAITEMENT IMPORT EXCEL
// ==================================================

async function handleExcelSelection(
  event
) {

  const file =
    event.target
      .files?.[0]


  if (
    !file
  ) {

    return

  }


  isImporting.value =
    true

  importMessage.value =
    ""


  try {

    const count =
      await raceStore
        .importParticipants(
          file
        )


    clearSelection()


    importMessage.value =
      `${count} participant(s) importé(s) avec succès.`

  }

  catch (
    error
  ) {

    console.error(
      "Erreur import Excel :",
      error
    )


    importMessage.value =
      ""


    window.alert(
      "Impossible d'importer le fichier Excel. Vérifiez le format du fichier."
    )

  }

  finally {

    isImporting.value =
      false


    event.target.value =
      ""

  }

}


// ==================================================
// RÉINITIALISER LES FILTRES
// ==================================================

function resetFilters() {

  searchQuery.value =
    ""

  filterClasse.value =
    ""

  filterCategorie.value =
    ""

  filterSexe.value =
    ""

  filterPresence.value =
    ""

}

</script>


<template>

  <section
    class="space-y-6"
  >

    <!-- ==================================================
         EN-TÊTE
    =================================================== -->

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >

        <div>

          <p
            class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600"
          >
            Participants
          </p>

          <h2
            class="mt-2 text-2xl font-semibold text-slate-900"
          >
            Gestion des participants
          </h2>

          <p
            class="mt-2 text-sm text-slate-500"
          >
            Ajoutez, recherchez, triez et gérez les coureurs de votre événement.
          </p>

        </div>


        <div
          class="flex flex-wrap gap-3"
        >

          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            class="hidden"
            @change="handleExcelSelection"
          />


          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isImporting"
            @click="openExcelImport"
          >

            <span
              v-if="isImporting"
            >
              ⏳ Importation...
            </span>

            <span
              v-else
            >
              📊 Importer Excel
            </span>

          </button>


          <button
            type="button"
            class="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            @click="openCreateDialog"
          >
            ➕ Ajouter un participant
          </button>

        </div>

      </div>


      <div
        v-if="importMessage"
        class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
      >
        {{ importMessage }}
      </div>

    </div>


    <!-- ==================================================
         STATISTIQUES
    =================================================== -->

    <div
      class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >

      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >

        <div
          class="flex items-center justify-between"
        >

          <div>

            <p
              class="text-sm font-medium text-slate-500"
            >
              {{ card.label }}
            </p>

            <p
              class="mt-2 text-3xl font-bold text-slate-900"
            >
              {{ card.value }}
            </p>

          </div>


          <div
            class="text-3xl"
          >
            {{ card.icon }}
          </div>

        </div>

      </div>

    </div>


    <!-- ==================================================
         RECHERCHE ET FILTRES
    =================================================== -->

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <div
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-6"
      >

        <!-- RECHERCHE -->

        <div
          class="md:col-span-2"
        >

          <label
            class="block text-sm font-semibold text-slate-700"
          >
            Recherche
          </label>

          <input
            v-model="searchQuery"
            type="search"
            placeholder="Nom, prénom, dossard, classe, QR..."
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

        </div>


        <!-- CLASSE -->

        <div>

          <label
            class="block text-sm font-semibold text-slate-700"
          >
            Classe
          </label>

          <select
            v-model="filterClasse"
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
          >

            <option value="">
              Toutes
            </option>

            <option
              v-for="classe in classes"
              :key="classe"
              :value="classe"
            >
              {{ classe }}
            </option>

          </select>

        </div>


        <!-- CATÉGORIE -->

        <div>

          <label
            class="block text-sm font-semibold text-slate-700"
          >
            Catégorie
          </label>

          <select
            v-model="filterCategorie"
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
          >

            <option value="">
              Toutes
            </option>

            <option
              v-for="categorie in categories"
              :key="categorie"
              :value="categorie"
            >
              {{ categorie }}
            </option>

          </select>

        </div>


        <!-- SEXE -->

        <div>

          <label
            class="block text-sm font-semibold text-slate-700"
          >
            Sexe
          </label>

          <select
            v-model="filterSexe"
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
          >

            <option value="">
              Tous
            </option>

            <option value="F">
              Filles
            </option>

            <option value="G">
              Garçons
            </option>

          </select>

        </div>


        <!-- PRÉSENCE -->

        <div>

          <label
            class="block text-sm font-semibold text-slate-700"
          >
            Présence
          </label>

          <select
            v-model="filterPresence"
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
          >

            <option value="">
              Tous
            </option>

            <option value="present">
              Présents
            </option>

            <option value="absent">
              Absents
            </option>

          </select>

        </div>

      </div>


      <div
        class="mt-5 flex flex-wrap items-center justify-between gap-3"
      >

        <p
          class="text-sm text-slate-500"
        >
          <span
            class="font-semibold text-slate-700"
          >
            {{ filteredParticipants.length }}
          </span>

          participant(s) affiché(s) sur

          <span
            class="font-semibold text-slate-700"
          >
            {{ raceStore.participantCount }}
          </span>
        </p>


        <button
          type="button"
          class="text-sm font-semibold text-sky-600 hover:text-sky-700"
          @click="resetFilters"
        >
          Réinitialiser les filtres
        </button>

      </div>

    </div>


    <!-- ==================================================
         ACTIONS GROUPÉES
    =================================================== -->

    <div
      v-if="selectedParticipants.length > 0"
      class="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm"
    >

      <div
        class="flex flex-wrap items-center justify-between gap-4"
      >

        <div>

          <p
            class="font-semibold text-sky-900"
          >
            {{ selectedParticipants.length }}
            participant(s) sélectionné(s)
          </p>


          <button
            type="button"
            class="mt-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
            @click="clearSelection"
          >
            Annuler la sélection
          </button>

        </div>


        <div
          class="flex flex-wrap gap-2"
        >

          <button
            type="button"
            class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            @click="setSelectedPresence(true)"
          >
            ✓ Marquer présents
          </button>


          <button
            type="button"
            class="rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            @click="setSelectedPresence(false)"
          >
            Marquer absents
          </button>


          <button
            type="button"
            class="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            @click="deleteSelectedParticipants"
          >
            🗑️ Supprimer la sélection
          </button>

        </div>

      </div>

    </div>


    <!-- ==================================================
         TABLEAU PROFESSIONNEL
    =================================================== -->

    <div
      class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >

      <!-- BARRE D'INFORMATION DU TABLEAU -->

      <div
        class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-3"
      >

        <p
          class="text-sm font-semibold text-slate-700"
        >
          Liste des participants
        </p>


        <p
          class="text-xs text-slate-500"
        >
          Cliquez sur un titre de colonne pour modifier le tri.
        </p>

      </div>


      <div
        class="overflow-x-auto"
      >

        <table
          class="min-w-full divide-y divide-slate-200 text-left text-sm"
        >

          <!-- ==================================================
               EN-TÊTE DU TABLEAU
          =================================================== -->

          <thead
            class="bg-slate-50"
          >

            <tr>

              <!-- SÉLECTION -->

              <th
                class="w-12 px-4 py-3"
              >

                <input
                  type="checkbox"
                  :checked="allFilteredSelected"
                  class="h-4 w-4 cursor-pointer rounded border-slate-300"
                  title="Sélectionner tous les participants affichés"
                  @change="toggleSelectAll"
                />

              </th>


              <!-- DOSSARD -->

              <th
                class="whitespace-nowrap px-4 py-3"
              >

                <button
                  type="button"
                  class="group flex items-center gap-2 font-semibold text-slate-700 transition hover:text-sky-600"
                  @click="setSort('dossard')"
                >

                  <span>
                    Dossard
                  </span>

                  <span
                    :class="
                      sortKey === 'dossard'
                        ? 'text-sky-600'
                        : 'text-slate-400'
                    "
                  >
                    {{ sortIcon("dossard") }}
                  </span>

                </button>

              </th>


              <!-- NOM -->

              <th
                class="whitespace-nowrap px-4 py-3"
              >

                <button
                  type="button"
                  class="group flex items-center gap-2 font-semibold text-slate-700 transition hover:text-sky-600"
                  @click="setSort('nom')"
                >

                  <span>
                    Nom
                  </span>

                  <span
                    :class="
                      sortKey === 'nom'
                        ? 'text-sky-600'
                        : 'text-slate-400'
                    "
                  >
                    {{ sortIcon("nom") }}
                  </span>

                </button>

              </th>


              <!-- PRÉNOM -->

              <th
                class="whitespace-nowrap px-4 py-3"
              >

                <button
                  type="button"
                  class="group flex items-center gap-2 font-semibold text-slate-700 transition hover:text-sky-600"
                  @click="setSort('prenom')"
                >

                  <span>
                    Prénom
                  </span>

                  <span
                    :class="
                      sortKey === 'prenom'
                        ? 'text-sky-600'
                        : 'text-slate-400'
                    "
                  >
                    {{ sortIcon("prenom") }}
                  </span>

                </button>

              </th>


              <!-- CLASSE -->

              <th
                class="whitespace-nowrap px-4 py-3"
              >

                <button
                  type="button"
                  class="group flex items-center gap-2 font-semibold text-slate-700 transition hover:text-sky-600"
                  @click="setSort('classe')"
                >

                  <span>
                    Classe
                  </span>

                  <span
                    :class="
                      sortKey === 'classe'
                        ? 'text-sky-600'
                        : 'text-slate-400'
                    "
                  >
                    {{ sortIcon("classe") }}
                  </span>

                </button>

              </th>


              <!-- SEXE -->

              <th
                class="whitespace-nowrap px-4 py-3"
              >

                <button
                  type="button"
                  class="group flex items-center gap-2 font-semibold text-slate-700 transition hover:text-sky-600"
                  @click="setSort('sexe')"
                >

                  <span>
                    Sexe
                  </span>

                  <span
                    :class="
                      sortKey === 'sexe'
                        ? 'text-sky-600'
                        : 'text-slate-400'
                    "
                  >
                    {{ sortIcon("sexe") }}
                  </span>

                </button>

              </th>


              <!-- CATÉGORIE -->

              <th
                class="whitespace-nowrap px-4 py-3"
              >

                <button
                  type="button"
                  class="group flex items-center gap-2 font-semibold text-slate-700 transition hover:text-sky-600"
                  @click="setSort('categorie')"
                >

                  <span>
                    Catégorie
                  </span>

                  <span
                    :class="
                      sortKey === 'categorie'
                        ? 'text-sky-600'
                        : 'text-slate-400'
                    "
                  >
                    {{ sortIcon("categorie") }}
                  </span>

                </button>

              </th>


              <!-- PRÉSENCE -->

              <th
                class="whitespace-nowrap px-4 py-3"
              >

                <button
                  type="button"
                  class="group flex items-center gap-2 font-semibold text-slate-700 transition hover:text-sky-600"
                  @click="setSort('present')"
                >

                  <span>
                    Présence
                  </span>

                  <span
                    :class="
                      sortKey === 'present'
                        ? 'text-sky-600'
                        : 'text-slate-400'
                    "
                  >
                    {{ sortIcon("present") }}
                  </span>

                </button>

              </th>


              <!-- QR -->

              <th
                class="whitespace-nowrap px-4 py-3 font-semibold text-slate-700"
              >
                QR
              </th>


              <!-- ACTIONS -->

              <th
                class="whitespace-nowrap px-4 py-3 font-semibold text-slate-700"
              >
                Actions
              </th>

            </tr>

          </thead>


          <!-- ==================================================
               CORPS DU TABLEAU
          =================================================== -->

          <tbody
            class="divide-y divide-slate-100 bg-white"
          >

            <tr
              v-for="participant in filteredParticipants"
              :key="participant.id"
              class="transition hover:bg-slate-50"
              :class="
                selectedParticipants.includes(participant.id)
                  ? 'bg-sky-50'
                  : ''
              "
            >

              <!-- SÉLECTION -->

              <td
                class="px-4 py-3"
              >

                <input
                  v-model="selectedParticipants"
                  type="checkbox"
                  :value="participant.id"
                  class="h-4 w-4 cursor-pointer rounded border-slate-300"
                />

              </td>


              <!-- DOSSARD -->

              <td
                class="whitespace-nowrap px-4 py-3"
              >

                <span
                  class="inline-flex min-w-12 justify-center rounded-lg bg-sky-50 px-3 py-1.5 font-bold text-sky-700"
                >
                  {{ participant.dossard }}
                </span>

              </td>


              <!-- NOM -->

              <td
                class="whitespace-nowrap px-4 py-3 font-semibold text-slate-900"
              >
                {{ participant.nom }}
              </td>


              <!-- PRÉNOM -->

              <td
                class="whitespace-nowrap px-4 py-3 text-slate-700"
              >
                {{ participant.prenom }}
              </td>


              <!-- CLASSE -->

              <td
                class="whitespace-nowrap px-4 py-3 text-slate-700"
              >
                {{ participant.classe }}
              </td>


              <!-- SEXE -->

              <td
                class="whitespace-nowrap px-4 py-3"
              >

                <span
                  class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                >
                  {{ participant.sexe }}
                </span>

              </td>


              <!-- CATÉGORIE -->

              <td
                class="whitespace-nowrap px-4 py-3"
              >

                <span
                  class="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                >
                  {{ participant.categorie }}
                </span>

              </td>


              <!-- PRÉSENCE -->

              <td
                class="whitespace-nowrap px-4 py-3"
              >

                <button
                  type="button"
                  :class="
                    participant.present
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  "
                  class="rounded-full px-3 py-1.5 text-xs font-semibold transition"
                  @click="togglePresence(participant)"
                >

                  {{
                    participant.present
                      ? "✓ Présent"
                      : "Absent"
                  }}

                </button>

              </td>


              <!-- QR -->

              <td
                class="whitespace-nowrap px-4 py-3"
              >

                <span
                  class="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-600"
                >
                  {{ participant.qr }}
                </span>

              </td>


              <!-- ACTIONS -->

              <td
                class="whitespace-nowrap px-4 py-3"
              >

                <div
                  class="flex flex-wrap gap-2"
                >

                  <button
                    type="button"
                    class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                    @click="openEditDialog(participant)"
                  >
                    ✏️ Éditer
                  </button>


                  <button
                    type="button"
                    class="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
                    @click="removeParticipant(participant)"
                  >
                    🗑️ Supprimer
                  </button>

                </div>

              </td>

            </tr>


            <!-- ==================================================
                 AUCUN RÉSULTAT
            =================================================== -->

            <tr
              v-if="filteredParticipants.length === 0"
            >

              <td
                colspan="10"
                class="px-6 py-12 text-center"
              >

                <div
                  class="text-4xl"
                >
                  👥
                </div>

                <p
                  class="mt-3 font-semibold text-slate-700"
                >
                  Aucun participant trouvé
                </p>

                <p
                  class="mt-1 text-sm text-slate-500"
                >
                  Modifiez vos critères de recherche ou ajoutez un participant.
                </p>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>


    <!-- ==================================================
         FIN PARTIE 3


         La PARTIE 4 continue directement avec :
         - modale ajout / modification
         - aperçu QR
         - boutons enregistrer / annuler
         - fermeture du template
    =================================================== -->

        <!-- ==================================================
         MODALE AJOUT / MODIFICATION PARTICIPANT
    =================================================== -->

    <div
      v-if="isDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      @click.self="closeDialog"
    >

      <div
        class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >

        <!-- ==================================================
             EN-TÊTE MODALE
        =================================================== -->

        <div
          class="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5"
        >

          <div>

            <p
              class="text-sm font-medium uppercase tracking-[0.25em] text-sky-600"
            >
              Participant
            </p>

            <h3
              class="mt-2 text-xl font-semibold text-slate-900"
            >
              {{
                editingParticipant
                  ? "Modifier le participant"
                  : "Ajouter un participant"
              }}
            </h3>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              {{
                editingParticipant
                  ? "Modifiez les informations puis enregistrez."
                  : "Complétez les informations du nouveau coureur."
              }}
            </p>

          </div>


          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            title="Fermer"
            @click="closeDialog"
          >
            ×
          </button>

        </div>


        <!-- ==================================================
             FORMULAIRE
        =================================================== -->

        <form
          class="space-y-6 p-6"
          @submit.prevent="submitForm"
        >

          <!-- MESSAGE ERREUR -->

          <div
            v-if="formError"
            class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          >
            {{ formError }}
          </div>


          <!-- ==================================================
               IDENTITÉ
          =================================================== -->

          <div>

            <h4
              class="text-sm font-bold uppercase tracking-wide text-slate-500"
            >
              Identité
            </h4>


            <div
              class="mt-4 grid gap-4 sm:grid-cols-2"
            >

              <!-- NOM -->

              <div>

                <label
                  class="block text-sm font-semibold text-slate-700"
                >
                  Nom
                  <span class="text-rose-500">*</span>
                </label>

                <input
                  v-model="form.nom"
                  type="text"
                  autocomplete="off"
                  placeholder="Nom"
                  class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />

              </div>


              <!-- PRÉNOM -->

              <div>

                <label
                  class="block text-sm font-semibold text-slate-700"
                >
                  Prénom
                  <span class="text-rose-500">*</span>
                </label>

                <input
                  v-model="form.prenom"
                  type="text"
                  autocomplete="off"
                  placeholder="Prénom"
                  class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />

              </div>

            </div>

          </div>


          <!-- ==================================================
               COURSE
          =================================================== -->

          <div
            class="border-t border-slate-200 pt-6"
          >

            <h4
              class="text-sm font-bold uppercase tracking-wide text-slate-500"
            >
              Course
            </h4>


            <div
              class="mt-4 grid gap-4 sm:grid-cols-2"
            >

              <!-- DOSSARD -->

              <div>

                <label
                  class="block text-sm font-semibold text-slate-700"
                >
                  Dossard
                  <span class="text-rose-500">*</span>
                </label>

                <input
                  v-model="form.dossard"
                  type="number"
                  min="1"
                  inputmode="numeric"
                  placeholder="Numéro"
                  class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />

              </div>


              <!-- SEXE -->

              <div>

                <label
                  class="block text-sm font-semibold text-slate-700"
                >
                  Sexe
                  <span class="text-rose-500">*</span>
                </label>

                <select
                  v-model="form.sexe"
                  class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  @change="updateAutomaticCategory"
                >

                  <option value="F">
                    Fille
                  </option>

                  <option value="G">
                    Garçon
                  </option>

                </select>

              </div>


              <!-- CLASSE -->

              <div>

                <label
                  class="block text-sm font-semibold text-slate-700"
                >
                  Classe
                  <span class="text-rose-500">*</span>
                </label>

                <input
                  v-model="form.classe"
                  type="text"
                  autocomplete="off"
                  placeholder="Ex. 1A"
                  class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  @input="updateAutomaticCategory"
                />

                <p
                  class="mt-1 text-xs text-slate-400"
                >
                  Exemple : 1A, 2B, 3C...
                </p>

              </div>


              <!-- NIVEAU -->

              <div>

                <label
                  class="block text-sm font-semibold text-slate-700"
                >
                  Niveau
                </label>

                <input
                  v-model="form.niveau"
                  type="text"
                  readonly
                  class="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600"
                />

                <p
                  class="mt-1 text-xs text-slate-400"
                >
                  Calculé automatiquement depuis la classe.
                </p>

              </div>


              <!-- CATÉGORIE -->

              <div
                class="sm:col-span-2"
              >

                <label
                  class="block text-sm font-semibold text-slate-700"
                >
                  Catégorie
                </label>

                <div
                  class="mt-2 flex min-h-[48px] items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3"
                >

                  <span
                    v-if="form.categorie"
                    class="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700"
                  >
                    {{ form.categorie }}
                  </span>

                  <span
                    v-else
                    class="text-sm text-slate-400"
                  >
                    La catégorie sera calculée automatiquement.
                  </span>

                </div>

              </div>

            </div>

          </div>


          <!-- ==================================================
               PRÉSENCE
          =================================================== -->

          <div
            class="border-t border-slate-200 pt-6"
          >

            <label
              class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
            >

              <div>

                <p
                  class="font-semibold text-slate-800"
                >
                  Participant présent
                </p>

                <p
                  class="mt-1 text-sm text-slate-500"
                >
                  Indique si le participant est présent le jour de la course.
                </p>

              </div>


              <input
                v-model="form.present"
                type="checkbox"
                class="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300"
              />

            </label>

          </div>


          <!-- ==================================================
               APERÇU
          =================================================== -->

          <div
            class="border-t border-slate-200 pt-6"
          >

            <h4
              class="text-sm font-bold uppercase tracking-wide text-slate-500"
            >
              Aperçu
            </h4>


            <div
              class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >

              <div
                class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >

                <div>

                  <p
                    class="text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Participant
                  </p>

                  <p
                    class="mt-1 text-lg font-bold text-slate-900"
                  >
                    {{
                      form.prenom || "Prénom"
                    }}
                    {{
                      form.nom || "Nom"
                    }}
                  </p>


                  <div
                    class="mt-3 flex flex-wrap gap-2"
                  >

                    <span
                      class="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-sky-700 shadow-sm"
                    >
                      Dossard
                      {{ form.dossard || "—" }}
                    </span>

                    <span
                      class="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm"
                    >
                      {{ form.classe || "Classe" }}
                    </span>

                    <span
                      class="rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-semibold text-indigo-700"
                    >
                      {{ form.categorie || "Catégorie" }}
                    </span>

                  </div>

                </div>


                <div
                  class="shrink-0"
                >

                  <span
                    :class="
                      form.present
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    "
                    class="inline-flex rounded-full px-3 py-1.5 text-xs font-bold"
                  >
                    {{
                      form.present
                        ? "✓ Présent"
                        : "Absent"
                    }}
                  </span>

                </div>

              </div>


              <!-- QR EXISTANT -->

              <div
                v-if="editingParticipant?.qr"
                class="mt-5 border-t border-slate-200 pt-4"
              >

                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  QR CrossManager
                </p>

                <p
                  class="mt-2 inline-block rounded-lg bg-white px-3 py-2 font-mono text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {{ editingParticipant.qr }}
                </p>

              </div>

            </div>

          </div>


          <!-- ==================================================
               BOUTONS
          =================================================== -->

          <div
            class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end"
          >

            <button
              type="button"
              class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              @click="closeDialog"
            >
              Annuler
            </button>


            <button
              type="submit"
              class="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >

              {{
                editingParticipant
                  ? "💾 Enregistrer les modifications"
                  : "➕ Ajouter le participant"
              }}

            </button>

          </div>

        </form>

      </div>

    </div>

  </section>

</template>