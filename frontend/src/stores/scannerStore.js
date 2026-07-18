import { defineStore } from "pinia"
import { ref, computed } from "vue"

import { useRaceStore } from "./raceStore"
import { useRaceManagerStore } from "./raceManagerStore"

import { addArrival } from "../firebase/arrivals"


export const useScannerStore = defineStore(
  "scanner",
  () => {

    // ==================================================
    // STORES
    // ==================================================

    const raceStore =
      useRaceStore()

    const raceManager =
      useRaceManagerStore()


    // ==================================================
    // ÉTAT LOCAL DU SCANNER
    // ==================================================

    const arrivals =
      ref([])

    const lastArrival =
      ref(null)


    // ==================================================
    // STATISTIQUES
    // ==================================================

    const totalScans =
      computed(
        () =>
          arrivals.value.length
      )


    // ==================================================
    // TROUVER UN PARTICIPANT
    // ==================================================

    function findParticipant(
      participantId
    ) {

      let participant =
        null


      // ----------------------------------------------
      // Recherche par QR Code CrossManager
      // Exemple : CM-0001
      // ----------------------------------------------

      if (

        typeof participantId ===
          "string" &&

        participantId
          .trim()
          .startsWith("CM-")

      ) {

        const qr =
          participantId.trim()


        participant =
          raceStore.participants.find(
            p =>
              p.qr === qr
          )

      }


      // ----------------------------------------------
      // Recherche par ID ou numéro de dossard
      // ----------------------------------------------

      else {

        const id =
          Number(
            participantId
          )


        if (
          !Number.isNaN(id)
        ) {

          participant =
            raceStore.participants.find(
              p =>

                Number(p.id) === id ||

                Number(p.dossard) === id

            )

        }

      }


      return participant

    }


    // ==================================================
    // SCANNER UN PARTICIPANT
    // ==================================================

    async function scanParticipant(
      participantId,
      scanner = "Scanner 1"
    ) {

      // ----------------------------------------------
      // 1. TROUVER LE PARTICIPANT
      // ----------------------------------------------

      const participant =
        findParticipant(
          participantId
        )


      if (
        !participant
      ) {

        return {

          success: false,

          message:
            "Participant introuvable",

        }

      }


      // ----------------------------------------------
      // 2. TROUVER LA COURSE
      // ----------------------------------------------

      const race =
        raceManager.getRace(
          participant.categorie
        )


      if (
        !race
      ) {

        return {

          success: false,

          message:
            "Course introuvable",

        }

      }


      // ----------------------------------------------
      // 3. VÉRIFIER QUE LA COURSE EST DÉMARRÉE
      // ----------------------------------------------

      if (
        race.status !==
        "running"
      ) {

        return {

          success: false,

          message:
            "La course n'est pas démarrée",

        }

      }


      // ----------------------------------------------
      // 4. VÉRIFICATION DOUBLON LOCAL
      // ----------------------------------------------

      const localDuplicate =
        arrivals.value.find(
          arrival =>

            arrival.participant?.id ===
              participant.id

        )


      if (
        localDuplicate
      ) {

        return {

          success: false,

          duplicate: true,

          participant,

          arrival:
            localDuplicate,

          message:
            "Participant déjà scanné",

        }

      }


      // ----------------------------------------------
      // 5. CALCULER L'HEURE D'ARRIVÉE
      // ----------------------------------------------

      const arrivalTime =
        Date.now()


      const elapsedTime =

        arrivalTime -

        race.startTime


      // ----------------------------------------------
      // 6. RÉCUPÉRER LA SESSION ACTIVE
      // ----------------------------------------------

      const sessionId =
        raceStore.settings.sessionId ||
        "cross-2026"


      // ----------------------------------------------
      // 7. PRÉPARER L'ARRIVÉE FIREBASE
      // ----------------------------------------------

      const firebaseArrival = {

        sessionId:
          sessionId,

        participantId:
          participant.id,

        dossard:
          participant.dossard ??
          "",

        nom:
          participant.nom ??
          "",

        prenom:
          participant.prenom ??
          "",

        categorie:
          participant.categorie ??
          "",

        scanner:
          scanner,

        arrivalTime:
          arrivalTime,

        elapsedTime:
          elapsedTime,

      }


      // ----------------------------------------------
      // 8. FIREBASE VALIDE L'ARRIVÉE
      // ----------------------------------------------

      let firebaseResult


      try {

        firebaseResult =
          await addArrival(
            firebaseArrival
          )

      }

      catch (
        error
      ) {

        console.error(
          "Erreur Firebase pendant le scan :",
          error
        )


        return {

          success: false,

          firebaseError: true,

          participant,

          message:
            "Impossible d'enregistrer l'arrivée sur Firebase",

        }

      }


      // ----------------------------------------------
      // 9. DOUBLON DÉTECTÉ PAR FIREBASE
      // ----------------------------------------------

      if (
        firebaseResult?.duplicate
      ) {

        console.warn(
          "⚠️ Arrivée déjà enregistrée sur Firebase :",
          participant.prenom,
          participant.nom
        )


        return {

          success: false,

          duplicate: true,

          participant,

          arrival:
            firebaseResult.arrival,

          message:
            "Participant déjà scanné",

        }

      }


      // ----------------------------------------------
      // 10. FIREBASE A ACCEPTÉ L'ARRIVÉE
      // ----------------------------------------------

      if (
        !firebaseResult?.success
      ) {

        return {

          success: false,

          participant,

          message:
            "L'arrivée n'a pas pu être validée",

        }

      }


      // ----------------------------------------------
      // 11. ENREGISTREMENT DANS RACEMANAGER
      // ----------------------------------------------

      const result =
        raceManager.registerArrival(
          participant,
          scanner
        )


      if (
        !result.success
      ) {

        console.error(
          "L'arrivée Firebase a été créée mais RaceManager a refusé l'arrivée :",
          result
        )


        return result

      }


      // ----------------------------------------------
      // 12. AJOUT LOCAL
      // ----------------------------------------------

      arrivals.value.push(
        result.arrival
      )


      lastArrival.value =
        result.arrival


      console.log(
        "🔥 Arrivée validée par Firebase :",
        participant.prenom,
        participant.nom,
        "Session :",
        sessionId
      )


      // ----------------------------------------------
      // 13. RETOUR DU RÉSULTAT
      // ----------------------------------------------

      return {

        success: true,

        participant,

        arrival:
          result.arrival,

        firebaseId:
          firebaseResult.id,

      }

    }


    // ==================================================
    // RÉINITIALISER LE SCANNER LOCAL
    // ==================================================

    function resetScanner() {

      arrivals.value =
        []

      lastArrival.value =
        null

    }


    // ==================================================
    // RETURN
    // ==================================================

    return {

      arrivals,

      lastArrival,

      totalScans,

      scanParticipant,

      resetScanner,

    }

  }
)