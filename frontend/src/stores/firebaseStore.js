import { defineStore } from "pinia"
import { ref } from "vue"

import {
  addArrival,
  listenArrivals,
} from "../firebase/arrivals"

import {
  loadParticipants,
} from "../firebase/participants"

import {
  loadRaces,
  listenRaces,
} from "../firebase/races"

import {
  listenScanners,
  updateScannerStatus,
} from "../firebase/scanners"

import {
  useRaceManagerStore,
} from "./raceManagerStore"

import {
  useRaceStore,
} from "./raceStore"


export const useFirebaseStore =
  defineStore(
    "firebase",
    () => {

      // ==================================================
      // STORES
      // ==================================================

      const raceManager =
        useRaceManagerStore()

      const raceStore =
        useRaceStore()


      // ==================================================
      // ÉTAT FIREBASE
      // ==================================================

      const connected =
        ref(false)

      const loading =
        ref(false)

      const error =
        ref(null)


      // ==================================================
      // DONNÉES FIREBASE
      // ==================================================

      const arrivals =
        ref([])

      const participants =
        ref([])

      const races =
        ref([])

      const scanners =
        ref([])


      // ==================================================
      // LISTENERS FIREBASE
      // ==================================================

      let unsubscribeArrivals =
        null

      let unsubscribeRaces =
        null

      let unsubscribeScanners =
        null


      // ==================================================
      // CONNEXION FIREBASE
      // ==================================================

      async function connect() {

        if (
          connected.value ||
          loading.value
        ) {

          return

        }


        loading.value =
          true

        error.value =
          null


        try {

          // ==================================================
          // SESSION ACTIVE
          // ==================================================

          const sessionId =
            raceStore.settings.sessionId ||
            "cross-2026"


          console.log(
            "📅 Session Firebase active :",
            sessionId
          )


          // ==================================================
          // CHARGEMENT DES PARTICIPANTS FIREBASE
          // ==================================================

          console.log(
            "🔵 Début chargement participants Firebase"
          )


          participants.value =
            await loadParticipants()


          console.log(
            "🟢 Participants reçus depuis Firebase :",
            participants.value.length,
            participants.value
          )


          // ==================================================
          // SYNCHRONISER LES PARTICIPANTS
          // AVEC RACESTORE
          // ==================================================

          raceStore.setParticipants(
            participants.value
          )


          console.log(
            "👥 Participants présents dans RaceStore :",
            raceStore.participants.length
          )


          // ==================================================
          // CHARGEMENT INITIAL DES COURSES
          // ==================================================

          races.value =
            await loadRaces()


          console.log(
            "🏃 Courses Firebase chargées :",
            races.value.length
          )


          // Appliquer les courses Firebase
          // dans RaceManager

          raceManager
            .applyFirebaseRaces(
              races.value
            )


          // ==================================================
          // ÉCOUTE DES ARRIVÉES
          // DE LA SESSION ACTIVE
          // ==================================================

          unsubscribeArrivals =
            listenArrivals(

              sessionId,

              data => {

                // Stocker les arrivées Firebase

                arrivals.value =
                  data


                // Reconstruire les résultats
                // officiels dans RaceManager

                raceManager
                  .applyFirebaseArrivals(
                    data
                  )


                console.log(
                  "🏁 Arrivées Firebase synchronisées :",
                  data.length,
                  "Session :",
                  sessionId
                )

              }

            )


          // ==================================================
          // ÉCOUTE DES COURSES EN TEMPS RÉEL
          // ==================================================

          unsubscribeRaces =
            listenRaces(

              data => {

                // Stocker les courses Firebase

                races.value =
                  data


                // Appliquer les courses
                // dans RaceManager

                raceManager
                  .applyFirebaseRaces(
                    data
                  )


                console.log(
                  "🏃 Courses Firebase synchronisées :",
                  data.length
                )

              }

            )


          // ==================================================
          // ÉCOUTE DES SCANNERS EN TEMPS RÉEL
          // ==================================================

          unsubscribeScanners =
            listenScanners(

              data => {

                scanners.value =
                  data


                console.log(
                  "📱 Scanners Firebase synchronisés :",
                  data.length
                )

              }

            )


          // ==================================================
          // CONNEXION RÉUSSIE
          // ==================================================

          connected.value =
            true


          console.log(
            "🔥 Firebase connecté avec succès"
          )

        }


        catch (
          err
        ) {

          console.error(
            "❌ Erreur connexion Firebase :",
            err
          )


          error.value =
            err


          // Nettoyer les listeners
          // éventuellement déjà ouverts

          disconnect()

        }


        finally {

          loading.value =
            false

        }

      }


      // ==================================================
      // DÉCONNEXION FIREBASE
      // ==================================================

      function disconnect() {

        // ==================================================
        // ARRIVÉES
        // ==================================================

        if (
          unsubscribeArrivals
        ) {

          unsubscribeArrivals()


          unsubscribeArrivals =
            null

        }


        // ==================================================
        // COURSES
        // ==================================================

        if (
          unsubscribeRaces
        ) {

          unsubscribeRaces()


          unsubscribeRaces =
            null

        }


        // ==================================================
        // SCANNERS
        // ==================================================

        if (
          unsubscribeScanners
        ) {

          unsubscribeScanners()


          unsubscribeScanners =
            null

        }


        connected.value =
          false


        console.log(
          "Firebase déconnecté"
        )

      }


      // ==================================================
      // ENVOYER UNE ARRIVÉE
      // ==================================================

      async function sendArrival(
        arrival
      ) {

        if (
          !connected.value
        ) {

          console.warn(
            "Firebase non connecté : arrivée non envoyée."
          )


          return {

            success: false,

            message:
              "Firebase non connecté",

          }

        }


        try {

          // Ajouter automatiquement
          // la session active

          const arrivalWithSession = {

            ...arrival,

            sessionId:
              arrival.sessionId ||
              raceStore.settings.sessionId ||
              "cross-2026",

          }


          const result =
            await addArrival(
              arrivalWithSession
            )


          return result

        }


        catch (
          err
        ) {

          console.error(
            "Erreur envoi arrivée Firebase :",
            err
          )


          error.value =
            err


          return {

            success: false,

            message:
              "Impossible d'envoyer l'arrivée à Firebase.",

          }

        }

      }


      // ==================================================
      // METTRE À JOUR UN SCANNER
      // ==================================================

      async function updateScanner(
        scannerId,
        status
      ) {

        if (
          !connected.value
        ) {

          console.warn(
            "Firebase non connecté : scanner non mis à jour."
          )


          return {

            success: false,

          }

        }


        try {

          await updateScannerStatus(
            scannerId,
            status
          )


          return {

            success: true,

          }

        }


        catch (
          err
        ) {

          console.error(
            "Erreur mise à jour scanner Firebase :",
            err
          )


          error.value =
            err


          return {

            success: false,

          }

        }

      }


      // ==================================================
      // RETURN
      // ==================================================

      return {

        // État

        connected,

        loading,

        error,


        // Données

        arrivals,

        participants,

        races,

        scanners,


        // Actions

        connect,

        disconnect,

        sendArrival,

        updateScanner,

      }

    }
  )