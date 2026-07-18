import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore"

import { db } from "./firebase"

const racesCollection = collection(db, "races")

// ==================================================
// SAUVEGARDER UNE COURSE
// ==================================================

export async function saveRace(race) {

  await setDoc(
    doc(
      racesCollection,
      race.categorie
    ),
    race,
    {
      merge: true,
    }
  )

}


// ==================================================
// CHARGER LES COURSES
// ==================================================

export async function loadRaces() {

  const snapshot =
    await getDocs(
      racesCollection
    )

  return snapshot.docs.map(
    document => ({
      id: document.id,
      ...document.data(),
    })
  )

}


// ==================================================
// ÉCOUTER LES COURSES EN TEMPS RÉEL
// ==================================================

export function listenRaces(callback) {

  return onSnapshot(
    racesCollection,

    snapshot => {

      const races =
        snapshot.docs.map(
          document => ({
            id: document.id,
            ...document.data(),
          })
        )

      callback(races)

    },

    error => {

      console.error(
        "Erreur écoute des courses Firebase :",
        error
      )

    }
  )

}