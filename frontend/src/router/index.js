import { createRouter, createWebHistory } from 'vue-router'

// Définition des routes principales de l'application CrossManager.
const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'Dashboard' },
  },
  {
    path: '/master-phone',
    name: 'master-phone',
    component: () => import('../views/MasterPhoneView.vue'),
    meta: { title: 'Téléphone maître' },
  },
  {
    path: '/scanner',
    name: 'scanner',
    component: () => import('../views/ScannerView.vue'),
    meta: { title: 'Scanner' },
  },
  {
    path: '/tv-screen',
    name: 'tv-screen',
    component: () => import('../views/TvScreenView.vue'),
    meta: { title: 'Écran TV' },
  },
  {
    path: '/participants',
    name: 'participants',
    component: () => import('../views/ParticipantsView.vue'),
    meta: { title: 'Participants' },
  },

  {
    path: '/dossards',
   name: 'dossards',
   component: () => import('../views/DossardsView.vue'),
   meta: { title: 'Dossards' },
  },
  {
    path: '/departures',
    name: 'departures',
    component: () => import('../views/DeparturesView.vue'),
    meta: { title: 'Départs' },
  },
  {
    path: '/results',
    name: 'results',
    component: () => import('../views/ResultsView.vue'),
    meta: { title: 'Résultats' },
  },

{
  path: '/diagnostic',
  name: 'diagnostic',
  component: () => import('../views/DiagnosticView.vue'),
  meta: { title: 'Diagnostic' },
},

  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { title: 'Paramètres' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = `CrossManager • ${to.meta.title || 'Application'}`
})

export default router
