import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
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


  // Exemple :
  // cross-2026_1F_125

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

          // ------------------------------------------
          // Vérifier si l'arrivée existe déjà
          // ------------------------------------------

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


          // ------------------------------------------
          // Créer l'arrivée
          // ------------------------------------------

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
      "Erreur ajout arrivée Firebase :",
      error
    )


    throw error

  }

}


// ==================================================
// ÉCOUTER LES ARRIVÉES D'UNE SESSION EN TEMPS RÉEL
// ==================================================

export function listenArrivals(
  sessionId,
  callback
) {

  if (
    !sessionId
  ) {

    console.error(
      "Impossible d'écouter les arrivées : sessionId manquant"
    )


    return () => {}

  }


  const q =
    query(

      arrivalsCollection,

      where(
        "sessionId",
        "==",
        sessionId
      ),

      orderBy(
        "createdAt",
        "asc"
      )

    )


  return onSnapshot(

    q,

    snapshot => {

      const arrivals =
        snapshot.docs.map(
          document => ({

            id:
              document.id,

            ...document.data(),

          })
        )


      callback(
        arrivals
      )

    },

    error => {

      console.error(
        "Erreur écoute arrivées Firebase :",
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