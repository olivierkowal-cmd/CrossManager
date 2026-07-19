<script setup>
import { onMounted, onUnmounted } from "vue"

import Header from "./components/Header.vue"
import Sidebar from "./components/Sidebar.vue"

import { useFirebaseStore } from "./stores/firebaseStore"

const firebase = useFirebaseStore()

onMounted(async () => {
  try {
    await firebase.connect()
  } catch (e) {
    console.error(e)
  }
})

onUnmounted(() => {
  firebase.disconnect()
})
</script>


<template>

  <div class="app">

    <!-- ==================================================
         SIDEBAR ORDINATEUR
    =================================================== -->

    <div class="desktop-sidebar">
      <Sidebar />
    </div>


    <!-- ==================================================
         CONTENU
    =================================================== -->

    <div class="content">

      <!-- Header -->

      <div class="app-header">
        <Header />
      </div>


      <!-- Page active -->

      <main class="page">

        <router-view />

      </main>


      <!-- ==================================================
           NAVIGATION MOBILE
      =================================================== -->

      <nav class="mobile-navigation">

        <!-- ACCUEIL -->

        <router-link
          to="/"
          class="mobile-nav-button"
        >

          <span class="mobile-nav-icon">
            🏠
          </span>

          <span>
            Accueil
          </span>

        </router-link>


        <!-- TÉLÉPHONE MAÎTRE -->

        <router-link
          to="/master-phone"
          class="mobile-nav-button"
        >

          <span class="mobile-nav-icon">
            📱
          </span>

          <span>
            Maître
          </span>

        </router-link>


        <!-- SCANNER -->

        <router-link
          to="/scanner"
          class="mobile-nav-button"
        >

          <span class="mobile-nav-icon">
            📷
          </span>

          <span>
            Scanner
          </span>

        </router-link>

      </nav>

    </div>

  </div>

</template>


<style scoped>

/* ==================================================
   APPLICATION
================================================== */

.app {
  display: flex;

  width: 100%;

  min-height: 100vh;
  min-height: 100dvh;

  background: #f1f5f9;
}


/* ==================================================
   SIDEBAR
================================================== */

.desktop-sidebar {
  display: flex;
  flex-shrink: 0;
}


/* ==================================================
   CONTENU
================================================== */

.content {
  flex: 1;

  display: flex;
  flex-direction: column;

  min-width: 0;
  width: 100%;
}


/* ==================================================
   HEADER
================================================== */

.app-header {
  width: 100%;
}


/* ==================================================
   PAGE
================================================== */

.page {
  flex: 1;

  min-width: 0;

  padding: 24px;

  overflow: auto;
}


/* ==================================================
   NAVIGATION MOBILE
   Cachée sur ordinateur
================================================== */

.mobile-navigation {
  display: none;
}


/* ==================================================
   VERSION TÉLÉPHONE
================================================== */

@media (max-width: 768px) {

  .app {
    display: block;

    width: 100%;

    min-height: 100dvh;
  }


  /* ----------------------------------------------
     Masquer Sidebar
  ---------------------------------------------- */

  .desktop-sidebar {
    display: none;
  }


  /* ----------------------------------------------
     Contenu
  ---------------------------------------------- */

  .content {
    width: 100%;

    min-height: 100dvh;

    padding-bottom: 76px;
  }


  /* ----------------------------------------------
     Header
  ---------------------------------------------- */

  .app-header {
    width: 100%;
  }


  /* ----------------------------------------------
     Page
  ---------------------------------------------- */

  .page {
    width: 100%;

    padding: 8px;

    overflow-x: hidden;
  }


  /* ----------------------------------------------
     Navigation mobile fixe
  ---------------------------------------------- */

  .mobile-navigation {

    position: fixed;

    left: 0;
    right: 0;
    bottom: 0;

    z-index: 9000;


    display: grid;

    grid-template-columns:
      repeat(3, 1fr);


    min-height: 68px;


    padding-bottom:
      env(
        safe-area-inset-bottom
      );


    border-top:
      1px solid #e2e8f0;


    background:
      rgba(
        255,
        255,
        255,
        0.98
      );


    box-shadow:
      0 -4px 20px
      rgba(
        15,
        23,
        42,
        0.08
      );

  }


  /* ----------------------------------------------
     Boutons navigation
  ---------------------------------------------- */

  .mobile-nav-button {

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;


    gap: 3px;


    min-height: 68px;


    color: #64748b;


    font-size: 11px;

    font-weight: 700;


    text-decoration: none;


    transition:
      background 0.2s,
      color 0.2s;

  }


  .mobile-nav-icon {

    font-size: 24px;

    line-height: 1;

  }


  /* ----------------------------------------------
     Page sélectionnée
  ---------------------------------------------- */

  .mobile-nav-button.router-link-active {

    color: #0284c7;

    background: #f0f9ff;

  }

}


/* ==================================================
   PETITS TÉLÉPHONES
================================================== */

@media (max-width: 480px) {

  .page {

    padding: 4px;

  }


  .mobile-nav-icon {

    font-size: 22px;

  }

}

</style>