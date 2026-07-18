import {
  collection,
  doc,
  setDoc,
  getDocs,
} from "firebase/firestore"

import { db } from "./firebase"

const racesCollection = collection(db, "races")

export async function saveRace(race) {

  await setDoc(

    doc(racesCollection, race.categorie),

    race

  )

}

export async function loadRaces() {

  const snapshot = await getDocs(racesCollection)

  return snapshot.docs.map(doc => doc.data())

}