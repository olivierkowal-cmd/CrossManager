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

  <Sidebar />

  <div class="content">

    <Header />

    <main class="page">

      <router-view />

    </main>

  </div>

</div>

</template>

<style scoped>

.app{
  display:flex;
  min-height:100vh;
  background:#f1f5f9;
}

.content{
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
}

.page{
  flex:1;
  padding:24px;
  overflow:auto;
}

</style>