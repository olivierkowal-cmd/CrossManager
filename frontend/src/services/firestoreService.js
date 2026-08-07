import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/config"

export function listenScanners(callback) {

  return onSnapshot(

    collection(db, "scanners"),

    (snapshot) => {

      const scanners = {}

      snapshot.forEach((doc) => {

        scanners[doc.id] = doc.data()

      })

      callback(scanners)

    },

    (error) => {

      console.error("Erreur Firestore :", error)

    }

  )

}