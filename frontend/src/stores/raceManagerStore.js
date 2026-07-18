import { defineStore } from "pinia"
import { ref } from "vue"

import { RACES } from "../data/races"
import { loadProject } from "../services/autoSave.js"
import { saveRace } from "../firebase/races"


export const useRaceManagerStore = defineStore(
  "raceManager",
  () => {

    // ==================================================
    // COURSES
    // ==================================================

    const races = ref(
      RACES.map((race) => ({
        id: race.id,
        categorie: race.categorie,
        label: race.label,

        // waiting | countdown | running | finished
        status: "waiting",

        startTime: null,
        finishTime: null,

        participants: 0,
        arrivals: 0,

        results: [],
      }))
    )


    // ==================================================
    // RESTAURATION SAUVEGARDE LOCALE
    // ==================================================

    const backup = loadProject()

    if (backup?.data?.races) {

      races.value =
        backup.data.races

    }


    // ==================================================
    // TROUVER UNE COURSE
    // ==================================================

    function getRace(categorie) {

      return races.value.find(
        race =>
          race.categorie ===
          categorie
      )

    }


    // ==================================================
    // COURSE EN COURS
    // ==================================================

    function getRunningRace() {

      return races.value.find(
        race =>
          race.status ===
          "running"
      )

    }


    // ==================================================
    // COURSES EN ATTENTE
    // ==================================================

    function getWaitingRaces() {

      return races.value.filter(
        race =>
          race.status ===
          "waiting"
      )

    }


    // ==================================================
    // COURSES TERMINÉES
    // ==================================================

    function getFinishedRaces() {

      return races.value.filter(
        race =>
          race.status ===
          "finished"
      )

    }


    // ==================================================
    // SAUVEGARDE FIREBASE
    // ==================================================

    async function syncRaceToFirebase(
      race
    ) {

      try {

        await saveRace({

          id:
            race.id,

          categorie:
            race.categorie,

          label:
            race.label,

          status:
            race.status,

          startTime:
            race.startTime,

          finishTime:
            race.finishTime,

          participants:
            race.participants,

          arrivals:
            race.arrivals,

        })


        console.log(
          "🔥 Course synchronisée :",
          race.categorie,
          race.status
        )


        return {
          success: true,
        }

      }

      catch (
        error
      ) {

        console.error(
          "Erreur synchronisation course Firebase :",
          error
        )


        return {

          success: false,

          error,

        }

      }

    }


    // ==================================================
    // DÉMARRER LE COMPTE À REBOURS
    // ==================================================

    async function startCountdown(
      categorie
    ) {

      const race =
        getRace(
          categorie
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


      race.status =
        "countdown"


      await syncRaceToFirebase(
        race
      )


      return {

        success: true,

        race,

      }

    }


    // ==================================================
    // DÉMARRER UNE COURSE
    // ==================================================

    async function startRace(
      categorie
    ) {

      const race =
        getRace(
          categorie
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


      race.status =
        "running"


      race.startTime =
        Date.now()


      race.finishTime =
        null


      race.arrivals =
        0


      race.results =
        []


      const firebaseResult =
        await syncRaceToFirebase(
          race
        )


      return {

        success: true,

        race,

        firebaseSynced:
          firebaseResult.success,

      }

    }


    // ==================================================
    // TERMINER UNE COURSE
    // ==================================================

    async function finishRace(
      categorie
    ) {

      const race =
        getRace(
          categorie
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


      race.status =
        "finished"


      race.finishTime =
        Date.now()


      await syncRaceToFirebase(
        race
      )


      return {

        success: true,

        race,

      }

    }


    // ==================================================
    // RÉINITIALISER UNE COURSE
    // ==================================================

    async function resetRace(
      categorie
    ) {

      const race =
        getRace(
          categorie
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


      race.status =
        "waiting"


      race.startTime =
        null


      race.finishTime =
        null


      race.participants =
        0


      race.arrivals =
        0


      race.results =
        []


      await syncRaceToFirebase(
        race
      )


      return {

        success: true,

        race,

      }

    }


    // ==================================================
    // RÉINITIALISER TOUTES LES COURSES
    // ==================================================

    async function resetAllRaces() {

      const syncPromises =
        []


      races.value.forEach(
        race => {

          race.status =
            "waiting"


          race.startTime =
            null


          race.finishTime =
            null


          race.participants =
            0


          race.arrivals =
            0


          race.results =
            []


          syncPromises.push(

            syncRaceToFirebase(
              race
            )

          )

        }
      )


      await Promise.allSettled(
        syncPromises
      )

    }


    // ==================================================
    // NOMBRE DE PARTICIPANTS
    // ==================================================

    function setParticipants(
      categorie,
      total
    ) {

      const race =
        getRace(
          categorie
        )


      if (
        !race
      ) {

        return

      }


      race.participants =
        total

    }


    // ==================================================
    // ENREGISTRER UNE ARRIVÉE LOCALE
    // ==================================================

    function registerArrival(
      participant,
      scanner = "Scanner"
    ) {

      const race =
        getRace(
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
      // Vérification doublon local
      // ----------------------------------------------

      const existingArrival =
        race.results.find(
          result =>

            result.participant
              ?.id ===
            participant.id

        )


      if (
        existingArrival
      ) {

        return {

          success: false,

          duplicate: true,

          participant,

          arrival:
            existingArrival,

          message:
            "Participant déjà enregistré",

        }

      }


      const arrivalTime =
        Date.now()


      const elapsedTime =

        arrivalTime -

        race.startTime


      race.arrivals++


      const arrival = {

        position:
          race.arrivals,

        participant,

        scanner,

        arrivalTime,

        elapsedTime,

      }


      race.results.push(
        arrival
      )


      // ----------------------------------------------
      // Fin automatique
      // ----------------------------------------------

      if (

        race.participants > 0 &&

        race.arrivals >=
          race.participants

      ) {

        finishRace(
          race.categorie
        )

      }


      return {

        success: true,

        participant,

        arrival,

      }

    }


    // ==================================================
    // TEMPS ÉCOULÉ
    // ==================================================

    function getElapsedTime(
      categorie
    ) {

      const race =
        getRace(
          categorie
        )


      if (
        !race
      ) {

        return 0

      }


      if (
        !race.startTime
      ) {

        return 0

      }


      if (
        race.status ===
        "finished"
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


    // ==================================================
    // APPLIQUER UNE COURSE FIREBASE
    // ==================================================

    function applyFirebaseRace(
      firebaseRace
    ) {

      if (
        !firebaseRace
          ?.categorie
      ) {

        return

      }


      const race =
        getRace(
          firebaseRace.categorie
        )


      if (
        !race
      ) {

        return

      }


      if (
        firebaseRace.status !==
        undefined
      ) {

        race.status =
          firebaseRace.status

      }


      if (
        firebaseRace.startTime !==
        undefined
      ) {

        race.startTime =
          firebaseRace.startTime

      }


      if (
        firebaseRace.finishTime !==
        undefined
      ) {

        race.finishTime =
          firebaseRace.finishTime

      }


      if (
        firebaseRace.participants !==
        undefined
      ) {

        race.participants =
          firebaseRace.participants

      }


      // Important :
      // le nombre d'arrivées sera ensuite
      // recalculé depuis Firestore.

    }


    // ==================================================
    // APPLIQUER LES COURSES FIREBASE
    // ==================================================

    function applyFirebaseRaces(
      firebaseRaces
    ) {

      if (
        !Array.isArray(
          firebaseRaces
        )
      ) {

        return

      }


      firebaseRaces.forEach(
        firebaseRace => {

          applyFirebaseRace(
            firebaseRace
          )

        }
      )

    }


    // ==================================================
    // APPLIQUER LES ARRIVÉES FIREBASE
    // ==================================================

    function applyFirebaseArrivals(
      firebaseArrivals
    ) {

      if (
        !Array.isArray(
          firebaseArrivals
        )
      ) {

        return

      }


      // ----------------------------------------------
      // Réinitialiser les résultats
      // de toutes les courses.
      // ----------------------------------------------

      races.value.forEach(
        race => {

          race.results =
            []

          race.arrivals =
            0

        }
      )


      // ----------------------------------------------
      // Regrouper les arrivées
      // par catégorie/course.
      // ----------------------------------------------

      const grouped =
        {}


      firebaseArrivals.forEach(
        arrival => {

          const categorie =
            arrival.categorie


          if (
            !categorie
          ) {

            return

          }


          if (
            !grouped[categorie]
          ) {

            grouped[categorie] =
              []

          }


          grouped[categorie].push(
            arrival
          )

        }
      )


      // ----------------------------------------------
      // Reconstruire chaque classement.
      // ----------------------------------------------

      Object.entries(
        grouped
      ).forEach(
        ([
          categorie,
          arrivalsList,
        ]) => {

          const race =
            getRace(
              categorie
            )


          if (
            !race
          ) {

            console.warn(
              "Course introuvable pour les arrivées Firebase :",
              categorie
            )

            return

          }


          // ------------------------------------------
          // Trier selon l'heure réelle d'arrivée.
          // En cas d'égalité, l'ID Firestore
          // permet d'avoir un ordre stable.
          // ------------------------------------------

          const sorted =
            [
              ...arrivalsList,
            ].sort(
              (
                a,
                b
              ) => {

                const timeA =
                  Number(
                    a.arrivalTime ??
                    0
                  )


                const timeB =
                  Number(
                    b.arrivalTime ??
                    0
                  )


                if (
                  timeA !==
                  timeB
                ) {

                  return (
                    timeA -
                    timeB
                  )

                }


                return String(
                  a.id ?? ""
                )
                  .localeCompare(
                    String(
                      b.id ?? ""
                    )
                  )

              }
            )


          // ------------------------------------------
          // Transformer les données Firebase
          // vers le format utilisé par CrossManager.
          // ------------------------------------------

          race.results =
            sorted.map(
              (
                arrival,
                index
              ) => {

                return {

                  id:
                    arrival.id,

                  position:
                    index + 1,

                  participant: {

                    id:
                      arrival.participantId,

                    dossard:
                      arrival.dossard ??
                      "",

                    nom:
                      arrival.nom ??
                      "",

                    prenom:
                      arrival.prenom ??
                      "",

                    categorie:
                      arrival.categorie,

                  },

                  scanner:
                    arrival.scanner ??
                    "Scanner",

                  arrivalTime:
                    Number(
                      arrival.arrivalTime ??
                      0
                    ),

                  elapsedTime:
                    Number(
                      arrival.elapsedTime ??
                      0
                    ),

                }

              }
            )


          // ------------------------------------------
          // Nombre officiel d'arrivées.
          // ------------------------------------------

          race.arrivals =
            race.results.length

        }
      )

    }


    // ==================================================
    // RETURN
    // ==================================================

    return {

      races,


      // Recherche

      getRace,

      getRunningRace,

      getWaitingRaces,

      getFinishedRaces,


      // Gestion des courses

      startCountdown,

      startRace,

      finishRace,

      resetRace,

      resetAllRaces,

      setParticipants,


      // Arrivées

      registerArrival,


      // Chronométrage

      getElapsedTime,


      // Firebase

      syncRaceToFirebase,

      applyFirebaseRace,

      applyFirebaseRaces,

      applyFirebaseArrivals,

    }

  }
)