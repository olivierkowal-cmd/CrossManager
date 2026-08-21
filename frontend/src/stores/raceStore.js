import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { importExcel } from '../services/excelImport.js'

import {
  saveParticipants,
  saveParticipant,
  deleteParticipantFirestore,
  listenParticipants,
} from '../services/participantService.js'


export const useRaceStore = defineStore('raceStore', () => {

  // =====================================================
  // ÉTAT
  // =====================================================

  const participants = ref([])

  const arrivals = ref([])

  const categories = ref([])

  const searchQuery = ref('')

  const importMessage = ref('')


  const settings = ref({

    schoolName: 'ISM Rèves',

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


  // =====================================================
  // RECALCUL DES CATÉGORIES
  // =====================================================

  function updateCategories() {

    categories.value = [

      ...new Set(

        participants.value

          .map(
            participant =>
              participant.categorie
          )

          .filter(Boolean)

      ),

    ].sort()

  }


  // =====================================================
  // PARTICIPANTS
  // =====================================================

  function setParticipants(
    newParticipants = []
  ) {

    participants.value =
      Array.isArray(newParticipants)
        ? newParticipants
        : []

    updateCategories()

  }


  // =====================================================
  // ÉCOUTE FIRESTORE
  // =====================================================

  function startParticipantsListening() {

    return listenParticipants(
      (newParticipants) => {

        setParticipants(
          newParticipants
        )

        console.log(
          "👥 Participants reçus depuis Firestore :",
          newParticipants.length
        )

      }
    )

  }


  // =====================================================
  // IMPORT EXCEL
  // =====================================================

  async function importParticipants(file) {

    importMessage.value =
      "Importation en cours..."


    try {

      const rows =
        await importExcel(file)


      const importedParticipants =
        rows.map(
          (row, index) => {

            const classe =
              String(
                row.Classe ??
                row.classe ??
                ''
              ).trim()


            const sexe =
              String(
                row.Sexe ??
                row.sexe ??
                ''
              )
                .trim()
                .toUpperCase()


            const categorie =
              classe && sexe
                ? `${classe.charAt(0)}${sexe}`
                : ''


            const dossard =
              String(
                index + 1
              ).padStart(
                4,
                '0'
              )


            return {

              id: index + 1,

              dossard,

              nom:
                String(
                  row.Nom ??
                  row.nom ??
                  ''
                ).trim(),

              prenom:
                String(
                  row.Prénom ??
                  row.Prenom ??
                  row.prenom ??
                  ''
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

              qr:
                `CM-${dossard}`,

            }

          }
        )


      setParticipants(
        importedParticipants
      )


      await saveParticipants(
        importedParticipants
      )


      importMessage.value =
        `${importedParticipants.length} participant(s) importé(s)`


      console.log(
        "✅ Participants importés :",
        importedParticipants.length
      )


      return importedParticipants.length

    } catch (error) {

      console.error(
        "❌ Erreur import participants :",
        error
      )


      importMessage.value =
        "Erreur lors de l'importation"


      throw error

    }

  }


  // =====================================================
  // AJOUTER UN PARTICIPANT
  // =====================================================

  async function addParticipant(
    participant
  ) {

    const newParticipant = {

      ...participant,

      id:
        participant.id ??
        Date.now(),

      dossard:
        String(
          participant.dossard ?? ''
        ).padStart(
          4,
          '0'
        ),

      qr:
        participant.qr ||
        `CM-${String(
          participant.dossard ?? ''
        ).padStart(
          4,
          '0'
        )}`,

    }


    participants.value.push(
      newParticipant
    )


    updateCategories()


    try {

      await saveParticipant(
        newParticipant
      )

      console.log(
        "✅ Participant enregistré :",
        newParticipant
      )

    } catch (error) {

      console.error(
        "❌ Erreur sauvegarde participant :",
        error
      )


      participants.value =
        participants.value.filter(
          p =>
            p.id !==
            newParticipant.id
        )


      updateCategories()

      throw error

    }


    return newParticipant

  }


  // =====================================================
  // MODIFIER UN PARTICIPANT
  // =====================================================

  async function updateParticipant(
    updatedParticipant
  ) {

    const index =
      participants.value.findIndex(
        participant =>
          participant.id ===
          updatedParticipant.id
      )


    if (index === -1) {

      return

    }


    const previousParticipant =
      participants.value[index]


    const participant = {

      ...updatedParticipant,

      dossard:
        String(
          updatedParticipant.dossard ?? ''
        ).padStart(
          4,
          '0'
        ),

    }


    participants.value[index] =
      participant


    updateCategories()


    try {

      await saveParticipant(
        participant
      )

      console.log(
        "✅ Participant modifié :",
        participant
      )

    } catch (error) {

      console.error(
        "❌ Erreur modification participant :",
        error
      )


      participants.value[index] =
        previousParticipant


      updateCategories()

      throw error

    }


    return participant

  }


  // =====================================================
  // SUPPRIMER UN PARTICIPANT
  // =====================================================

  async function deleteParticipant(
    id
  ) {

    const previousParticipants =
      [...participants.value]


    participants.value =
      participants.value.filter(
        participant =>
          participant.id !== id
      )


    updateCategories()


    try {

      await deleteParticipantFirestore(
        id
      )

      console.log(
        "🗑️ Participant supprimé :",
        id
      )

    } catch (error) {

      console.error(
        "❌ Erreur suppression participant :",
        error
      )


      participants.value =
        previousParticipants

      updateCategories()

      throw error

    }

  }


  // =====================================================
  // ARRIVÉES
  // =====================================================

  function addArrival(
    participantId,
    device = 'Scanner'
  ) {

    arrivals.value.push({

      participantId,

      scanTime:
        Date.now(),

      device,

    })

  }


  // =====================================================
  // RÉINITIALISATION LOCALE
  //
  // IMPORTANT :
  // Les participants sont CONSERVÉS.
  //
  // Le reset des courses est géré par
  // raceManagerStore + Firestore.
  // =====================================================

  function resetRace() {

    arrivals.value = []


    searchQuery.value = ''

    importMessage.value = ''


    settings.value = {

      schoolName: 'ISM Rèves',

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


    // Les participants restent présents.


    updateCategories()

  }


  // =====================================================
  // UTILITAIRE
  // =====================================================

  function formatTime(
    milliseconds = 0
  ) {

    const totalSeconds =
      Math.floor(
        milliseconds / 1000
      )


    const minutes =
      Math.floor(
        totalSeconds / 60
      )


    const seconds =
      totalSeconds % 60


    return (

      `${String(
        minutes
      ).padStart(2, "0")}:` +

      `${String(
        seconds
      ).padStart(2, "0")}`

    )

  }


  // =====================================================
  // RECHERCHE
  // =====================================================

  const filteredParticipants =
    computed(() => {

      const query =
        searchQuery.value
          .trim()
          .toLowerCase()


      if (!query) {

        return participants.value

      }


      return participants.value.filter(
        participant => {

          return [

            participant.dossard,

            participant.nom,

            participant.prenom,

            participant.classe,

            participant.sexe,

            participant.categorie,

            participant.qr,

          ]
            .filter(Boolean)
            .some(
              value =>
                String(value)
                  .toLowerCase()
                  .includes(query)
            )

        }
      )

    })


  // =====================================================
  // GETTERS
  // =====================================================

  const participantCount =
    computed(
      () =>
        participants.value.length
    )


  const arrivalCount =
    computed(
      () =>
        arrivals.value.length
    )


  const participantsByCategorie =
    computed(() => {

      return participants.value.reduce(
        (acc, participant) => {

          const categorie =
            participant.categorie ||
            'Autre'


          if (!acc[categorie]) {

            acc[categorie] = []

          }


          acc[categorie].push(
            participant
          )


          return acc

        },
        {}
      )

    })


  // =====================================================
  // API DU STORE
  // =====================================================

  return {

    participants,

    arrivals,

    categories,

    settings,

    timer,

    searchQuery,

    importMessage,


    setParticipants,

    importParticipants,

    addParticipant,

    updateParticipant,

    deleteParticipant,

    addArrival,

    resetRace,

    startParticipantsListening,


    participantCount,

    arrivalCount,

    participantsByCategorie,

    filteredParticipants,


    formatTime,

  }

})