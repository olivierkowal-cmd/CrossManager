<script setup>

import { computed } from "vue"

import { useRaceManagerStore } from "../stores/raceManagerStore"

const raceManager = useRaceManagerStore()


// =====================================================
// TOUS LES RÉSULTATS
// CLASSEMENT À L'INTÉRIEUR DE CHAQUE COURSE
// =====================================================

const sortedArrivals = computed(() => {

  const results = []


  raceManager.races.forEach((race) => {

    if (!Array.isArray(race.results)) {
      return
    }


    // -------------------------------------------------
    // Trier les résultats de CETTE course
    // par temps écoulé
    // -------------------------------------------------

    const raceResults =
      [...race.results]
        .sort(
          (a, b) =>
            (a.elapsedTime ?? 0) -
            (b.elapsedTime ?? 0)
        )


    // -------------------------------------------------
    // Ajouter la position dans CETTE course
    // -------------------------------------------------

    raceResults.forEach(
      (arrival, index) => {

        results.push({

          ...arrival,

          categorie:
            race.categorie,

          raceLabel:
            race.label,

          position:
            index + 1,

        })

      }
    )

  })


  return results

})


// =====================================================
// FORMAT DU TEMPS
// =====================================================

function formatTime(milliseconds = 0) {

  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        milliseconds / 1000
      )
    )


  const minutes =
    Math.floor(
      totalSeconds / 60
    )


  const seconds =
    totalSeconds % 60


  return (
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`
  )

}

</script>


<template>

  <section class="space-y-6">

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <!-- =================================================
           TITRE
      ================================================== -->

      <p
        class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600"
      >
        Résultats
      </p>


      <h2
        class="mt-2 text-2xl font-semibold text-slate-900"
      >
        Classement temporaire par course
      </h2>


      <!-- =================================================
           TABLEAU
      ================================================== -->

      <div
        class="mt-6 overflow-hidden rounded-2xl border border-slate-200"
      >

        <table
          class="min-w-full divide-y divide-slate-200 text-left text-sm"
        >

          <!-- =================================================
               EN-TÊTE
          ================================================== -->

          <thead class="bg-slate-50">

            <tr>

              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Place
              </th>


              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Nom
              </th>


              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Prénom
              </th>


              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Dossard
              </th>


              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Course
              </th>


              <th
                class="px-4 py-3 font-semibold text-slate-700"
              >
                Temps
              </th>

            </tr>

          </thead>


          <!-- =================================================
               RÉSULTATS
          ================================================== -->

          <tbody
            class="divide-y divide-slate-100 bg-white"
          >

            <tr
              v-for="arrival in sortedArrivals"
              :key="
                `${arrival.categorie}-${arrival.participant?.id}-${arrival.arrivalTime}`
              "
            >

              <!-- PLACE DANS LA COURSE -->

              <td
                class="px-4 py-3 font-semibold text-slate-700"
              >

                {{ arrival.position }}

              </td>


              <!-- NOM -->

              <td
                class="px-4 py-3 font-semibold"
              >

                {{ arrival.participant?.nom ?? "--" }}

              </td>


              <!-- PRÉNOM -->

              <td
                class="px-4 py-3"
              >

                {{ arrival.participant?.prenom ?? "--" }}

              </td>


              <!-- DOSSARD -->

              <td
                class="px-4 py-3"
              >

                {{ arrival.participant?.dossard ?? "--" }}

              </td>


              <!-- COURSE -->

              <td
                class="px-4 py-3"
              >

                {{ arrival.raceLabel }}

              </td>


              <!-- TEMPS -->

              <td
                class="px-4 py-3 font-mono font-semibold"
              >

                {{ formatTime(
                  arrival.elapsedTime
                ) }}

              </td>

            </tr>


            <!-- =================================================
                 AUCUN RÉSULTAT
            ================================================== -->

            <tr
              v-if="
                sortedArrivals.length === 0
              "
            >

              <td
                colspan="6"
                class="px-4 py-8 text-center text-slate-400"
              >

                Aucun résultat pour le moment.

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </section>

</template>