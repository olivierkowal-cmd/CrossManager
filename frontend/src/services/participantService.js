import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore"

import { db } from "../firebase/config"


// =====================================================
// ENREGISTRER UN PARTICIPANT
// =====================================================

export async function saveParticipant(participant) {

  await setDoc(

    doc(
      db,
      "participants",
      String(participant.id)
    ),

    participant,

    {
      merge: true,
    }

  )

}


// =====================================================
// ENREGISTRER PLUSIEURS PARTICIPANTS
// =====================================================

export async function saveParticipants(
  participants
) {

  for (
    const participant of participants
  ) {

    await saveParticipant(
      participant
    )

  }

}


// =====================================================
// SUPPRIMER UN PARTICIPANT
// =====================================================

export async function deleteParticipantFirestore(
  id
) {

  await deleteDoc(

    doc(
      db,
      "participants",
      String(id)
    )

  )

}


// =====================================================
// SUPPRIMER TOUS LES PARTICIPANTS
// =====================================================

export async function deleteAllParticipantsFirestore() {

  const snapshot = await getDocs(

    collection(
      db,
      "participants"
    )

  )


  if (snapshot.empty) {

    console.log(
      "🗑️ Aucun participant à supprimer"
    )

    return 0

  }


  // Firestore limite un batch à 500 opérations.
  // On travaille donc par groupes de 500.

  const documents =
    snapshot.docs


  let deletedCount = 0


  for (
    let i = 0;
    i < documents.length;
    i += 500
  ) {

    const batch =
      writeBatch(db)


    const groupe =
      documents.slice(
        i,
        i + 500
      )


    groupe.forEach(
      document => {

        batch.delete(
          document.ref
        )

      }
    )


    await batch.commit()


    deletedCount +=
      groupe.length

  }


  console.log(
    "🗑️ Tous les participants supprimés :",
    deletedCount
  )


  return deletedCount

}


// =====================================================
// ÉCOUTE FIRESTORE
// =====================================================

export function listenParticipants(
  callback
) {

  return onSnapshot(

    collection(
      db,
      "participants"
    ),

    (snapshot) => {

      const participants = []


      snapshot.forEach(
        (doc) => {

          participants.push({

            ...doc.data(),

            id:
              doc.data().id ??
              Number(doc.id),

          })

        }
      )


      callback(
        participants
      )

    },

    (error) => {

      console.error(
        "Erreur Firestore (participants) :",
        error
      )

    }

  )

}