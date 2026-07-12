<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRaceStore } from '../stores/raceStore'
import QrCode from '../components/QrCode.vue'

const fileInput = ref(null)

// Store unique de la course et des participants.
const raceStore = useRaceStore()
const isDialogOpen = ref(false)
const editingParticipant = ref(null)
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

const emptyForm = () => ({
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

onMounted(() => {
  if (!raceStore.participants.length) {
    raceStore.setParticipants()
  }
})

function openCreateDialog() {
  editingParticipant.value = null
  Object.assign(form, emptyForm())
  isDialogOpen.value = true
}

function openEditDialog(participant) {
  editingParticipant.value = participant
  Object.assign(form, {
    dossard: participant.dossard,
    nom: participant.nom,
    prenom: participant.prenom,
    sexe: participant.sexe,
    niveau: participant.niveau,
    classe: participant.classe,
    categorie: participant.categorie,
    present: participant.present,
    qr: participant.qr,
  })
  isDialogOpen.value = true
}

function closeDialog() {
  isDialogOpen.value = false
  editingParticipant.value = null
  Object.assign(form, emptyForm())
}

function submitForm() {
  const payload = {
    ...form,
    dossard: Number(form.dossard),
    classe: form.classe || `${form.niveau}${form.sexe}`,
    categorie: form.categorie || `${form.niveau}${form.sexe}`,
  }

  if (editingParticipant.value) {
    raceStore.updateParticipant({ id: editingParticipant.value.id, ...payload })
  } else {
    raceStore.addParticipant(payload)
  }

  closeDialog()
}

function removeParticipant(id) {
  raceStore.deleteParticipant(id)
}

async function importExcel() {
  fileInput.value?.click()
}

async function handleExcelSelection(event) {
  const [file] = event.target.files || []
  if (!file) return

  await raceStore.importParticipants(file)
  event.target.value = ''
}

const summaryCards = computed(() => [
  { label: 'Total', value: raceStore.participantCount },
  { label: 'Présents', value: raceStore.participants.filter((participant) => participant.present).length },
])
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">Participants</p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-900">Gestion des participants</h2>
          <p class="mt-2 text-sm text-slate-500">Ajoutez, recherchez et gérez les coureurs de votre événement.</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleExcelSelection" />
          <button class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700" @click="importExcel">
            Importer un fichier Excel
          </button>
          <button class="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white" @click="openCreateDialog">
            Ajouter un participant
          </button>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div v-for="card in summaryCards" :key="card.label" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm text-slate-500">{{ card.label }}</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">{{ card.value }}</p>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label class="w-full md:max-w-md">
          <span class="sr-only">Rechercher</span>
          <input v-model="raceStore.searchQuery" type="search" placeholder="Rechercher un participant" class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-0" />
        </label>
        <p v-if="raceStore.importMessage" class="text-sm font-medium text-sky-700">{{ raceStore.importMessage }}</p>
      </div>

      <div class="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 font-semibold text-slate-700">Dossard</th>
                <th class="px-4 py-3 font-semibold text-slate-700">Nom</th>
                <th class="px-4 py-3 font-semibold text-slate-700">Prénom</th>
                <th class="px-4 py-3 font-semibold text-slate-700">Classe</th>
                <th class="px-4 py-3 font-semibold text-slate-700">Sexe</th>
                <th class="px-4 py-3 font-semibold text-slate-700">Catégorie</th>
                <th class="px-4 py-3 font-semibold text-slate-700">Présent</th>
                <th class="px-4 py-3 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="participant in raceStore.participants" :key="participant.id">                <td class="px-4 py-3 font-semibold text-slate-700">{{ participant.dossard }}</td>
                <td class="px-4 py-3">{{ participant.nom }}</td>
                <td class="px-4 py-3">{{ participant.prenom }}</td>
                <td class="px-4 py-3">{{ participant.classe }}</td>
                <td class="px-4 py-3">{{ participant.sexe }}</td>
                <td class="px-4 py-3">{{ participant.categorie }}</td>
                <td class="px-4 py-3">
                  <span :class="participant.present ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'" class="rounded-full px-2.5 py-1 text-xs font-semibold">
                    {{ participant.present ? 'Oui' : 'Non' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-2">
                    <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700" @click="openEditDialog(participant)">Éditer</button>
                    <button class="rounded-lg bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700" @click="removeParticipant(participant.id)">Supprimer</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div class="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">Participant</p>
            <h3 class="mt-2 text-xl font-semibold text-slate-900">{{ editingParticipant ? 'Modifier' : 'Ajouter' }} un participant</h3>
          </div>
          <button class="text-sm font-semibold text-slate-500" @click="closeDialog">Fermer</button>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <label class="text-sm text-slate-700">
            <span class="mb-2 block font-medium">Dossard</span>
            <input v-model="form.dossard" type="number" class="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="text-sm text-slate-700">
            <span class="mb-2 block font-medium">Nom</span>
            <input v-model="form.nom" class="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="text-sm text-slate-700">
            <span class="mb-2 block font-medium">Prénom</span>
            <input v-model="form.prenom" class="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="text-sm text-slate-700">
            <span class="mb-2 block font-medium">Sexe</span>
            <select v-model="form.sexe" class="w-full rounded-xl border border-slate-300 px-3 py-2.5">
              <option value="F">F</option>
              <option value="G">G</option>
            </select>
          </label>
          <label class="text-sm text-slate-700">
            <span class="mb-2 block font-medium">Niveau</span>
            <input v-model="form.niveau" class="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="text-sm text-slate-700">
            <span class="mb-2 block font-medium">Classe</span>
            <input v-model="form.classe" class="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="text-sm text-slate-700">
            <span class="mb-2 block font-medium">Catégorie</span>
            <input v-model="form.categorie" class="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>
          <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input v-model="form.present" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
            Présent
          </label>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700" @click="closeDialog">Annuler</button>
          <button class="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white" @click="submitForm">Enregistrer</button>
        </div>
      </div>
    </div>
  </section>
</template>
