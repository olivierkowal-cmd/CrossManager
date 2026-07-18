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

    ].sort()

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

    ].sort()

  })


// ==================================================
// PARTICIPANTS FILTRÉS
// ==================================================

const filteredParticipants =
  computed(() => {

    return raceStore.participants

      .filter(
        participant => {

          // --------------------------
          // Recherche
          // --------------------------

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
              ).toLowerCase()

            const prenom =
              String(
                participant.prenom ??
                ""
              ).toLowerCase()

            const dossard =
              String(
                participant.dossard ??
                ""
              ).toLowerCase()

            const classe =
              String(
                participant.classe ??
                ""
              ).toLowerCase()

            const categorie =
              String(
                participant.categorie ??
                ""
              ).toLowerCase()


            if (

              !nom.includes(query) &&

              !prenom.includes(query) &&

              !dossard.includes(query) &&

              !classe.includes(query) &&

              !categorie.includes(query)

            ) {

              return false

            }

          }


          // --------------------------
          // Classe
          // --------------------------

          if (

            filterClasse.value &&

            participant.classe !==
              filterClasse.value

          ) {

            return false

          }


          // --------------------------
          // Catégorie
          // --------------------------

          if (

            filterCategorie.value &&

            participant.categorie !==
              filterCategorie.value

          ) {

            return false

          }


          // --------------------------
          // Sexe
          // --------------------------

          if (

            filterSexe.value &&

            participant.sexe !==
              filterSexe.value

          ) {

            return false

          }


          // --------------------------
          // Présence
          // --------------------------

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

      .sort(
        (a, b) => {

          return (
            Number(
              a.dossard
            ) -
            Number(
              b.dossard
            )
          )

        }
      )

  })


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


  // Dossard automatique

  form.dossard =
    raceStore
      .generateNextBibNumber()


  isDialogOpen.value =
    true

}


// ==================================================
// OUVRIR MODIFICATION
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
// FERMER MODALE
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
// VALIDATION FORMULAIRE
// ==================================================

function validateForm() {

  formError.value =
    ""


  if (
    !String(
      form.nom
    ).trim()
  ) {

    formError.value =
      "Le nom est obligatoire."

    return false

  }


  if (
    !String(
      form.prenom
    ).trim()
  ) {

    formError.value =
      "Le prénom est obligatoire."

    return false

  }


  if (
    !String(
      form.dossard
    ).trim()
  ) {

    formError.value =
      "Le numéro de dossard est obligatoire."

    return false

  }


  if (
    !String(
      form.classe
    ).trim()
  ) {

    formError.value =
      "La classe est obligatoire."

    return false

  }


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


  // --------------------------
  // Modification
  // --------------------------

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


  // --------------------------
  // Création
  // --------------------------

  else {

    result =
      raceStore
        .addParticipant(
          payload
        )

  }


  // --------------------------
  // Erreur
  // --------------------------

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
// SUPPRIMER PARTICIPANT
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

    alert(

      result?.message ||

      "Impossible de supprimer le participant."

    )

  }

}


// ==================================================
// CHANGER PRÉSENCE
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
// IMPORT EXCEL
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


    importMessage.value =
      `${count} participant(s) importé(s) avec succès.`


  } catch (error) {

    console.error(
      "Erreur import Excel :",
      error
    )


    importMessage.value =
      ""


    alert(
      "Impossible d'importer le fichier Excel. Vérifiez le format du fichier."
    )

  } finally {

    isImporting.value =
      false


    event.target.value =
      ""

  }

}


// ==================================================
// RÉINITIALISER FILTRES
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
            Ajoutez, recherchez et gérez les coureurs de votre événement.
          </p>

        </div>


        <!-- ACTIONS -->

        <div
          class="flex flex-wrap gap-3"
        >

          <!-- INPUT EXCEL CACHÉ -->

          <input
            ref="fileInput"
            type="file"
            accept=".xlsx,.xls,.csv"
            class="hidden"
            @change="handleExcelSelection"
          />


          <!-- IMPORT -->

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


          <!-- AJOUT -->

          <button
            type="button"
            class="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            @click="openCreateDialog"
          >
            ➕ Ajouter un participant
          </button>

        </div>

      </div>


      <!-- MESSAGE IMPORT -->

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
            placeholder="Nom, prénom, dossard, classe..."
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500"
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


      <!-- RÉSUMÉ FILTRES -->

      <div
        class="mt-5 flex flex-wrap items-center justify-between gap-3"
      >

        <p
          class="text-sm text-slate-500"
        >
          {{ filteredParticipants.length }}
          participant(s) affiché(s)
          sur
          {{ raceStore.participantCount }}
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
         TABLEAU
    =================================================== -->

    <div
      class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >

      <div
        class="overflow-x-auto"
      >

        <table
          class="min-w-full divide-y divide-slate-200 text-left text-sm"
        >

          <thead
            class="bg-slate-50"
          >

            <tr>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Dossard
              </th>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Nom
              </th>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Prénom
              </th>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Classe
              </th>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Sexe
              </th>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Catégorie
              </th>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Présence
              </th>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                QR
              </th>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Actions
              </th>

            </tr>

          </thead>


          <tbody
            class="divide-y divide-slate-100 bg-white"
          >

            <!-- PARTICIPANTS -->

            <tr
              v-for="participant in filteredParticipants"
              :key="participant.id"
              class="transition hover:bg-slate-50"
            >

              <!-- DOSSARD -->

              <td
                class="px-4 py-3"
              >

                <span
                  class="rounded-lg bg-sky-50 px-3 py-1.5 font-bold text-sky-700"
                >
                  {{ participant.dossard }}
                </span>

              </td>


              <!-- NOM -->

              <td
                class="px-4 py-3 font-semibold text-slate-900"
              >
                {{ participant.nom }}
              </td>


              <!-- PRÉNOM -->

              <td
                class="px-4 py-3 text-slate-700"
              >
                {{ participant.prenom }}
              </td>


              <!-- CLASSE -->

              <td
                class="px-4 py-3 text-slate-700"
              >
                {{ participant.classe }}
              </td>


              <!-- SEXE -->

              <td
                class="px-4 py-3"
              >

                <span
                  class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                >
                  {{ participant.sexe }}
                </span>

              </td>


              <!-- CATÉGORIE -->

              <td
                class="px-4 py-3"
              >

                <span
                  class="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                >
                  {{ participant.categorie }}
                </span>

              </td>


              <!-- PRÉSENCE -->

              <td
                class="px-4 py-3"
              >

                <button
                  type="button"
                  :class="
                    participant.present
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
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
                class="px-4 py-3 text-xs font-medium text-slate-500"
              >
                {{ participant.qr }}
              </td>


              <!-- ACTIONS -->

              <td
                class="px-4 py-3"
              >

                <div
                  class="flex flex-wrap gap-2"
                >

                  <button
                    type="button"
                    class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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


            <!-- AUCUN RÉSULTAT -->

            <tr
              v-if="filteredParticipants.length === 0"
            >

              <td
                colspan="9"
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
         MODALE AJOUT / MODIFICATION
    =================================================== -->

    <div
      v-if="isDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      @click.self="closeDialog"
    >

      <div
        class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
      >

        <!-- HEADER MODALE -->

        <div
          class="flex items-start justify-between gap-4"
        >

          <div>

            <p
              class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600"
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

          </div>


          <button
            type="button"
            class="text-sm font-semibold text-slate-500 hover:text-slate-700"
            @click="closeDialog"
          >
            ✕ Fermer
          </button>

        </div>


        <!-- ERREUR -->

        <div
          v-if="formError"
          class="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {{ formError }}
        </div>


        <!-- FORMULAIRE -->

        <div
          class="mt-6 grid gap-4 md:grid-cols-2"
        >

          <!-- DOSSARD -->

          <label
            class="text-sm text-slate-700"
          >

            <span
              class="mb-2 block font-medium"
            >
              Dossard
            </span>

            <input
              v-model="form.dossard"
              type="number"
              min="1"
              class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            />

            <span
              class="mt-1 block text-xs text-slate-400"
            >
              Le QR Code sera généré automatiquement.
            </span>

          </label>


          <!-- NOM -->

          <label
            class="text-sm text-slate-700"
          >

            <span
              class="mb-2 block font-medium"
            >
              Nom *
            </span>

            <input
              v-model="form.nom"
              type="text"
              class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            />

          </label>


          <!-- PRÉNOM -->

          <label
            class="text-sm text-slate-700"
          >

            <span
              class="mb-2 block font-medium"
            >
              Prénom *
            </span>

            <input
              v-model="form.prenom"
              type="text"
              class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            />

          </label>


          <!-- SEXE -->

          <label
            class="text-sm text-slate-700"
          >

            <span
              class="mb-2 block font-medium"
            >
              Sexe
            </span>

            <select
              v-model="form.sexe"
              class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              @change="updateAutomaticCategory"
            >

              <option value="F">
                Fille
              </option>

              <option value="G">
                Garçon
              </option>

            </select>

          </label>


          <!-- NIVEAU -->

          <label
            class="text-sm text-slate-700"
          >

            <span
              class="mb-2 block font-medium"
            >
              Niveau
            </span>

            <input
              v-model="form.niveau"
              type="text"
              class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5"
              readonly
            />

          </label>


          <!-- CLASSE -->

          <label
            class="text-sm text-slate-700"
          >

            <span
              class="mb-2 block font-medium"
            >
              Classe *
            </span>

            <input
              v-model="form.classe"
              type="text"
              placeholder="Exemple : 3A"
              class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              @input="updateAutomaticCategory"
            />

          </label>


          <!-- CATÉGORIE -->

          <label
            class="text-sm text-slate-700"
          >

            <span
              class="mb-2 block font-medium"
            >
              Catégorie
            </span>

            <input
              v-model="form.categorie"
              type="text"
              class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5"
              readonly
            />

            <span
              class="mt-1 block text-xs text-slate-400"
            >
              Calculée automatiquement selon la classe et le sexe.
            </span>

          </label>


          <!-- PRÉSENCE -->

          <div
            class="flex items-center"
          >

            <label
              class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >

              <input
                v-model="form.present"
                type="checkbox"
                class="h-5 w-5 rounded border-slate-300"
              />

              <span
                class="text-sm font-medium text-slate-700"
              >
                Participant présent
              </span>

            </label>

          </div>

        </div>


        <!-- QR APERÇU -->

        <div
          v-if="form.dossard"
          class="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4"
        >

          <p
            class="text-sm font-semibold text-sky-900"
          >
            QR Code associé
          </p>

          <p
            class="mt-1 font-mono text-sm text-sky-700"
          >
            CM-{{
              String(
                form.dossard
              ).padStart(
                4,
                "0"
              )
            }}
          </p>

        </div>


        <!-- ACTIONS MODALE -->

        <div
          class="mt-6 flex justify-end gap-3"
        >

          <button
            type="button"
            class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            @click="closeDialog"
          >
            Annuler
          </button>

          <button
            type="button"
            class="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
            @click="submitForm"
          >

            {{
              editingParticipant
                ? "Enregistrer les modifications"
                : "Ajouter le participant"
            }}

          </button>

        </div>

      </div>

    </div>

  </section>

</template>