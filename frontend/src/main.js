import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useRaceManagerStore } from "./stores/raceManagerStore"
import { useRaceStore } from "./stores/raceStore"

// Initialisation de l'application Vue avec Pinia et Vue Router.
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
const raceManager = useRaceManagerStore()

const raceStore = useRaceStore()

raceStore.startParticipantsListening()


raceManager.startListening()

app.mount('#app')
