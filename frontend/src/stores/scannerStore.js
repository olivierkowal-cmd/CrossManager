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
    // COMPTEURS DU SCANNER
    // ==================================================

    const duplicateCount =
  ref(0)

  const errorCount =
  ref(0)  

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

      // ==================================================
      // 1. TROUVER LE PARTICIPANT
      // ==================================================

      const participant =
        findParticipant(
          participantId
        )


      if (
        !participant
      ) {

        errorCount.value++
        return {

          success: false,

          message:
            "Participant introuvable",

        }

      }


      // ==================================================
      // 2. TROUVER LA COURSE
      // ==================================================

      const race =
        raceManager.getRace(
          participant.categorie
        )

    console.log(
  "📱 COURSE VUE PAR LE TÉLÉPHONE AU SCAN :",
  {
    participantCategorie:
      participant.categorie,

    raceFound:
      !!race,

    raceCategorie:
      race?.categorie,

    status:
      race?.status,

    startTime:
      race?.startTime,

    arrivals:
      race?.arrivals,

    participants:
      race?.participants,
  }
)

console.log(
  "📱 TOUTES LES COURSES DU RACEMANAGER :",
  raceManager.races.map(
    r => ({
      categorie: r.categorie,
      status: r.status,
      startTime: r.startTime,
      arrivals: r.arrivals,
      participants: r.participants,
    })
  )
)    

      if (
        !race
      ) {

      errorCount.value++  

        return {

          success: false,

          message:
            "Course introuvable",

        }

      }


      // ==================================================
      // 3. VÉRIFIER QUE LA COURSE EST DÉMARRÉE
      // ==================================================

      if (
        race.status !==
        "running"
      ) {

        errorCount.value++
        return {

          success: false,

          participant,

          message:
            "La course n'est pas démarrée",

        }

      }


      // ==================================================
      // IMPORTANT
      //
      // PAS DE VÉRIFICATION DE DOUBLON LOCAL
      //
      // Firebase est la source officielle.
      //
      // Cela permet :
      // - plusieurs téléphones scanners
      // - la réinitialisation des arrivées
      // - la détection globale des doublons
      // ==================================================


      // ==================================================
      // 4. CALCULER L'HEURE D'ARRIVÉE
      // ==================================================

      const arrivalTime =
        Date.now()


      const elapsedTime =

        arrivalTime -

        race.startTime


      // ==================================================
      // 5. RÉCUPÉRER LA SESSION ACTIVE
      // ==================================================

      const sessionId =
        raceStore.settings.sessionId ||
        "cross-2026"


      // ==================================================
      // 6. PRÉPARER L'ARRIVÉE FIREBASE
      // ==================================================

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

        classe:
          participant.classe ??
          "",

        sexe:
          participant.sexe ??
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


      // ==================================================
      // 7. ENVOYER L'ARRIVÉE À FIREBASE
      // ==================================================

      let firebaseResult


      try {

        console.log(
          "📤 Envoi arrivée vers Firebase :",
          firebaseArrival
        )


        firebaseResult =
          await addArrival(
            firebaseArrival
          )

      }

      catch (
        error
      ) {

        errorCount.value++

        console.error(
          "❌ Erreur Firebase pendant le scan :",
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


      // ==================================================
      // 8. DOUBLON DÉTECTÉ PAR FIREBASE
      // ==================================================

      if (
        firebaseResult?.duplicate
      ) {

        duplicateCount.value++
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


      // ==================================================
      // 9. VÉRIFIER QUE FIREBASE A ACCEPTÉ
      // ==================================================

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


      console.log(
        "🔥 Arrivée créée dans Firebase :",
        firebaseResult.id
      )


      // ==================================================
      // 10. ENREGISTREMENT LOCAL DANS RACEMANAGER
      // ==================================================

      const result =
        raceManager.registerArrival(
          participant,
          scanner
        )


      if (
        !result.success
      ) {

        console.warn(
          "⚠️ Firebase a accepté l'arrivée mais RaceManager local l'a refusée :",
          result
        )


        // L'arrivée Firebase reste officielle.
        // On ne retourne pas une erreur de scan
        // puisque Firebase a bien enregistré l'arrivée.

        return {

          success: true,

          participant,

          arrival: {
            participant,
            scanner,
            arrivalTime,
            elapsedTime,
          },

          firebaseId:
            firebaseResult.id,

        }

      }


      // ==================================================
      // 11. AJOUT DANS L'HISTORIQUE LOCAL DU TÉLÉPHONE
      // ==================================================

      arrivals.value.push(
        result.arrival
      )


      lastArrival.value =
        result.arrival


      // ==================================================
      // 12. LOG
      // ==================================================

      console.log(
        "✅ Arrivée validée :",
        participant.prenom,
        participant.nom,
        "| Course :",
        participant.categorie,
        "| Session :",
        sessionId,
        "| Firebase ID :",
        firebaseResult.id
      )


      // ==================================================
      // 13. RETOUR
      // ==================================================

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

  duplicateCount,

  errorCount,

  scanParticipant,

  resetScanner,

}

  }
)