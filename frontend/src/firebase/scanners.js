import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"

import { db } from "./firebase"

const scannersCollection = collection(db, "scanners")

export async function updateScannerStatus(scannerId, status) {

  await setDoc(

    doc(scannersCollection, scannerId),

    {

      ...status,

      updatedAt: serverTimestamp(),

    },

    {

      merge: true,

    }

  )

}

export function listenScanners(callback) {

  return onSnapshot(

    scannersCollection,

    snapshot => {

      const scanners = snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data(),

      }))

      callback(scanners)

    }

  )

}