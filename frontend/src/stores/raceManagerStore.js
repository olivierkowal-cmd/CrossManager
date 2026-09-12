import { defineStore } from "pinia"
import { ref } from "vue"
import { RACES } from "../data/races"
import {
  listenRacesFirestore,
} from "../services/raceService"

export const useRaceManagerStore = defineStore(
  "raceManager",
  () => {

    // =====================================================
    // COURSES
    // =====================================================

    const races = ref(
      RACES.map((race) => ({
        id: race.id,
        categorie: race.categorie,
        label: race.label,
        status: "waiting",
        startTime: null,
        finishTime: null,
        participants: 0,
        arrivals: 0,
        results: [],
      }))
    )


    // =====================================================
    // RÉCUPÉRER UNE COURSE
    // =====================================================

    function getRace(categorie) {
      return races.value.find(
        (race) =>
          race.categorie === categorie
      )
    }


    // =====================================================
    // ÉCOUTE FIRESTORE
    // =====================================================

    function startListening() {
      return listenRacesFirestore(
        (firestoreRaces) => {

          races.value.forEach((race) => {

            const remote =
              firestoreRaces[
                race.categorie
              ]

            if (!remote) {
              return
            }


            // ---------------------------------------------
            // ÉTAT
            // ---------------------------------------------

            race.status =
              remote.status ?? "waiting"


            // ---------------------------------------------
            // DÉPART
            // ---------------------------------------------

            race.startTime =
              remote.startTime?.toMillis
                ? remote.startTime.toMillis()
                : null


            // ---------------------------------------------
            // FIN
            // ---------------------------------------------

            race.finishTime =
              remote.finishTime?.toMillis
                ? remote.finishTime.toMillis()
                : null


            // ---------------------------------------------
            // PARTICIPANTS
            // ---------------------------------------------

            race.participants =
              remote.participants ?? 0


            // ---------------------------------------------
            // ARRIVÉES
            // ---------------------------------------------

            race.arrivals =
              remote.arrivals ?? 0


            // ---------------------------------------------
            // RÉSULTATS
            // ---------------------------------------------

            race.results =
              Array.isArray(remote.results)
                ? remote.results
                : []


            console.log(
              "🏁 Course synchronisée :",
              race.categorie,
              {
                status:
                  race.status,

                participants:
                  race.participants,

                arrivals:
                  race.arrivals,

                results:
                  race.results.length,
              }
            )
          })
        }
      )
    }


    // =====================================================
    // COMPTE À REBOURS
    // =====================================================

    function startCountdown(categorie) {
      const race =
        getRace(categorie)

      if (!race) {
        return
      }

      race.status = "countdown"
    }


    // =====================================================
    // DÉMARRER UNE NOUVELLE COURSE
    // =====================================================

    function startRace(categorie) {
      const race =
        getRace(categorie)

      if (!race) {
        return
      }


      // ---------------------------------------------
      // Nouvelle course
      // ---------------------------------------------

      race.status = "running"
      race.startTime = Date.now()
      race.finishTime = null
      race.arrivals = 0
      race.results = []


      console.log(
        "🏃 Nouvelle course démarrée :",
        categorie
      )
    }


    // =====================================================
    // TERMINER UNE COURSE
    // =====================================================

    function finishRace(categorie) {
      const race =
        getRace(categorie)

      if (!race) {
        return
      }

      race.status = "finished"
      race.finishTime = Date.now()


      console.log(
        "🏁 Course terminée :",
        categorie
      )
    }


    // =====================================================
    // RÉINITIALISER UNE COURSE
    // =====================================================

    function resetRace(categorie) {
      const race =
        getRace(categorie)

      if (!race) {
        return
      }


      // ---------------------------------------------
      // IMPORTANT :
      //
      // On ne touche PAS aux participants.
      //
      // On efface uniquement l'état de la course.
      // ---------------------------------------------

      race.status = "waiting"
      race.startTime = null
      race.finishTime = null
      race.arrivals = 0
      race.results = []


      console.log(
        "🔄 Course réinitialisée :",
        categorie
      )
    }


    // =====================================================
    // RÉINITIALISER TOUTES LES COURSES
    // =====================================================

    function resetAllRaces() {

      races.value.forEach(
        (race) => {

          race.status = "waiting"
          race.startTime = null
          race.finishTime = null
          race.arrivals = 0
          race.results = []
        }
      )


      console.log(
        "🔄 Toutes les courses réinitialisées"
      )
    }


    // =====================================================
    // PARTICIPANTS
    // =====================================================

    function setParticipants(
      categorie,
      total
    ) {

      const race =
        getRace(categorie)

      if (!race) {
        return
      }

      race.participants = total
    }


    // =====================================================
    // ENREGISTRER UNE ARRIVÉE
    // =====================================================

    function registerArrival(
      participant,
      scanner = "Scanner"
    ) {

      const race =
        getRace(
          participant.categorie
        )


      // ---------------------------------------------
      // Course introuvable
      // ---------------------------------------------

      if (!race) {
        return {
          success: false,
          message:
            "Course introuvable",
        }
      }


      // =================================================
      // DOUBLON
      // =================================================
      //
      // IMPORTANT :
      // On vérifie le doublon AVANT de vérifier
      // si la course est encore en cours.
      //
      // Cela permet d'indiquer correctement
      // "Participant déjà scanné" même si la course
      // vient d'être terminée automatiquement.
      // =================================================

      const alreadyArrived =
        Array.isArray(race.results)
          ? race.results.some(
              (arrival) =>
                String(
                  arrival?.participant?.id
                ) ===
                String(
                  participant.id
                )
            )
          : false


      if (alreadyArrived) {
        return {
          success: false,
          duplicate: true,
          participant,
          message:
            "Participant déjà scanné",
        }
      }


      // =================================================
      // COURSE EN COURS
      // =================================================

      if (
        race.status !== "running"
      ) {
        return {
          success: false,
          message:
            "La course n'est pas démarrée",
        }
      }


      // =================================================
      // ARRIVÉE
      // =================================================

      const arrivalTime =
        Date.now()


      const elapsedTime =
        race.startTime
          ? arrivalTime -
            race.startTime
          : 0


      const arrival = {
        position:
          race.arrivals + 1,

        participant,

        scanner,

        arrivalTime,

        elapsedTime,
      }


      // ---------------------------------------------
      // Mise à jour locale
      // ---------------------------------------------

      race.arrivals += 1

      race.results.push(
        arrival
      )


      return {
        success: true,
        arrival,
      }
    }


    // =====================================================
    // TEMPS ÉCOULÉ
    // =====================================================

    function getElapsedTime(
      categorie
    ) {

      const race =
        getRace(categorie)


      if (!race) {
        return 0
      }


      if (!race.startTime) {
        return 0
      }


      if (
        race.status === "finished" &&
        race.finishTime
      ) {
        return (
          race.finishTime -
          race.startTime
        )
      }


      return (
        Date.now() -
        race.startTime
      )
    }


    // =====================================================
    // API
    // =====================================================

    return {
      races,
      getRace,
      startListening,
      startCountdown,
      startRace,
      finishRace,
      resetRace,
      resetAllRaces,
      setParticipants,
      registerArrival,
      getElapsedTime,
    }
  }
)