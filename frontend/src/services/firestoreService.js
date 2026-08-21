import {
  collection,
  onSnapshot,
} from "firebase/firestore"

import { db } from "../firebase/config"


// =====================================================
// ÉCOUTER LES SCANNERS
// =====================================================
//
// Un scanner est considéré comme connecté uniquement si
// son dernier heartbeat date de moins de 10 secondes.
//
// Cela permet de détecter un téléphone fermé brutalement,
// même si Firestore contient encore connected: true.
// =====================================================

export function listenScanners(callback) {

  let scannersData = {}

  let unsubscribeFirestore = null

  let heartbeatTimer = null


  // -----------------------------------------------------
  // Vérifier l'état réel des scanners
  // -----------------------------------------------------

  function updateScannerConnectionStatus() {

    const now = Date.now()

    const scanners = {}


    Object.entries(scannersData).forEach(
      ([id, data]) => {

        let heartbeatTime = null


        // -----------------------------------------------
        // Récupération du timestamp Firestore
        // -----------------------------------------------

        if (
          data?.heartbeat &&
          typeof data.heartbeat.toMillis === "function"
        ) {

          heartbeatTime =
            data.heartbeat.toMillis()

        }

        else if (
          data?.heartbeat instanceof Date
        ) {

          heartbeatTime =
            data.heartbeat.getTime()

        }

        else if (
          typeof data?.heartbeat === "number"
        ) {

          heartbeatTime =
            data.heartbeat

        }


        // -----------------------------------------------
        // Scanner considéré connecté si heartbeat récent
        // -----------------------------------------------

        const isConnected =
          heartbeatTime !== null &&
          now - heartbeatTime <= 10000


        scanners[id] = {

          ...data,

          connected:
            isConnected,

        }

      }
    )


    callback(scanners)

  }


  // -----------------------------------------------------
  // Écoute Firestore
  // -----------------------------------------------------

  unsubscribeFirestore = onSnapshot(

    collection(db, "scanners"),

    (snapshot) => {

      const newData = {}


      snapshot.forEach((scannerDoc) => {

        newData[scannerDoc.id] =
          scannerDoc.data()

      })


      scannersData = newData


      // Mise à jour immédiate

      updateScannerConnectionStatus()

    },


    (error) => {

      console.error(
        "Erreur Firestore (scanners) :",
        error
      )

    }

  )


  // -----------------------------------------------------
  // Vérification régulière
  // -----------------------------------------------------
  //
  // Important :
  // Firestore ne génère pas forcément un nouvel événement
  // lorsque les 10 secondes sont simplement dépassées.
  //
  // On vérifie donc toutes les 2 secondes.
  // -----------------------------------------------------

  heartbeatTimer = setInterval(

    () => {

      updateScannerConnectionStatus()

    },

    2000

  )


  // -----------------------------------------------------
  // Fonction de nettoyage
  // -----------------------------------------------------

  return () => {

    if (unsubscribeFirestore) {

      unsubscribeFirestore()

    }


    if (heartbeatTimer) {

      clearInterval(
        heartbeatTimer
      )

      heartbeatTimer = null

    }

  }

}


// =====================================================
// ÉCOUTER LES COURSES
// =====================================================

export function listenRaces(callback) {

  return onSnapshot(

    collection(db, "races"),

    (snapshot) => {

      const races = {}


      snapshot.forEach((doc) => {

        races[doc.id] =
          doc.data()

      })


      callback(races)

    },

    (error) => {

      console.error(
        "Erreur Firestore (races) :",
        error
      )

    }

  )

}