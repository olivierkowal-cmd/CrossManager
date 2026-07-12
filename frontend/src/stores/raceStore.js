import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { importExcel } from '../services/excelImport.js'
import QRCode from 'qrcode'

export const useRaceStore = defineStore('raceStore', () => {
  // ==========================
  // État
  // ==========================

  const participants = ref([])
  const arrivals = ref([])
  const categories = ref([])

  const settings = ref({
    schoolName: 'École des Ursulines',
    eventName: 'Cross scolaire 2026',
    apiUrl: '',
    autoBeep: true,
    autoFullscreen: true,
  })

  const timer = ref({
    started: false,
    paused: false,
    officialStartTime: null,
    elapsed: 0,
  })

  // ==========================
  // Participants
  // ==========================

  function setParticipants(newParticipants = []) {
    participants.value = newParticipants

    categories.value = [
      ...new Set(
        newParticipants
          .map((p) => p.categorie)
          .filter(Boolean),
      ),
    ].sort()
  }

  async function importParticipants(file) {
    const rows = await importExcel(file)

    const importedParticipants = rows.map((row, index) => {
      const classe = String(row.Classe ?? row.classe ?? '').trim()

      const sexe = String(row.Sexe ?? row.sexe ?? '')
        .trim()
        .toUpperCase()

      const categorie =
        classe && sexe
          ? `${classe.charAt(0)}${sexe}`
          : ''

      return {
        id: index + 1,

        dossard: String(index + 1).padStart(4, '0'),

        nom: String(row.Nom ?? row.nom ?? '').trim(),

        prenom: String(
          row.Prénom ??
          row.Prenom ??
          row.prenom ??
          '',
        ).trim(),

        classe,

        sexe,

        categorie,

        present: false,

        arrive: false,

        heureDepart: null,

        heureArrivee: null,

        temps: null,

        position: null,

        positionCategorie: null,

        qr: `CM-${String(index + 1).padStart(4, '0')}`,
      }
    })

    setParticipants(importedParticipants)

    return importedParticipants.length
  }

  function addParticipant(participant) {
    participants.value.push(participant)

    categories.value = [
      ...new Set(
        participants.value
          .map((p) => p.categorie)
          .filter(Boolean),
      ),
    ].sort()
  }

  function updateParticipant(updatedParticipant) {
    const index = participants.value.findIndex(
      (p) => p.id === updatedParticipant.id,
    )

    if (index !== -1) {
      participants.value[index] = updatedParticipant
    }
  }

  function deleteParticipant(id) {
    participants.value = participants.value.filter(
      (p) => p.id !== id,
    )
  }

  // ==========================
  // Arrivées
  // ==========================

  function addArrival(participantId, device = 'Scanner') {
    arrivals.value.push({
      participantId,
      scanTime: Date.now(),
      device,
    })
  }

  // ==========================
  // Réinitialisation
  // ==========================

  function resetRace() {
    participants.value = []
    arrivals.value = []
    categories.value = []

    settings.value = {
      schoolName: 'École des Ursulines',
      eventName: 'Cross scolaire 2026',
      apiUrl: '',
      autoBeep: true,
      autoFullscreen: true,
    }

    timer.value = {
      started: false,
      paused: false,
      officialStartTime: null,
      elapsed: 0,
    }
  }

  // ==========================
  // Getters
  // ==========================

  const participantCount = computed(
    () => participants.value.length,
  )

  const arrivalCount = computed(
    () => arrivals.value.length,
  )

  const participantsByCategorie = computed(() => {
    return participants.value.reduce((acc, participant) => {
      const categorie = participant.categorie || 'Autre'

      if (!acc[categorie]) {
        acc[categorie] = []
      }

      acc[categorie].push(participant)

      return acc
    }, {})
  })

  return {
    participants,
    arrivals,
    categories,
    settings,
    timer,

    setParticipants,
    importParticipants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addArrival,
    resetRace,

    participantCount,
    arrivalCount,
    participantsByCategorie,
  }
})