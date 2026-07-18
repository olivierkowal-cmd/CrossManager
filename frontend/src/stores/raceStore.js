import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"

import { importExcel } from "../services/excelImport.js"

import {
  saveProject,
  loadProject,
  clearProject,
} from "../services/autoSave.js"

import { useRaceManagerStore } from "./raceManagerStore"


export const useRaceStore = defineStore(
  "raceStore",
  () => {

    // ==================================================
    // ÉTAT
    // ==================================================

    const participants = ref([])

    const arrivals = ref([])

    const categories = ref([])


    const settings = ref({

      schoolName: "ISM Rèves",

      eventName: "Cross 2026",

      logo: null,

      apiUrl: "",

      autoBeep: true,

      autoFullscreen: true,

    })


    const timer = ref({

      started: false,

      paused: false,

      officialStartTime: null,

      elapsed: 0,

    })


    const raceManager =
      useRaceManagerStore()


    // ==================================================
    // OUTILS PARTICIPANTS
    // ==================================================


    /*
    --------------------------------------------------
    Générer un ID unique
    --------------------------------------------------
    */

    function generateParticipantId() {

      if (
        participants.value.length === 0
      ) {
        return 1
      }

      const ids =
        participants.value
          .map(
            participant =>
              Number(
                participant.id
              ) || 0
          )

      return (
        Math.max(...ids) + 1
      )

    }


    /*
    --------------------------------------------------
    Générer le prochain numéro de dossard
    --------------------------------------------------
    */

    function generateNextBibNumber() {

      if (
        participants.value.length === 0
      ) {
        return "0001"
      }

      const numbers =
        participants.value
          .map(
            participant =>
              Number(
                participant.dossard
              ) || 0
          )

      const maxNumber =
        Math.max(...numbers)

      return String(
        maxNumber + 1
      ).padStart(
        4,
        "0"
      )

    }


    /*
    --------------------------------------------------
    Formater un dossard
    --------------------------------------------------
    */

    function formatBibNumber(
      dossard
    ) {

      const value =
        String(
          dossard ?? ""
        ).trim()

      if (!value) {
        return ""
      }

      const numericValue =
        Number(value)

      if (
        Number.isNaN(
          numericValue
        )
      ) {
        return value
      }

      return String(
        numericValue
      ).padStart(
        4,
        "0"
      )

    }


    /*
    --------------------------------------------------
    Vérifier si un dossard existe
    --------------------------------------------------
    */

    function bibNumberExists(
      dossard,
      excludeId = null
    ) {

      const formatted =
        formatBibNumber(
          dossard
        )

      return participants.value.some(
        participant => {

          if (
            excludeId !== null &&
            participant.id ===
              excludeId
          ) {
            return false
          }

          return (
            formatBibNumber(
              participant.dossard
            ) === formatted
          )

        }
      )

    }


    /*
    --------------------------------------------------
    Générer le QR
    --------------------------------------------------
    */

    function generateQr(
      dossard
    ) {

      const formatted =
        formatBibNumber(
          dossard
        )

      return `CM-${formatted}`

    }


    /*
    --------------------------------------------------
    Déterminer la catégorie
    --------------------------------------------------
    */

    function generateCategory(
      classe,
      sexe
    ) {

      const cleanClasse =
        String(
          classe ?? ""
        ).trim()

      const cleanSexe =
        String(
          sexe ?? ""
        )
          .trim()
          .toUpperCase()

      if (
        !cleanClasse ||
        !cleanSexe
      ) {
        return ""
      }

      return (
        cleanClasse.charAt(0) +
        cleanSexe
      )

    }


    /*
    --------------------------------------------------
    Recalculer les catégories
    --------------------------------------------------
    */

    function refreshCategories() {

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


    /*
    --------------------------------------------------
    Synchroniser les courses
    --------------------------------------------------
    */

    function syncRaceParticipants() {

      raceManager.races.forEach(
        race => {

          const total =
            participants.value.filter(
              participant =>
                participant.categorie ===
                race.categorie
            ).length

          raceManager.setParticipants(
            race.categorie,
            total
          )

        }
      )

    }


    // ==================================================
    // SET PARTICIPANTS
    // ==================================================

    function setParticipants(
      newParticipants = []
    ) {

      participants.value =
        newParticipants

      refreshCategories()

      syncRaceParticipants()

    }


    // ==================================================
    // IMPORT EXCEL
    // ==================================================

    async function importParticipants(
      file
    ) {

      const rows =
        await importExcel(file)


      const importedParticipants =
        rows.map(
          (row, index) => {

            // --------------------------
            // Classe
            // --------------------------

            const classe =
              String(
                row.Classe ??
                row.classe ??
                ""
              ).trim()


            // --------------------------
            // Sexe
            // --------------------------

            const sexe =
              String(
                row.Sexe ??
                row.sexe ??
                ""
              )
                .trim()
                .toUpperCase()


            // --------------------------
            // Catégorie
            // --------------------------

            const categorie =
              generateCategory(
                classe,
                sexe
              )


            // --------------------------
            // Dossard
            // --------------------------

            const dossard =
              String(
                index + 1
              ).padStart(
                4,
                "0"
              )


            // --------------------------
            // Participant
            // --------------------------

            return {

              id:
                index + 1,

              dossard,

              nom:
                String(
                  row.Nom ??
                  row.nom ??
                  ""
                ).trim(),

              prenom:
                String(
                  row.Prénom ??
                  row.Prenom ??
                  row.prenom ??
                  ""
                ).trim(),

              classe,

              niveau:
                classe.charAt(0) ||
                "",

              sexe,

              categorie,

              present: false,

              arrive: false,

              heureDepart: null,

              heureArrivee: null,

              temps: null,

              position: null,

              positionCategorie:
                null,

              qr:
                generateQr(
                  dossard
                ),

            }

          }
        )


      setParticipants(
        importedParticipants
      )


      return (
        importedParticipants.length
      )

    }


    // ==================================================
    // AJOUTER PARTICIPANT
    // ==================================================

    function addParticipant(
      participant
    ) {

      // --------------------------
      // Dossard
      // --------------------------

      let dossard =
        participant.dossard
          ? formatBibNumber(
              participant.dossard
            )
          : generateNextBibNumber()


      // --------------------------
      // Vérification doublon
      // --------------------------

      if (
        bibNumberExists(
          dossard
        )
      ) {

        return {

          success: false,

          message:
            `Le dossard ${dossard} existe déjà.`,

        }

      }


      // --------------------------
      // Classe
      // --------------------------

      const classe =
        String(
          participant.classe ??
          ""
        ).trim()


      // --------------------------
      // Sexe
      // --------------------------

      const sexe =
        String(
          participant.sexe ??
          ""
        )
          .trim()
          .toUpperCase()


      // --------------------------
      // Catégorie
      // --------------------------

      const categorie =
        participant.categorie
          ? String(
              participant.categorie
            ).trim()
          : generateCategory(
              classe,
              sexe
            )


      // --------------------------
      // Nouveau participant
      // --------------------------

      const newParticipant = {

        id:
          generateParticipantId(),

        dossard,

        nom:
          String(
            participant.nom ??
            ""
          ).trim(),

        prenom:
          String(
            participant.prenom ??
            ""
          ).trim(),

        niveau:
          participant.niveau ??
          classe.charAt(0) ??
          "",

        classe,

        sexe,

        categorie,

        present:
          Boolean(
            participant.present
          ),

        arrive: false,

        heureDepart: null,

        heureArrivee: null,

        temps: null,

        position: null,

        positionCategorie:
          null,

        qr:
          generateQr(
            dossard
          ),

      }


      participants.value.push(
        newParticipant
      )


      refreshCategories()

      syncRaceParticipants()


      return {

        success: true,

        participant:
          newParticipant,

      }

    }


    // ==================================================
    // MODIFIER PARTICIPANT
    // ==================================================

    function updateParticipant(
      updatedParticipant
    ) {

      const index =
        participants.value.findIndex(
          participant =>
            participant.id ===
            updatedParticipant.id
        )


      if (
        index === -1
      ) {

        return {

          success: false,

          message:
            "Participant introuvable.",

        }

      }


      // --------------------------
      // Dossard
      // --------------------------

      const dossard =
        formatBibNumber(
          updatedParticipant.dossard
        )


      // --------------------------
      // Vérification doublon
      // --------------------------

      if (
        bibNumberExists(
          dossard,
          updatedParticipant.id
        )
      ) {

        return {

          success: false,

          message:
            `Le dossard ${dossard} est déjà utilisé.`,

        }

      }


      // --------------------------
      // Classe
      // --------------------------

      const classe =
        String(
          updatedParticipant.classe ??
          ""
        ).trim()


      // --------------------------
      // Sexe
      // --------------------------

      const sexe =
        String(
          updatedParticipant.sexe ??
          ""
        )
          .trim()
          .toUpperCase()


      // --------------------------
      // Catégorie
      // --------------------------

      const categorie =
        updatedParticipant.categorie
          ? String(
              updatedParticipant.categorie
            ).trim()
          : generateCategory(
              classe,
              sexe
            )


      // --------------------------
      // Mise à jour
      // --------------------------

      participants.value[index] = {

        ...participants.value[index],

        ...updatedParticipant,

        dossard,

        classe,

        sexe,

        categorie,

        qr:
          generateQr(
            dossard
          ),

      }


      refreshCategories()

      syncRaceParticipants()


      return {

        success: true,

        participant:
          participants.value[
            index
          ],

      }

    }


    // ==================================================
    // SUPPRIMER PARTICIPANT
    // ==================================================

    function deleteParticipant(
      id
    ) {

      const participant =
        participants.value.find(
          participant =>
            participant.id === id
        )


      if (!participant) {

        return {

          success: false,

          message:
            "Participant introuvable.",

        }

      }


      participants.value =
        participants.value.filter(
          participant =>
            participant.id !== id
        )


      // Supprimer également
      // les arrivées liées

      arrivals.value =
        arrivals.value.filter(
          arrival =>
            arrival.participantId !==
            id
        )


      refreshCategories()

      syncRaceParticipants()


      return {

        success: true,

      }

    }


    // ==================================================
    // ARRIVÉES
    // ==================================================

    function addArrival(
      participantId,
      device = "Scanner"
    ) {

      arrivals.value.push({

        participantId,

        scanTime:
          Date.now(),

        device,

      })

    }


    // ==================================================
    // RESTAURATION PROJET
    // ==================================================

    function restoreProject() {

      const backup =
        loadProject()


      if (!backup) {
        return
      }


      participants.value =
        backup.data
          ?.participants ??
        []


      arrivals.value =
        backup.data
          ?.arrivals ??
        []


      categories.value =
        backup.data
          ?.categories ??
        []


      settings.value = {

        ...settings.value,

        ...(
          backup.data
            ?.settings ??
          {}
        ),

      }


      timer.value = {

        ...timer.value,

        ...(
          backup.data
            ?.timer ??
          {}
        ),

      }


      refreshCategories()

      syncRaceParticipants()

    }


    // ==================================================
    // NOUVEAU PROJET / RESET
    // ==================================================

    function resetRace() {

      // Supprimer sauvegarde

      clearProject()


      // Réinitialiser les courses

      raceManager.resetAllRaces()


      // Réinitialiser participants

      participants.value = []

      arrivals.value = []

      categories.value = []


      // Réinitialiser paramètres

      settings.value = {

        schoolName:
          "ISM Rèves",

        eventName:
          "Cross 2026",

        logo:
          null,

        apiUrl:
          "",

        autoBeep:
          true,

        autoFullscreen:
          true,

      }


      // Réinitialiser chrono

      timer.value = {

        started:
          false,

        paused:
          false,

        officialStartTime:
          null,

        elapsed:
          0,

      }

    }


    // ==================================================
    // GETTERS
    // ==================================================

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


    const presentCount =
      computed(
        () =>
          participants.value.filter(
            participant =>
              participant.present
          ).length
      )


    const participantsByCategorie =
      computed(() => {

        return participants.value.reduce(
          (
            accumulator,
            participant
          ) => {

            const categorie =
              participant.categorie ||
              "Autre"


            if (
              !accumulator[
                categorie
              ]
            ) {

              accumulator[
                categorie
              ] = []

            }


            accumulator[
              categorie
            ].push(
              participant
            )


            return accumulator

          },
          {}
        )

      })


    // ==================================================
    // SAUVEGARDE AUTOMATIQUE
    // ==================================================

    watch(

      () => ({

        participants:
          participants.value,

        arrivals:
          arrivals.value,

        categories:
          categories.value,

        settings:
          settings.value,

        timer:
          timer.value,

        races:
          raceManager.races,

      }),


      data => {

        console.log(
          "Sauvegarde automatique",
          data
        )

        saveProject(
          data
        )

      },


      {

        deep: true,

      }

    )


    // ==================================================
    // EXPORT STORE
    // ==================================================

    return {

      // État

      participants,

      arrivals,

      categories,

      settings,

      timer,


      // Participants

      setParticipants,

      importParticipants,

      addParticipant,

      updateParticipant,

      deleteParticipant,


      // Outils participants

      generateParticipantId,

      generateNextBibNumber,

      formatBibNumber,

      bibNumberExists,

      generateQr,

      generateCategory,

      refreshCategories,

      syncRaceParticipants,


      // Arrivées

      addArrival,


      // Projet

      restoreProject,

      resetRace,


      // Getters

      participantCount,

      arrivalCount,

      presentCount,

      participantsByCategorie,

    }

  }
)