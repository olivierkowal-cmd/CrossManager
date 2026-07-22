<script setup>
import { computed } from "vue"
import { useScannerStore } from "../../stores/scannerStore"


// ==================================================
// STORE
// ==================================================

const scannerStore =
  useScannerStore()


// ==================================================
// ARRIVÉES VALIDÉES
// ==================================================

const totalScans =
  computed(() => {

    return scannerStore.arrivals.length

  })


// ==================================================
// DOUBLONS
// ==================================================

const duplicates =
  computed(() => {

    return scannerStore.duplicateCount

  })


// ==================================================
// ERREURS
// ==================================================

const errors =
  computed(() => {

    return scannerStore.errorCount

  })


// ==================================================
// DERNIÈRE ARRIVÉE
// ==================================================

const lastArrival =
  computed(() => {

    return scannerStore.lastArrival

  })


// ==================================================
// DERNIER DOSSARD
// ==================================================

const lastBib =
  computed(() => {

    return (
      lastArrival.value?.participant?.dossard ??
      lastArrival.value?.dossard ??
      "--"
    )

  })


// ==================================================
// DERNIER SCANNER UTILISÉ
// ==================================================

const lastScanner =
  computed(() => {

    return (
      lastArrival.value?.scanner ??
      "--"
    )

  })

</script>


<template>

  <div
    class="rounded-3xl border border-slate-200 bg-white shadow-sm"
  >

    <!-- ==================================================
         TITRE
    =================================================== -->

    <div
      class="border-b border-slate-200 p-5"
    >

      <h2
        class="text-xl font-bold"
      >
        Scanner
      </h2>

      <p
        class="mt-1 text-sm text-slate-500"
      >
        Activité de la session
      </p>

    </div>


    <!-- ==================================================
         INDICATEURS
    =================================================== -->

    <div
      class="grid grid-cols-2 gap-4 p-6 lg:grid-cols-3"
    >

      <!-- ARRIVÉES -->

      <div
        class="rounded-2xl bg-sky-50 p-5 text-center"
      >

        <p
          class="text-sm text-slate-500"
        >
          Arrivées validées
        </p>

        <p
          class="mt-2 text-3xl font-bold text-sky-700"
        >
          {{ totalScans }}
        </p>

      </div>


      <!-- DOUBLONS -->

      <div
        class="rounded-2xl bg-yellow-50 p-5 text-center"
      >

        <p
          class="text-sm text-slate-500"
        >
          Doublons
        </p>

        <p
          class="mt-2 text-3xl font-bold text-yellow-700"
        >
          {{ duplicates }}
        </p>

      </div>


      <!-- ERREURS -->

      <div
        class="rounded-2xl bg-red-50 p-5 text-center"
      >

        <p
          class="text-sm text-slate-500"
        >
          Erreurs
        </p>

        <p
          class="mt-2 text-3xl font-bold text-red-700"
        >
          {{ errors }}
        </p>

      </div>


      <!-- DERNIER DOSSARD -->

      <div
        class="rounded-2xl bg-green-50 p-5 text-center"
      >

        <p
          class="text-sm text-slate-500"
        >
          Dernier dossard
        </p>

        <p
          class="mt-2 text-3xl font-bold text-green-700"
        >
          {{ lastBib }}
        </p>

      </div>


      <!-- DERNIER SCANNER -->

      <div
        class="col-span-2 rounded-2xl bg-slate-50 p-5 text-center lg:col-span-2"
      >

        <p
          class="text-sm text-slate-500"
        >
          Dernier scanner utilisé
        </p>

        <p
          class="mt-2 truncate text-xl font-bold text-slate-700"
        >
          {{ lastScanner }}
        </p>

      </div>

    </div>

  </div>

</template>