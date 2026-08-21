import { createApp } from "vue"
import { createPinia } from "pinia"

import router from "./router"

import "./style.css"

import App from "./App.vue"

import { useRaceManagerStore } from "./stores/raceManagerStore"
import { useRaceStore } from "./stores/raceStore"

import { authReady } from "./firebase/config"


// =====================================================
// INITIALISATION DE L'APPLICATION
// =====================================================

async function startApplication() {

  try {

    // ---------------------------------------------------
    // Attendre l'authentification Firebase
    // ---------------------------------------------------

    await authReady

    console.log(
      "🔐 Application authentifiée avec Firebase"
    )


    // ---------------------------------------------------
    // Vue
    // ---------------------------------------------------

    const app = createApp(App)

    const pinia = createPinia()

    app.use(pinia)

    app.use(router)


    // ---------------------------------------------------
    // Stores
    // ---------------------------------------------------

    const raceManager =
      useRaceManagerStore()

    const raceStore =
      useRaceStore()


    // ---------------------------------------------------
    // Écoute des participants
    // ---------------------------------------------------

    raceStore.startParticipantsListening()


    // ---------------------------------------------------
    // Écoute des courses
    // ---------------------------------------------------

    raceManager.startListening()


    // ---------------------------------------------------
    // Monter l'application
    // ---------------------------------------------------

    app.mount("#app")


    console.log(
      "🚀 CrossManager démarré"
    )

  }

  catch (error) {

    console.error(
      "🔥 Impossible de démarrer CrossManager :",
      error
    )

  }

}


startApplication()