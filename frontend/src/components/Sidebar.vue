<script setup>
// Barre latérale de navigation responsive pour les modules de course.
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const links = computed(() => [
  { name: 'Dashboard', path: '/', icon: '▣' },
  { name: 'Téléphone maître', path: '/master-phone', icon: '📱' },
  { name: 'Scanner', path: '/scanner', icon: '📷' },
  { name: 'Écran TV', path: '/tv-screen', icon: '📺' },
  { name: 'Participants', path: '/participants', icon: '👥' },
  { name: 'Dossards', path: '/dossards', icon: '🏷️' },
  { name: 'Départs', path: '/departures', icon: '🏁' },
  { name: 'Résultats', path: '/results', icon: '✅' },
  { name: 'Paramètres', path: '/settings', icon: '⚙️' },
])

function isActive(path) {
  return route.path === path
}
</script>

<template>
  <aside class="w-full border-b border-slate-200 bg-slate-950 text-white lg:w-72 lg:border-b-0 lg:border-r">
    <div class="p-5">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold">C</div>
        <div>
          <p class="text-lg font-semibold">CrossManager</p>
          <p class="text-sm text-slate-400">Gestion de course</p>
        </div>
      </div>
    </div>

    <nav class="space-y-1 px-3 pb-5">
      <router-link
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition"
        :class="isActive(link.path) ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
      >
        <span class="text-base">{{ link.icon }}</span>
        {{ link.name }}
      </router-link>
    </nav>
  </aside>
</template>
