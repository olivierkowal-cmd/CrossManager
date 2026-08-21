import {
  arrayUnion,
  collection,
  doc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"

import { db } from "../firebase/config"


// =====================================================
// DÉMARRER UNE COURSE
// =====================================================

export async function startRaceFirestore(categorie) {

  await updateDoc(

    doc(db, "races", categorie),

    {
      status: "running",

      startTime: serverTimestamp(),

      finishTime: null,

      arrivals: 0,

      results: [],
    }

  )

}


// =====================================================
// TERMINER UNE COURSE
// =====================================================

export async function finishRaceFirestore(categorie) {

  await updateDoc(

    doc(db, "races", categorie),

    {
      status: "finished",

      finishTime: serverTimestamp(),

    }

  )

}


// =====================================================
// RÉINITIALISER UNE COURSE
// =====================================================

export async function resetRaceFirestore(categorie) {

  await updateDoc(

    doc(db, "races", categorie),

    {
      status: "waiting",

      startTime: null,

      finishTime: null,

      arrivals: 0,

      results: [],
    }

  )

}


// =====================================================
// ENREGISTRER UNE ARRIVÉE
// =====================================================

export async function registerArrivalFirestore(
  categorie,
  arrival
) {

  await updateDoc(

    doc(db, "races", categorie),

    {

      arrivals: increment(1),

      results: arrayUnion(arrival),

    }

  )

}


// =====================================================
// SAUVEGARDER UNE COURSE COMPLÈTE
//
// Utilisé notamment lors de la restauration
// d'une sauvegarde JSON.
// =====================================================

export async function saveRaceFirestore(race) {

  if (!race || !race.categorie) {

    throw new Error(
      "Course invalide : catégorie manquante"
    )

  }


  await setDoc(

    doc(db, "races", race.categorie),

    {

      id:
        race.id ?? null,

      categorie:
        race.categorie,

      label:
        race.label ?? "",

      status:
        race.status ?? "waiting",

      startTime:
        race.startTime ?? null,

      finishTime:
        race.finishTime ?? null,

      participants:
        Number(race.participants ?? 0),

      arrivals:
        Number(race.arrivals ?? 0),

      results:
        Array.isArray(race.results)
          ? race.results
          : [],

    },

    {
      merge: true,
    }

  )

}


// =====================================================
// ÉCOUTER LES COURSES FIRESTORE
// =====================================================

export function listenRacesFirestore(callback) {

  return onSnapshot(

    collection(db, "races"),

    (snapshot) => {

      const races = {}

      snapshot.forEach((raceDoc) => {

        races[raceDoc.id] =
          raceDoc.data()

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