import { defineStore } from "pinia"
import { ref } from "vue"

import { RACES } from "../data/races"
import { loadProject } from "../services/autoSave.js"

import { saveRace } from "../firebase/races"

import {
  deleteArrivalsByRace,
} from "../firebase/arrivals"


export const useRaceManagerStore = defineStore(
  "raceManager",
  () => {

    // ==================================================
    // COURSES
    // ==================================================

    const races = ref(
      RACES.map((race) => ({

        id:
          race.id,

        categorie:
          race.categorie,

        label:
          race.label,

        // waiting | countdown | running | finished
        status:
          "waiting",

        startTime:
          null,

        finishTime:
          null,

        participants:
          0,

        arrivals:
          0,

        results:
          [],

      }))
    )


    // ==================================================
    // RESTAURATION DE LA SAUVEGARDE LOCALE
    // ==================================================

    const backup =
      loadProject()


    if (
      Array.isArray(
        backup?.data?.races
      )
    ) {

      const savedByCategory =
        new Map(

          backup.data.races.map(
            race => [

              race.categorie,

              race,

            ]
          )

        )


      races.value =
        races.value.map(
          defaultRace => {

            const saved =
              savedByCategory.get(
                defaultRace.categorie
              )


            if (
              !saved
            ) {

              return defaultRace

            }


            return {

              ...defaultRace,

              ...saved,

              results:
                Array.isArray(
                  saved.results
                )
                  ? saved.results
                  : [],

              arrivals:
                Number(
                  saved.arrivals ??
                  0
                ),

              participants:
                Number(
                  saved.participants ??
                  0
                ),

            }

          }
        )

    }


    // ==================================================
    // TROUVER UNE COURSE
    // ==================================================

    function getRace(
      categorie
    ) {

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
    // SYNCHRONISER UNE COURSE VERS FIREBASE
    // ==================================================

    async function syncRaceToFirebase(
      race
    ) {

      if (
        !race
      ) {

        return {

          success:
            false,

          message:
            "Course introuvable",

        }

      }


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
            Number(
              race.participants ??
              0
            ),

          arrivals:
            Number(
              race.arrivals ??
              0
            ),

        })


        console.log(

          "🔥 Course synchronisée :",

          race.categorie,

          race.status,

          `${race.arrivals}/${race.participants}`

        )


        return {

          success:
            true,

        }

      }

      catch (
        error
      ) {

        console.error(

          "❌ Erreur synchronisation course Firebase :",

          error

        )


        return {

          success:
            false,

          error,

        }

      }

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
        Math.max(

          0,

          Number(
            total
          ) || 0

        )

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

          success:
            false,

          message:
            "Course introuvable",

        }

      }


      // Une course terminée doit obligatoirement
      // être réinitialisée avant un nouveau départ.

      if (
        race.status ===
        "finished"
      ) {

        return {

          success:
            false,

          message:
            "Réinitialisez la course avant de la redémarrer",

        }

      }


      race.status =
        "countdown"


      race.finishTime =
        null


      const firebaseResult =
        await syncRaceToFirebase(
          race
        )


      return {

        success:
          true,

        race,

        firebaseSynced:
          firebaseResult.success,

      }

    }


    // ==================================================
    // DÉMARRER LA COURSE
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

          success:
            false,

          message:
            "Course introuvable",

        }

      }


      // Protection :
      // une course terminée ne peut pas
      // revenir directement à running.

      if (
        race.status ===
        "finished"
      ) {

        return {

          success:
            false,

          message:
            "Réinitialisez la course avant de la redémarrer",

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

        success:
          true,

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

          success:
            false,

          message:
            "Course introuvable",

        }

      }


      // Déjà terminée :
      // ne pas recréer un nouveau finishTime.

      if (
        race.status ===
        "finished"
      ) {

        return {

          success:
            true,

          race,

          alreadyFinished:
            true,

        }

      }


      // IMPORTANT :
      // on modifie immédiatement l'état local.
      //
      // L'interface ordinateur/TV voit donc
      // directement "Course terminée".

      race.status =
        "finished"


      race.finishTime =
        Date.now()


      const firebaseResult =
        await syncRaceToFirebase(
          race
        )


      console.log(

        "🏁 Course terminée :",

        categorie,

        `${race.arrivals}/${race.participants}`

      )


      return {

        success:
          true,

        race,

        firebaseSynced:
          firebaseResult.success,

      }

    }


    // ==================================================
    // RÉINITIALISER UNE COURSE
    // ==================================================

    async function resetRace(
      categorie,
      sessionId = "cross-2026"
    ) {

      const race =
        getRace(
          categorie
        )


      if (
        !race
      ) {

        return {

          success:
            false,

          message:
            "Course introuvable",

        }

      }


      console.log(

        "🔄 Réinitialisation :",

        categorie,

        "| Session :",

        sessionId

      )


      try {

        // ==============================================
        // 1. SUPPRIMER LES ARRIVÉES FIREBASE
        // ==============================================
        //
        // On fait cette opération AVANT de remettre
        // la course à waiting.
        //
        // Sinon le listener Firebase pourrait récupérer
        // les anciennes arrivées et remettre immédiatement
        // le compteur.

        const deleteResult =
          await deleteArrivalsByRace(

            sessionId,

            categorie

          )


        if (
          !deleteResult?.success
        ) {

          console.error(

            "❌ Suppression des arrivées impossible :",

            deleteResult

          )


          return {

            success:
              false,

            message:

              deleteResult?.message ||

              "Impossible de supprimer les arrivées",

          }

        }


        console.log(

          "🗑️ Arrivées Firebase supprimées :",

          deleteResult.count

        )


        // ==============================================
        // 2. REMETTRE LA COURSE LOCALE À ZÉRO
        // ==============================================

        race.status =
          "waiting"


        race.startTime =
          null


        race.finishTime =
          null


        race.arrivals =
          0


        race.results =
          []


        // IMPORTANT :
        //
        // race.participants n'est PAS remis à zéro.
        //
        // Le nombre d'élèves de la catégorie reste donc
        // disponible pour le prochain départ.


        // ==============================================
        // 3. SYNCHRONISER WAITING VERS FIREBASE
        // ==============================================

        const firebaseResult =
          await syncRaceToFirebase(
            race
          )


        console.log(

          "✅ Course réinitialisée :",

          categorie,

          "| arrivées supprimées :",

          deleteResult.count

        )


        return {

          success:
            true,

          race,

          deletedArrivals:
            deleteResult.count,

          firebaseSynced:
            firebaseResult.success,

        }

      }

      catch (
        error
      ) {

        console.error(

          "❌ Erreur réinitialisation course :",

          error

        )


        return {

          success:
            false,

          error,

          message:
            "Impossible de réinitialiser la course",

        }

      }

    }
        // ==================================================
    // RÉINITIALISER TOUTES LES COURSES
    // ==================================================

    async function resetAllRaces(
      sessionId = "cross-2026"
    ) {

      const results =
        []


      // Réinitialisation volontairement séquentielle.
      //
      // Cela évite d'envoyer énormément de suppressions
      // Firestore simultanément.

      for (
        const race of races.value
      ) {

        const result =
          await resetRace(

            race.categorie,

            sessionId

          )


        results.push(
          result
        )

      }


      return {

        success:
          results.every(
            result =>
              result?.success
          ),

        results,

      }

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
          participant?.categorie
        )


      if (
        !race
      ) {

        return {

          success:
            false,

          message:
            "Course introuvable",

        }

      }


      // ==================================================
      // LA COURSE DOIT ÊTRE EN COURS
      // ==================================================

      if (
        race.status !==
        "running"
      ) {

        return {

          success:
            false,

          message:
            "La course n'est pas démarrée",

        }

      }


      // ==================================================
      // VÉRIFICATION DOUBLON LOCAL
      // ==================================================

      const existingArrival =
        race.results.find(
          result =>

            String(
              result.participant?.id
            ) ===

            String(
              participant.id
            )
        )


      if (
        existingArrival
      ) {

        return {

          success:
            false,

          duplicate:
            true,

          participant,

          arrival:
            existingArrival,

          message:
            "Participant déjà enregistré",

        }

      }


      // ==================================================
      // CALCUL DE L'HEURE D'ARRIVÉE
      // ==================================================

      const arrivalTime =
        Date.now()


      // ==================================================
      // CALCUL DU TEMPS DE COURSE
      // ==================================================

      const elapsedTime =

        race.startTime

          ? arrivalTime -
            Number(
              race.startTime
            )

          : 0


      // ==================================================
      // CRÉER L'ARRIVÉE
      // ==================================================

      const arrival = {

        position:
          race.results.length +
          1,

        participant,

        scanner,

        arrivalTime,

        elapsedTime,

      }


      // ==================================================
      // AJOUTER LE RÉSULTAT
      // ==================================================

      race.results.push(
        arrival
      )


      // IMPORTANT :
      //
      // On recalcule arrivals depuis results
      // au lieu de faire race.arrivals++.
      //
      // Cela évite les incohérences de compteur.

      race.arrivals =
        race.results.length


      console.log(

        "🏃 Arrivée locale :",

        participant.prenom,

        participant.nom,

        "|",

        race.categorie,

        "|",

        `${race.arrivals}/${race.participants}`

      )


      // ==================================================
      // FIN AUTOMATIQUE LOCALE
      // ==================================================

      if (

        race.participants >
          0 &&

        race.arrivals >=
          race.participants

      ) {

        // IMPORTANT :
        //
        // On ne se contente PAS d'appeler finishRace()
        // sans attendre.
        //
        // On change immédiatement le statut local.
        //
        // Ainsi RaceCard, l'écran TV et les autres
        // composants voient immédiatement "finished".

        race.status =
          "finished"


        race.finishTime =
          Date.now()


        console.log(

          "🏁 FIN AUTOMATIQUE LOCALE :",

          race.categorie,

          `${race.arrivals}/${race.participants}`

        )


        // Synchronisation Firebase en arrière-plan.

        void syncRaceToFirebase(
          race
        )

      }


      return {

        success:
          true,

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
        !race?.startTime
      ) {

        return 0

      }


      // ==================================================
      // COURSE TERMINÉE
      // ==================================================

      if (

        race.status ===
          "finished" &&

        race.finishTime

      ) {

        return (

          Number(
            race.finishTime
          ) -

          Number(
            race.startTime
          )

        )

      }


      // ==================================================
      // COURSE EN COURS
      // ==================================================

      return (

        Date.now() -

        Number(
          race.startTime
        )

      )

    }


    // ==================================================
    // APPLIQUER UNE COURSE REÇUE DE FIREBASE
    // ==================================================

    function applyFirebaseRace(
      firebaseRace
    ) {

      if (
        !firebaseRace?.categorie
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

        console.warn(

          "⚠️ Course Firebase inconnue :",

          firebaseRace.categorie

        )


        return

      }


      const incomingStatus =
        firebaseRace.status


      // ==================================================
      // PROTECTION CONTRE UN ANCIEN SNAPSHOT FIREBASE
      // ==================================================
      //
      // PROBLÈME CORRIGÉ :
      //
      // 1. dernier participant scanné
      // 2. course passe à finished
      // 3. un ancien snapshot "running" arrive
      // 4. l'ancienne version remettait la course à running
      //
      // Maintenant :
      //
      // finished -> running     INTERDIT
      // finished -> countdown   INTERDIT
      // finished -> waiting     AUTORISÉ
      //
      // Le passage vers waiting correspond à un vrai RESET.


      const staleRunningState =

        race.status ===
          "finished" &&

        (
          incomingStatus ===
            "running" ||

          incomingStatus ===
            "countdown"
        )


      if (
        incomingStatus !==
          undefined &&

        !staleRunningState
      ) {

        race.status =
          incomingStatus

      }


      if (
        staleRunningState
      ) {

        console.warn(

          "🛡️ Ancien état Firebase ignoré :",

          race.categorie,

          incomingStatus,

          "car la course est déjà finished"

        )

      }


      // ==================================================
      // START TIME
      // ==================================================

      if (
        firebaseRace.startTime !==
        undefined
      ) {

        // Si nous venons de refuser un ancien
        // snapshot running, nous gardons notre
        // état local actuel.

        if (
          !staleRunningState
        ) {

          race.startTime =
            firebaseRace.startTime

        }

      }


      // ==================================================
      // FINISH TIME
      // ==================================================

      if (
        firebaseRace.finishTime !==
        undefined
      ) {

        // Ne jamais effacer finishTime à cause
        // d'un ancien snapshot running.

        if (
          !staleRunningState
        ) {

          race.finishTime =
            firebaseRace.finishTime

        }

      }


      // ==================================================
      // PARTICIPANTS
      // ==================================================

      if (
        firebaseRace.participants !==
        undefined
      ) {

        race.participants =
          Math.max(

            0,

            Number(
              firebaseRace.participants
            ) || 0

          )

      }


      // ==================================================
      // IMPORTANT : ARRIVALS
      // ==================================================
      //
      // Nous ne recopions volontairement PAS ici
      // firebaseRace.arrivals.
      //
      // Le véritable nombre d'arrivées est calculé
      // depuis la collection "arrivals" dans
      // applyFirebaseArrivals().
      //
      // Cela évite qu'un ancien document de course
      // remette par exemple :
      //
      // arrivals = 1
      //
      // alors que 2 documents d'arrivée existent.

    }


    // ==================================================
    // APPLIQUER PLUSIEURS COURSES FIREBASE
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


      // ==================================================
      // FIREBASE EST LA SOURCE OFFICIELLE DES ARRIVÉES
      // ==================================================
      //
      // À chaque snapshot, on reconstruit les résultats.
      //
      // Cela permet notamment :
      //
      // - téléphone -> ordinateur
      // - plusieurs scanners
      // - suppression d'une arrivée
      // - reset
      // - reconnexion réseau


      races.value.forEach(
        race => {

          race.results =
            []


          race.arrivals =
            0

        }
      )


      // ==================================================
      // REGROUPER PAR CATÉGORIE
      // ==================================================

      const grouped =
        new Map()


      firebaseArrivals.forEach(
        arrival => {

          if (
            !arrival?.categorie
          ) {

            return

          }


          if (
            !grouped.has(
              arrival.categorie
            )
          ) {

            grouped.set(

              arrival.categorie,

              []

            )

          }


          grouped
            .get(
              arrival.categorie
            )
            .push(
              arrival
            )

        }
      )


      // ==================================================
      // RECONSTRUIRE CHAQUE COURSE
      // ==================================================

      grouped.forEach(
        (
          arrivalsList,
          categorie
        ) => {

          const race =
            getRace(
              categorie
            )


          if (
            !race
          ) {

            console.warn(

              "⚠️ Course introuvable pour les arrivées Firebase :",

              categorie

            )


            return

          }


          // ==================================================
          // TRIER PAR HEURE D'ARRIVÉE
          // ==================================================

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


                // Sécurité si deux arrivées
                // ont exactement le même timestamp.

                return String(
                  a.id ??
                  ""
                ).localeCompare(

                  String(
                    b.id ??
                    ""
                  )

                )

              }
            )


          // ==================================================
          // CONSTRUIRE LES RÉSULTATS
          // ==================================================

          race.results =
            sorted.map(
              (
                arrival,
                index
              ) => ({

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

                  classe:
                    arrival.classe ??
                    "",

                  sexe:
                    arrival.sexe ??
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

              })
            )


          // ==================================================
          // NOMBRE RÉEL D'ARRIVÉES
          // ==================================================

          race.arrivals =
            race.results.length


          console.log(

            "📡 Arrivées Firebase :",

            race.categorie,

            `${race.arrivals}/${race.participants}`,

            "| statut :",

            race.status

          )


          // ==================================================
          // FIN AUTOMATIQUE DEPUIS FIREBASE
          // ==================================================
          //
          // C'EST CETTE PARTIE QUI EST IMPORTANTE
          // POUR TON CAS.
          //
          // Lorsque le téléphone scanne :
          //
          // téléphone
          //    ↓
          // collection arrivals
          //    ↓
          // ordinateur maître
          //    ↓
          // applyFirebaseArrivals()
          //
          // Si le nombre d'arrivées atteint le nombre
          // de participants, l'ordinateur termine
          // automatiquement la course.


          if (

            race.status ===
              "running" &&

            race.participants >
              0 &&

            race.arrivals >=
              race.participants

          ) {

            // Changement IMMÉDIAT local.

            race.status =
              "finished"


            race.finishTime =
              Date.now()


            console.log(

              "🏁 FIN AUTOMATIQUE FIREBASE :",

              race.categorie,

              `${race.arrivals}/${race.participants}`

            )


            // Synchronisation du nouveau statut
            // vers tous les appareils.

            void syncRaceToFirebase(
              race
            )

          }

        }
      )

    }

        // ==================================================
    // VÉRIFIER / SÉCURISER LES FINS DE COURSE
    // ==================================================
    //
    // Cette fonction peut être appelée lorsqu'on veut
    // vérifier l'état de toutes les courses.
    //
    // Elle constitue une sécurité supplémentaire :
    //
    // participants = 2
    // arrivals = 2
    // status = running
    //
    // devient automatiquement :
    //
    // status = finished
    //
    // ==================================================

    function checkAutomaticFinishes() {

      races.value.forEach(
        race => {

          if (

            race.status ===
              "running" &&

            race.participants >
              0 &&

            race.arrivals >=
              race.participants

          ) {

            console.log(

              "🏁 Correction automatique du statut :",

              race.categorie,

              `${race.arrivals}/${race.participants}`

            )


            race.status =
              "finished"


            if (
              !race.finishTime
            ) {

              race.finishTime =
                Date.now()

            }


            void syncRaceToFirebase(
              race
            )

          }

        }
      )

    }


    // ==================================================
    // METTRE À JOUR LE NOMBRE DE PARTICIPANTS
    // ET VÉRIFIER LA FIN
    // ==================================================
    //
    // Utile lorsque les participants sont chargés
    // après les données Firebase.
    //
    // Exemple :
    //
    // Firebase a déjà envoyé 2 arrivées
    // mais participants était encore 0.
    //
    // Quand participants devient 2,
    // la course doit pouvoir passer à finished.
    //
    // ==================================================

    function updateParticipantsAndCheck(
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

        return {

          success:
            false,

          message:
            "Course introuvable",

        }

      }


      race.participants =
        Math.max(

          0,

          Number(
            total
          ) || 0

        )


      if (

        race.status ===
          "running" &&

        race.participants >
          0 &&

        race.arrivals >=
          race.participants

      ) {

        race.status =
          "finished"


        race.finishTime =
          Date.now()


        console.log(

          "🏁 Fin détectée après mise à jour participants :",

          race.categorie,

          `${race.arrivals}/${race.participants}`

        )


        void syncRaceToFirebase(
          race
        )

      }


      return {

        success:
          true,

        race,

      }

    }


    // ==================================================
    // FORCER LA COHÉRENCE DES POSITIONS
    // ==================================================

    function rebuildPositions(
      categorie
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


      race.results =
        race.results.map(
          (
            result,
            index
          ) => ({

            ...result,

            position:
              index + 1,

          })
        )


      race.arrivals =
        race.results.length

    }


    // ==================================================
    // SUPPRIMER LOCALEMENT LES RÉSULTATS D'UNE COURSE
    // ==================================================
    //
    // Cette fonction ne touche PAS Firebase.
    //
    // Le véritable reset doit toujours passer
    // par resetRace().
    //
    // ==================================================

    function clearLocalResults(
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

          success:
            false,

          message:
            "Course introuvable",

        }

      }


      race.results =
        []


      race.arrivals =
        0


      return {

        success:
          true,

        race,

      }

    }


    // ==================================================
    // OBTENIR LES RÉSULTATS D'UNE COURSE
    // ==================================================

    function getRaceResults(
      categorie
    ) {

      const race =
        getRace(
          categorie
        )


      if (
        !race
      ) {

        return []

      }


      return race.results

    }


    // ==================================================
    // OBTENIR LE NOMBRE D'ARRIVÉES
    // ==================================================

    function getArrivalCount(
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


      return race.arrivals

    }


    // ==================================================
    // SAVOIR SI UNE COURSE EST TERMINÉE
    // ==================================================

    function isRaceFinished(
      categorie
    ) {

      const race =
        getRace(
          categorie
        )


      if (
        !race
      ) {

        return false

      }


      return (
        race.status ===
        "finished"
      )

    }


    // ==================================================
    // SAVOIR SI TOUS LES PARTICIPANTS SONT ARRIVÉS
    // ==================================================

    function allParticipantsArrived(
      categorie
    ) {

      const race =
        getRace(
          categorie
        )


      if (
        !race
      ) {

        return false

      }


      if (
        race.participants <=
        0
      ) {

        return false

      }


      return (

        race.arrivals >=
        race.participants

      )

    }


    // ==================================================
    // RETOUR DU STORE
    // ==================================================

    return {

      // ================================================
      // ÉTAT
      // ================================================

      races,


      // ================================================
      // RECHERCHE DES COURSES
      // ================================================

      getRace,

      getRunningRace,

      getWaitingRaces,

      getFinishedRaces,


      // ================================================
      // GESTION DES DÉPARTS
      // ================================================

      startCountdown,

      startRace,

      finishRace,


      // ================================================
      // RÉINITIALISATION
      // ================================================

      resetRace,

      resetAllRaces,

      clearLocalResults,


      // ================================================
      // PARTICIPANTS
      // ================================================

      setParticipants,

      updateParticipantsAndCheck,


      // ================================================
      // ARRIVÉES
      // ================================================

      registerArrival,

      getRaceResults,

      getArrivalCount,

      rebuildPositions,


      // ================================================
      // CHRONOMÉTRAGE
      // ================================================

      getElapsedTime,


      // ================================================
      // FIREBASE
      // ================================================

      syncRaceToFirebase,

      applyFirebaseRace,

      applyFirebaseRaces,

      applyFirebaseArrivals,


      // ================================================
      // SÉCURITÉS
      // ================================================

      checkAutomaticFinishes,

      isRaceFinished,

      allParticipantsArrived,

    }

  }
)