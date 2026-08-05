import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

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
