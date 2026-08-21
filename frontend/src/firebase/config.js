import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import {
  getAuth,
  signInAnonymously,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyD48yTFbZNvTfPxrEPvEN04wLew07ZIwS4",
  authDomain: "crossmanager-d8e76.firebaseapp.com",
  projectId: "crossmanager-d8e76",
  storageBucket: "crossmanager-d8e76.firebasestorage.app",
  messagingSenderId: "1050509930063",
  appId: "1:1050509930063:web:75cc9dd0b13b56284f843a",
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)

export const auth = getAuth(app)


// =====================================================
// AUTHENTIFICATION ANONYME
// =====================================================

export const authReady = signInAnonymously(auth)
  .then((userCredential) => {

    console.log(
      "🔐 Firebase Authentication OK",
      userCredential.user.uid
    )

    return userCredential.user

  })
  .catch((error) => {

    console.error(
      "❌ Erreur authentification Firebase :",
      error
    )

    throw error

  })

