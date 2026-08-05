import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/config"

export async function updateScannerStatus(
  device,
  data = {}
) {

  await setDoc(

    doc(db, "scanners", device),

    {

      device,

      connected: true,

      heartbeat: serverTimestamp(),

      battery: data.battery ?? 100,

      network: data.network ?? "wifi",

      scans: data.scans ?? 0,

      version: data.version ?? "1.0",

      lastScan: data.lastScan ?? null,

    },

    {

      merge: true,

    }

  )

}

export async function disconnectScanner(device) {

  await setDoc(

    doc(db, "scanners", device),

    {

      connected: false,

      heartbeat: serverTimestamp(),

    },

    {

      merge: true,

    }

  )

}