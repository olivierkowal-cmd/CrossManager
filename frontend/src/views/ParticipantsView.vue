<script setup>

import { computed, onMounted, reactive, ref } from 'vue'

import { useRaceStore } from '../stores/raceStore'


const fileInput = ref(null)


// =====================================================
// STORE
// =====================================================

const raceStore = useRaceStore()


// =====================================================
// ÉTAT
// =====================================================

const isDialogOpen = ref(false)

const editingParticipant = ref(null)

const saving = ref(false)

const deleting = ref(false)


// =====================================================
// FORMULAIRE
// =====================================================

const form = reactive({

  dossard: '',

  nom: '',

  prenom: '',

  sexe: 'F',

  niveau: '1',

  classe: '',

  categorie: '',

  present: false,

  qr: '',

})


function emptyForm() {

  return {

    dossard: '',

    nom: '',

    prenom: '',

    sexe: 'F',

    niveau: '1',

    classe: '',

    categorie: '',

    present: false,

    qr: '',

  }

}


// =====================================================
// INITIALISATION
// =====================================================

onMounted(() => {

  if (!raceStore.participants.length) {

    raceStore.setParticipants()

  }

})


// =====================================================
// AJOUT
// =====================================================

function openCreateDialog() {

  editingParticipant.value = null

  Object.assign(
    form,
    emptyForm()
  )

  isDialogOpen.value = true

}


// =====================================================
// MODIFICATION
// =====================================================

function openEditDialog(participant) {

  editingParticipant.value =
    participant

  Object.assign(form, {

    dossard:
      participant.dossard ?? '',

    nom:
      participant.nom ?? '',

    prenom:
      participant.prenom ?? '',

    sexe:
      participant.sexe ?? 'F',

    niveau:
      participant.niveau ?? '1',

    classe:
      participant.classe ?? '',

    categorie:
      participant.categorie ?? '',

    present:
      participant.present ?? false,

    qr:
      participant.qr ?? '',

  })

  isDialogOpen.value = true

}


// =====================================================
// FERMER LE DIALOGUE
// =====================================================

function closeDialog() {

  isDialogOpen.value = false

  editingParticipant.value = null

  Object.assign(
    form,
    emptyForm()
  )

}


// =====================================================
// ENREGISTRER
// =====================================================

async function submitForm() {

  if (saving.value) {

    return

  }

  saving.value = true


  try {

    const dossard =
      String(
        form.dossard ?? ''
      )
        .trim()
        .padStart(4, '0')


    const classe =
      String(
        form.classe ?? ''
      ).trim() ||
      `${form.niveau}${form.sexe}`


    const categorie =
      String(
        form.categorie ?? ''
      ).trim() ||
      `${form.niveau}${form.sexe}`


    const payload = {

      ...form,

      dossard,

      classe,

      categorie,

      qr:
        form.qr ||
        `CM-${dossard}`,

    }


    // -------------------------------------------------
    // MODIFICATION
    // -------------------------------------------------

    if (editingParticipant.value) {

      await raceStore.updateParticipant({

        id:
          editingParticipant.value.id,

        ...payload,

      })

    }

    // -------------------------------------------------
    // AJOUT
    // -------------------------------------------------

    else {

      await raceStore.addParticipant(
        payload
      )

    }


    // IMPORTANT :
    // On ferme le dialogue avant de remettre
    // saving à false.

    closeDialog()

  } catch (error) {

    console.error(
      "❌ Erreur enregistrement participant :",
      error
    )

    alert(
      "Impossible d'enregistrer le participant dans Firestore."
    )

  } finally {

    saving.value = false

  }

}


// =====================================================
// SUPPRESSION
// =====================================================

async function removeParticipant(id) {

  if (deleting.value) {

    return

  }


  const confirmed =
    window.confirm(
      "Voulez-vous vraiment supprimer ce participant ?"
    )


  if (!confirmed) {

    return

  }


  deleting.value = true


  try {

    await raceStore.deleteParticipant(
      id
    )

  } catch (error) {

    console.error(
      "❌ Erreur suppression participant :",
      error
    )

    alert(
      "Impossible de supprimer le participant."
    )

  } finally {

    deleting.value = false

  }

}


// =====================================================
// IMPORT EXCEL
// =====================================================

function importExcel() {

  fileInput.value?.click()

}


// =====================================================
// FICHIER EXCEL
// =====================================================

async function handleExcelSelection(event) {

  const [file] =
    event.target.files || []


  if (!file) {

    return

  }


  try {

    await raceStore.importParticipants(
      file
    )

  } catch (error) {

    console.error(
      "❌ Erreur import Excel :",
      error
    )

  } finally {

    event.target.value = ''

  }

}


// =====================================================
// STATISTIQUES
// =====================================================

const summaryCards =
  computed(() => [

    {

      label: 'Total',

      value:
        raceStore.participantCount,

    },

    {

      label: 'Présents',

      value:
        raceStore.participants.filter(
          participant =>
            participant.present
        ).length,

    },

  ])

</script>


<template>

<section class="space-y-6">

  <!-- =================================================
       EN-TÊTE
  ================================================== -->

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


      <div class="flex flex-wrap gap-3">

        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          class="hidden"
          @change="handleExcelSelection"
        />


        <button
          class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
          @click="importExcel"
        >
          Importer un fichier Excel
        </button>


        <button
          class="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white"
          @click="openCreateDialog"
        >
          Ajouter un participant
        </button>

      </div>

    </div>


    <!-- =================================================
         STATISTIQUES
    ================================================== -->

    <div
      class="mt-6 grid gap-4 md:grid-cols-2"
    >

      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >

        <p class="text-sm text-slate-500">
          {{ card.label }}
        </p>


        <p
          class="mt-2 text-2xl font-semibold text-slate-900"
        >
          {{ card.value }}
        </p>

      </div>

    </div>


    <!-- =================================================
         RECHERCHE
    ================================================== -->

    <div
      class="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >

      <label
        class="w-full md:max-w-md"
      >

        <span class="sr-only">
          Rechercher
        </span>


        <input
          v-model="raceStore.searchQuery"
          type="search"
          placeholder="Rechercher un participant"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0"
        />

      </label>


      <p
        v-if="raceStore.importMessage"
        class="text-sm font-medium text-sky-700"
      >
        {{ raceStore.importMessage }}
      </p>

    </div>


    <!-- =================================================
         TABLEAU
    ================================================== -->

    <div
      class="mt-6 overflow-hidden rounded-2xl border border-slate-200"
    >

      <div class="overflow-x-auto">

        <table
          class="min-w-full divide-y divide-slate-200 text-left text-sm"
        >

          <thead class="bg-slate-50">

            <tr>

              <th class="px-4 py-3 font-semibold text-slate-700">
                Dossard
              </th>

              <th class="px-4 py-3 font-semibold text-slate-700">
                Nom
              </th>

              <th class="px-4 py-3 font-semibold text-slate-700">
                Prénom
              </th>

              <th class="px-4 py-3 font-semibold text-slate-700">
                Classe
              </th>

              <th class="px-4 py-3 font-semibold text-slate-700">
                Sexe
              </th>

              <th class="px-4 py-3 font-semibold text-slate-700">
                Catégorie
              </th>

              <th class="px-4 py-3 font-semibold text-slate-700">
                Présent
              </th>

              <th class="px-4 py-3 font-semibold text-slate-700">
                Actions
              </th>

            </tr>

          </thead>


          <tbody
            class="divide-y divide-slate-100 bg-white"
          >

            <tr
              v-for="participant in raceStore.filteredParticipants"
              :key="participant.id"
            >

              <td
                class="px-4 py-3 font-semibold text-slate-700"
              >
                {{ participant.dossard }}
              </td>


              <td class="px-4 py-3">
                {{ participant.nom }}
              </td>


              <td class="px-4 py-3">
                {{ participant.prenom }}
              </td>


              <td class="px-4 py-3">
                {{ participant.classe }}
              </td>


              <td class="px-4 py-3">
                {{ participant.sexe }}
              </td>


              <td class="px-4 py-3">
                {{ participant.categorie }}
              </td>


              <td class="px-4 py-3">

                <span
                  :class="
                    participant.present
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  "
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                >
                  {{ participant.present ? 'Oui' : 'Non' }}
                </span>

              </td>


              <td class="px-4 py-3">

                <div
                  class="flex flex-wrap gap-2"
                >

                  <button
                    class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
                    @click="openEditDialog(participant)"
                  >
                    Éditer
                  </button>


                  <button
                    class="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700 disabled:opacity-50"
                    :disabled="deleting"
                    @click="removeParticipant(participant.id)"
                  >
                    Supprimer
                  </button>

                </div>

              </td>

            </tr>


            <tr
              v-if="
                raceStore.filteredParticipants.length === 0
              "
            >

              <td
                colspan="8"
                class="px-4 py-8 text-center text-slate-400"
              >
                Aucun participant trouvé.
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </div>


  <!-- =================================================
       DIALOGUE PARTICIPANT
  ================================================== -->

  <div
    v-if="isDialogOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
  >

    <div
      class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
    >

      <div
        class="flex items-start justify-between"
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
            {{ editingParticipant ? 'Modifier' : 'Ajouter' }}
            un participant
          </h3>

        </div>


        <button
          class="text-sm font-semibold text-slate-500"
          :disabled="saving"
          @click="closeDialog"
        >
          Fermer
        </button>

      </div>


      <!-- =================================================
           FORMULAIRE
      ================================================== -->

      <div
        class="mt-6 grid gap-4 md:grid-cols-2"
      >

        <label class="text-sm text-slate-700">

          <span class="mb-2 block font-medium">
            Dossard
          </span>

          <input
            v-model="form.dossard"
            type="number"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />

        </label>


        <label class="text-sm text-slate-700">

          <span class="mb-2 block font-medium">
            Nom
          </span>

          <input
            v-model="form.nom"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />

        </label>


        <label class="text-sm text-slate-700">

          <span class="mb-2 block font-medium">
            Prénom
          </span>

          <input
            v-model="form.prenom"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />

        </label>


        <label class="text-sm text-slate-700">

          <span class="mb-2 block font-medium">
            Sexe
          </span>

          <select
            v-model="form.sexe"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          >

            <option value="F">
              F
            </option>

            <option value="G">
              G
            </option>

          </select>

        </label>


        <label class="text-sm text-slate-700">

          <span class="mb-2 block font-medium">
            Niveau
          </span>

          <input
            v-model="form.niveau"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />

        </label>


        <label class="text-sm text-slate-700">

          <span class="mb-2 block font-medium">
            Classe
          </span>

          <input
            v-model="form.classe"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />

        </label>


        <label class="text-sm text-slate-700">

          <span class="mb-2 block font-medium">
            Catégorie
          </span>

          <input
            v-model="form.categorie"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />

        </label>


        <label
          class="flex items-center gap-2 text-sm font-medium text-slate-700"
        >

          <input
            v-model="form.present"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300"
          />

          Présent

        </label>

      </div>


      <!-- =================================================
           BOUTONS
      ================================================== -->

      <div
        class="mt-6 flex justify-end gap-3"
      >

        <button
          class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
          :disabled="saving"
          @click="closeDialog"
        >
          Annuler
        </button>


        <button
          class="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="saving"
          @click="submitForm"
        >

          {{
            saving
              ? 'Enregistrement...'
              : 'Enregistrer'
          }}

        </button>

      </div>

    </div>

  </div>

</section>

</template>