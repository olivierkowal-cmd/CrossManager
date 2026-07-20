import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  runTransaction,
} from "firebase/firestore"

import { db } from "./firebase"


// ==================================================
// COLLECTION ARRIVALS
// ==================================================

const arrivalsCollection =
  collection(
    db,
    "arrivals"
  )


// ==================================================
// NETTOYER UNE VALEUR POUR UN ID FIRESTORE
// ==================================================

function cleanIdValue(
  value,
  fallback = ""
) {

  return String(
    value ?? fallback
  )
    .trim()
    .replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    )

}


// ==================================================
// CRÉER UN IDENTIFIANT UNIQUE
// ==================================================

function createArrivalId(
  arrival
) {

  const sessionId =
    cleanIdValue(
      arrival.sessionId,
      "default-session"
    )


  const categorie =
    cleanIdValue(
      arrival.categorie,
      "course"
    )


  const participantId =
    cleanIdValue(
      arrival.participantId ??
      arrival.dossard
    )


  if (
    !participantId
  ) {

    throw new Error(
      "Participant invalide"
    )

  }


  return (
    `${sessionId}_${categorie}_${participantId}`
  )

}


// ==================================================
// AJOUTER UNE ARRIVÉE
// ==================================================

export async function addArrival(
  arrival
) {

  if (
    !arrival.sessionId
  ) {

    throw new Error(
      "Session ID manquant"
    )

  }


  const arrivalId =
    createArrivalId(
      arrival
    )


  const arrivalRef =
    doc(
      arrivalsCollection,
      arrivalId
    )


  try {

    const result =
      await runTransaction(

        db,

        async (
          transaction
        ) => {

          // ==================================================
          // VÉRIFIER SI L'ARRIVÉE EXISTE DÉJÀ
          // ==================================================

          const snapshot =
            await transaction.get(
              arrivalRef
            )


          if (
            snapshot.exists()
          ) {

            return {

              success: false,

              duplicate: true,

              id:
                snapshot.id,

              arrival:
                snapshot.data(),

            }

          }


          // ==================================================
          // CRÉER L'ARRIVÉE
          // ==================================================

          transaction.set(

            arrivalRef,

            {

              ...arrival,

              createdAt:
                serverTimestamp(),

            }

          )


          return {

            success: true,

            duplicate: false,

            id:
              arrivalId,

          }

        }

      )


    return result

  }

  catch (
    error
  ) {

    console.error(
      "❌ Erreur ajout arrivée Firebase :",
      error
    )


    throw error

  }

}


// ==================================================
// CONVERTIR CREATEDAT EN MILLISECONDES
// ==================================================

function getCreatedAtTime(
  arrival
) {

  const createdAt =
    arrival.createdAt


  // Timestamp Firestore

  if (
    createdAt &&
    typeof createdAt.toMillis ===
      "function"
  ) {

    return createdAt.toMillis()

  }


  // Objet Timestamp sérialisé

  if (
    createdAt?.seconds
  ) {

    return (
      createdAt.seconds *
      1000
    )

  }


  // Utiliser arrivalTime
  // si createdAt n'est pas encore disponible

  if (
    arrival.arrivalTime
  ) {

    return Number(
      arrival.arrivalTime
    )

  }


  return 0

}


// ==================================================
// ÉCOUTER LES ARRIVÉES D'UNE SESSION
// EN TEMPS RÉEL
// ==================================================

export function listenArrivals(
  sessionId,
  callback
) {

  if (
    !sessionId
  ) {

    console.error(
      "❌ Impossible d'écouter les arrivées : sessionId manquant"
    )


    return () => {}

  }


  console.log(
    "👂 Écoute des arrivées Firebase pour la session :",
    sessionId
  )


  // ==================================================
  // IMPORTANT
  //
  // On utilise uniquement WHERE.
  //
  // On ne met PAS orderBy("createdAt")
  // afin d'éviter l'index composite Firestore.
  //
  // Le tri est effectué ensuite en JavaScript.
  // ==================================================

  const q =
    query(

      arrivalsCollection,

      where(
        "sessionId",
        "==",
        sessionId
      )

    )


  return onSnapshot(

    q,

    snapshot => {

      // ==================================================
      // CONVERTIR LES DOCUMENTS FIREBASE
      // ==================================================

      const arrivals =
        snapshot.docs.map(
          document => ({

            id:
              document.id,

            ...document.data(),

          })
        )


      // ==================================================
      // TRIER LES ARRIVÉES
      // ==================================================

      arrivals.sort(
        (a, b) => {

          return (
            getCreatedAtTime(a) -
            getCreatedAtTime(b)
          )

        }
      )


      console.log(
        "🏁 Arrivées reçues depuis Firebase :",
        arrivals.length
      )


      // ==================================================
      // ENVOYER VERS FIREBASESTORE
      // ==================================================

      callback(
        arrivals
      )

    },


    error => {

      console.error(
        "❌ Erreur écoute arrivées Firebase :",
        error
      )

    }

  )

}


// ==================================================
// SUPPRIMER UNE ARRIVÉE
// ==================================================

export async function deleteArrival(
  id
) {

  await deleteDoc(

    doc(
      db,
      "arrivals",
      id
    )

  )

}