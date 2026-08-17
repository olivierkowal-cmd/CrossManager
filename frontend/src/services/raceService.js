import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/config"

export async function startRaceFirestore(categorie) {

  await updateDoc(

    doc(db, "races", categorie),

    {

      status: "running",

      startTime: serverTimestamp(),

    }

  )

}

export async function finishRaceFirestore(categorie) {

  await updateDoc(

    doc(db, "races", categorie),

    {

      status: "finished",

      finishTime: serverTimestamp(),

    }

  )

}

export async function resetRaceFirestore(categorie) {

  await updateDoc(

    doc(db, "races", categorie),

    {

      status: "waiting",

      startTime: null,

      finishTime: null,

      arrivals: 0,

    }

  )

}