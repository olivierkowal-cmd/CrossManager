<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useRaceStore } from "../stores/raceStore"

const raceStore = useRaceStore()

const route = useRoute()

const menus = computed(() => [
  {
    title: "Dashboard",
    icon: "🏠",
    path: "/",
  },
  {
    title: "Participants",
    icon: "👥",
    path: "/participants",
  },
  {
    title: "Courses",
    icon: "🏁",
    path: "/departures",
  },
  {
    title: "Scanner",
    icon: "📷",
    path: "/scanner",
  },
  {
    title: "Résultats",
    icon: "🏆",
    path: "/results",
  },
  {
    title: "Dossards",
    icon: "🏷️",
    path: "/dossards",
  },
  {
    title: "Téléphone maître",
    icon: "📱",
    path: "/master-phone",
  },
  {
    title: "Écran TV",
    icon: "📺",
    path: "/tv-screen",
  },
  {
    title: "Paramètres",
    icon: "⚙️",
    path: "/settings",
  },
])

function isActive(path) {
  return route.path === path
}
</script>

<template>
  <aside class="sidebar">

    <div class="logo">

      <div class="logo-icon">
      🏁
      </div>

      <div>

        <h2>CrossManager</h2>

      <p>Version 1.0</p>

      </div>

    </div>

    <nav>

      <router-link
        v-for="menu in menus"
        :key="menu.path"
        :to="menu.path"
        class="item"
        :class="{ active: isActive(menu.path) }"
      >

        <span class="icon">
          {{ menu.icon }}
        </span>

        <span>
          {{ menu.title }}
        </span>

      </router-link>

    </nav>

  <div class="footer">

  <div class="school">
    🏫 {{ raceStore.settings.schoolName || "Aucun établissement" }}
  </div>

  <div class="status">
    💾 Sauvegarde automatique
  </div>

</div>

  </aside>
</template>

<style scoped>
.sidebar{
  width:280px;
  min-width:280px;
  background:#020617;
  color:white;
  display:flex;
  flex-direction:column;
  border-right:1px solid #1e293b;
}

.logo{
  display:flex;
  align-items:center;
  gap:16px;
  padding:28px 22px;
  border-bottom:1px solid #1e293b;
}

.logo-icon{
  width:54px;
  height:54px;
  border-radius:16px;
  background:#0ea5e9;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:24px;
  font-weight:800;
}

.logo h2{
  margin:0;
  font-size:1.25rem;
}

.logo p{
  margin-top:4px;
  color:#94a3b8;
}

nav{
  padding:18px 12px;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.item{
  display:flex;
  align-items:center;
  gap:14px;
  padding:14px 16px;
  color:#cbd5e1;
  text-decoration:none;
  border-radius:14px;
  transition:.2s;
}

.item:hover{
  background:#1e293b;
  color:white;
}

.item.active{
  background:#0ea5e9;
  color:white;
}

.icon{
  font-size:22px;
}

.footer{
  margin-top:auto;
  padding:20px;
  border-top:1px solid #1e293b;
  color:#94a3b8;
  font-size:.9rem;
}

.school{
  font-weight:700;
  color:white;
}

.status{
  margin-top:8px;
}

</style>