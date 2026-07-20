import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  getDocs,
  writeBatch,
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

          const snapshot =
            await transaction.get(
              arrivalRef
            )


          // ==================================================
          // DOUBLON FIREBASE
          // ==================================================

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
          // CRÉER ARRIVÉE
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


  if (
    createdAt &&
    typeof createdAt.toMillis ===
      "function"
  ) {

    return createdAt.toMillis()

  }


  if (
    createdAt?.seconds
  ) {

    return (
      createdAt.seconds *
      1000
    )

  }


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


  // Pas de orderBy ici.
  // Le tri est effectué en JavaScript
  // pour éviter un index composite Firestore.

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

      const arrivals =
        snapshot.docs.map(
          document => ({

            id:
              document.id,

            ...document.data(),

          })
        )


      arrivals.sort(
        (a, b) =>

          getCreatedAtTime(a) -

          getCreatedAtTime(b)

      )


      console.log(
        "🏁 Arrivées reçues depuis Firebase :",
        arrivals.length
      )


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


// ==================================================
// SUPPRIMER LES ARRIVÉES D'UNE COURSE
// ==================================================

export async function deleteArrivalsByRace(
  sessionId,
  categorie
) {

  if (
    !sessionId ||
    !categorie
  ) {

    return {

      success: false,

      count: 0,

      message:
        "Session ou catégorie manquante",

    }

  }


  console.log(
    "🗑️ Suppression des arrivées :",
    sessionId,
    categorie
  )


  // ==================================================
  // RECHERCHE
  //
  // On filtre uniquement sur sessionId.
  // Puis on filtre la catégorie en JavaScript.
  //
  // Cela évite de nécessiter un index composite
  // Firestore pour sessionId + categorie.
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


  const snapshot =
    await getDocs(
      q
    )


  const documentsToDelete =
    snapshot.docs.filter(
      document =>

        document.data()
          ?.categorie ===
        categorie

    )


  if (
    documentsToDelete.length ===
    0
  ) {

    console.log(
      "ℹ️ Aucune arrivée à supprimer pour :",
      categorie
    )


    return {

      success: true,

      count: 0,

    }

  }


  // ==================================================
  // SUPPRESSION PAR LOTS
  // ==================================================

  const batchSize =
    450


  let deletedCount =
    0


  for (

    let index = 0;

    index <
      documentsToDelete.length;

    index += batchSize

  ) {

    const batch =
      writeBatch(
        db
      )


    const chunk =
      documentsToDelete.slice(

        index,

        index +
          batchSize

      )


    chunk.forEach(
      document => {

        batch.delete(
          document.ref
        )

      }
    )


    await batch.commit()


    deletedCount +=
      chunk.length

  }


  console.log(
    "✅ Arrivées supprimées pour",
    categorie,
    ":",
    deletedCount
  )


  return {

    success: true,

    count:
      deletedCount,

  }

}
