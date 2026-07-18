import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore"

import { db } from "./firebase"

const arrivalsCollection = collection(db, "arrivals")

export async function addArrival(arrival) {

  await addDoc(arrivalsCollection, {

    ...arrival,

    createdAt: serverTimestamp(),

  })

}

export function listenArrivals(callback) {

  const q = query(

    arrivalsCollection,

    orderBy("createdAt", "asc")

  )

  return onSnapshot(q, snapshot => {

    const arrivals = snapshot.docs.map(doc => ({

      id: doc.id,

      ...doc.data(),

    }))

    callback(arrivals)

  })

}

export async function deleteArrival(id) {

  await deleteDoc(doc(db, "arrivals", id))

}