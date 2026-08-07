<script setup>
import { ref, onMounted } from "vue"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../firebase/config"

const status = ref("Connexion en cours...")
const participants = ref(0)
const races = ref(0)
const arrivals = ref(0)
const scanners = ref(0)

onMounted(async () => {

  try {

    participants.value = (await getDocs(collection(db, "participants"))).size
    races.value = (await getDocs(collection(db, "races"))).size
    arrivals.value = (await getDocs(collection(db, "arrivals"))).size
    scanners.value = (await getDocs(collection(db, "scanners"))).size

    status.value = "✅ Firestore connecté"

  } catch (e) {

    console.error(e)

    status.value = "❌ " + e.message

  }

})
</script>

<template>

<section class="space-y-6">

  <h1 class="text-3xl font-black">
    🔥 Diagnostic Firebase
  </h1>

  <div class="rounded-2xl bg-slate-900 text-white p-6">

    <p class="text-xl font-bold">
      {{ status }}
    </p>

    <div class="mt-6 grid gap-4 md:grid-cols-2">

      <div class="rounded-xl bg-slate-800 p-4">
        👥 Participants : {{ participants }}
      </div>

      <div class="rounded-xl bg-slate-800 p-4">
        🏁 Courses : {{ races }}
      </div>

      <div class="rounded-xl bg-slate-800 p-4">
        📱 Scanners : {{ scanners }}
      </div>

      <div class="rounded-xl bg-slate-800 p-4">
        🏃 Arrivées : {{ arrivals }}
      </div>

    </div>

  </div>

</section>

</template>