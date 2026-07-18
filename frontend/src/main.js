import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import "./app.css"
import { useRaceStore } from './stores/raceStore'

// Initialisation de l'application Vue avec Pinia et Vue Router.
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const raceStore = useRaceStore()
raceStore.restoreProject()

app.use(router)
app.mount('#app')
