import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore"

import { db } from "./firebase"

const participantsCollection = collection(db, "participants")

export async function loadParticipants() {

  const snapshot = await getDocs(participantsCollection)

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))

}

export async function importParticipants(participants) {

  const batch = writeBatch(db)

  participants.forEach(participant => {

    batch.set(

      doc(participantsCollection, String(participant.id)),

      participant

    )

  })

  await batch.commit()

}