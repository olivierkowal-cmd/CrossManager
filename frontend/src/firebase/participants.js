import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore"

import { db } from "./firebase"


// ==================================================
// COLLECTION PARTICIPANTS
// ==================================================

const participantsCollection =
  collection(
    db,
    "participants"
  )


// ==================================================
// CHARGER LES PARTICIPANTS
// ==================================================

export async function loadParticipants() {

  const snapshot =
    await getDocs(
      participantsCollection
    )


  const participants =
    snapshot.docs.map(
      document => ({

        id:
          document.id,

        ...document.data(),

      })
    )


  console.log(
    "👥 Participants chargés depuis Firebase :",
    participants.length
  )


  return participants

}


// ==================================================
// IMPORTER LES PARTICIPANTS DANS FIREBASE
// ==================================================

export async function importParticipants(
  participants
) {

  if (
    !Array.isArray(participants) ||
    participants.length === 0
  ) {

    console.warn(
      "⚠️ Aucun participant à envoyer vers Firebase"
    )

    return {

      success: false,

      count: 0,

    }

  }


  console.log(
    "🔥 Début envoi participants vers Firebase :",
    participants.length
  )


  // Firestore accepte maximum
  // 500 opérations par batch.
  //
  // On utilise 450 par sécurité.

  const batchSize =
    450


  for (
    let index = 0;
    index < participants.length;
    index += batchSize
  ) {

    const batch =
      writeBatch(db)


    const chunk =
      participants.slice(
        index,
        index + batchSize
      )


    chunk.forEach(
      participant => {

        // ------------------------------------------
        // Vérifier ID
        // ------------------------------------------

        const participantId =
          String(
            participant.id ??
            participant.dossard ??
            ""
          )
            .trim()


        if (
          !participantId
        ) {

          console.warn(
            "⚠️ Participant sans ID ignoré :",
            participant
          )

          return

        }


        // ------------------------------------------
        // Document Firebase
        // ------------------------------------------

        const participantRef =
          doc(
            participantsCollection,
            participantId
          )


        // ------------------------------------------
        // Enregistrer
        // ------------------------------------------

        batch.set(

          participantRef,

          {

            ...participant,

            id:
              participantId,

          },

          {
            merge: true,
          }

        )

      }
    )


    // --------------------------------------------
    // Envoyer le batch
    // --------------------------------------------

    await batch.commit()


    console.log(
      `🔥 Lot participants envoyé : ${index + 1} à ${Math.min(
        index + batchSize,
        participants.length
      )}`
    )

  }


  console.log(
    "✅ Tous les participants ont été envoyés vers Firebase :",
    participants.length
  )


  return {

    success: true,

    count:
      participants.length,

  }

}