import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from "firebase/firestore"

import { db } from "../firebase/config"

export async function saveParticipant(participant) {
  await setDoc(
    doc(db, "participants", String(participant.id)),
    participant,
    { merge: true }
  )
}

export async function saveParticipants(participants) {
  for (const participant of participants) {
    await saveParticipant(participant)
  }
}

export async function deleteParticipantFirestore(id) {
  await deleteDoc(
    doc(db, "participants", String(id))
  )
}

export function listenParticipants(callback) {
  return onSnapshot(
    collection(db, "participants"),

    (snapshot) => {
      const participants = []

      snapshot.forEach((doc) => {
        participants.push({
          ...doc.data(),
          id: doc.data().id ?? Number(doc.id),
        })
      })

      callback(participants)
    },

    (error) => {
      console.error(
        "Erreur Firestore (participants) :",
        error
      )
    }
  )
}