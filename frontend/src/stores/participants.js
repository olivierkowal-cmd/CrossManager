import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { importExcel } from '../services/excelService'

// Store métier dédié à la gestion des participants de la course.
export const useParticipantsStore = defineStore('participants', () => {
  const participants = ref([])
  const searchQuery = ref('')
  const importMessage = ref('')

  // Génération d’un jeu de données de démonstration cohérent.
  function buildDemoParticipants() {
    const firstNames = ['Lina', 'Noa', 'Malo', 'Emma', 'Julien', 'Camille', 'Sacha', 'Léa', 'Hugo', 'Nora']
    const lastNames = ['Martin', 'Durand', 'Leroy', 'Petit', 'Roux', 'Bernard', 'Morel', 'Simon', 'Dubois', 'Garcia']
    const generated = []

    for (let index = 0; index < 20; index += 1) {
      const niveau = ((index % 6) + 1).toString()
      const sexe = index % 2 === 0 ? 'G' : 'F'
      const nom = lastNames[index % lastNames.length]
      const prenom = firstNames[index % firstNames.length]
      const dossard = 100 + index + 1
      const classe = `${niveau}${sexe === 'G' ? 'A' : 'B'}`
      const categorie = `${niveau}${sexe}`

      generated.push({
        id: index + 1,
        dossard,
        nom,
        prenom,
        sexe,
        niveau,
        classe,
        categorie,
        present: index % 3 !== 0,
        qr: `QR-${String(dossard).padStart(3, '0')}`,
      })
    }

    return generated
  }

  function seedParticipants() {
    participants.value = buildDemoParticipants()
  }

  function addParticipant(payload) {
    const nextParticipant = {
      id: Date.now(),
      dossard: Number(payload.dossard),
      nom: payload.nom.trim(),
      prenom: payload.prenom.trim(),
      sexe: payload.sexe,
      niveau: payload.niveau,
      classe: payload.classe.trim(),
      categorie: payload.categorie || `${payload.niveau}${payload.sexe}`,
      present: Boolean(payload.present),
      qr: payload.qr || `QR-${String(payload.dossard).padStart(3, '0')}`,
    }

    participants.value.unshift(nextParticipant)
    return nextParticipant
  }

  function updateParticipant(payload) {
    const index = participants.value.findIndex((item) => item.id === payload.id)
    if (index === -1) return null

    participants.value[index] = {
      ...participants.value[index],
      dossard: Number(payload.dossard),
      nom: payload.nom.trim(),
      prenom: payload.prenom.trim(),
      sexe: payload.sexe,
      niveau: payload.niveau,
      classe: payload.classe.trim(),
      categorie: payload.categorie || `${payload.niveau}${payload.sexe}`,
      present: Boolean(payload.present),
      qr: payload.qr || `QR-${String(payload.dossard).padStart(3, '0')}`,
    }

    return participants.value[index]
  }

  function deleteParticipant(id) {
    participants.value = participants.value.filter((item) => item.id !== id)
  }

  async function importParticipants(file) {
    if (!file) {
      importMessage.value = 'Aucun fichier sélectionné.'
      return []
    }

    try {
      const importedParticipants = await importExcel(file, participants.value.length + 1)

      if (!importedParticipants.length) {
        importMessage.value = 'Aucune donnée à importer.'
        return []
      }

      const nextParticipants = importedParticipants.map((participant, index) => ({
        id: Date.now() + index,
        ...participant,
      }))

      participants.value = [...nextParticipants, ...participants.value]
      importMessage.value = `${nextParticipants.length} participant(s) importé(s).`
      return nextParticipants
    } catch (error) {
      importMessage.value = `Erreur d’import : ${error.message}`
      return []
    }
  }

  function searchParticipants(query = '') {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return participants.value

    return participants.value.filter((participant) => {
      const haystack = `${participant.dossard} ${participant.nom} ${participant.prenom} ${participant.classe} ${participant.categorie}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }

  const visibleParticipants = computed(() => searchParticipants(searchQuery.value))
  const presentCount = computed(() => participants.value.filter((item) => item.present).length)
  const totalCount = computed(() => participants.value.length)

  return {
    participants,
    searchQuery,
    importMessage,
    visibleParticipants,
    presentCount,
    totalCount,
    seedParticipants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    importParticipants,
    searchParticipants,
  }
})
