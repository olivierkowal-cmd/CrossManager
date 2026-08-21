<script setup>

import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from "vue"

import { useRouter } from "vue-router"

import { useRaceManagerStore } from "../stores/raceManagerStore"


const router = useRouter()

const raceManager =
  useRaceManagerStore()


// =====================================================
// MODE PLEIN ÉCRAN
// =====================================================

const fullscreen = ref(true)


// =====================================================
// COURSES À AFFICHER
// =====================================================
//
// On affiche :
//
// - toutes les courses en cours
// - toutes les courses terminées avec résultats
//
// Les courses en attente sans résultats ne sont pas
// affichées.
// =====================================================

const displayRaces = computed(() => {

  return raceManager.races.filter(
    (race) => {

      const hasResults =
        Array.isArray(race.results) &&
        race.results.length > 0


      return (
        race.status === "running" ||
        (
          race.status === "finished" &&
          hasResults
        )
      )

    }
  )

})


// =====================================================
// RÉSULTATS D'UNE COURSE
// =====================================================

function getTopArrivals(race) {

  if (
    !Array.isArray(race.results)
  ) {

    return []

  }


  return [
    ...race.results,
  ]
    .sort(
      (a, b) =>
        (a.elapsedTime ?? 0) -
        (b.elapsedTime ?? 0)
    )
    .slice(0, 10)

}


// =====================================================
// FORMAT DU TEMPS
// =====================================================

function formatTime(ms = 0) {

  const total =
    Math.max(
      0,
      Math.floor(ms / 1000)
    )


  const minutes =
    Math.floor(
      total / 60
    )


  const seconds =
    total % 60


  return (
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`
  )

}


// =====================================================
// QUITTER L'ÉCRAN TV
// =====================================================

async function exitTv() {

  fullscreen.value = false


  // ---------------------------------------------------
  // Si le navigateur est réellement en plein écran
  // ---------------------------------------------------

  if (
    document.fullscreenElement
  ) {

    try {

      await document.exitFullscreen()

    } catch (error) {

      console.warn(
        "Impossible de quitter le plein écran navigateur :",
        error
      )

    }

  }


  // ---------------------------------------------------
  // Retour à l'application
  // ---------------------------------------------------

  router.push("/")

}


// =====================================================
// TOUCHE ÉCHAP
// =====================================================

function handleKeydown(event) {

  if (
    event.key === "Escape"
  ) {

    exitTv()

  }

}


// =====================================================
// MONTAGE
// =====================================================

onMounted(() => {

  document.addEventListener(
    "keydown",
    handleKeydown
  )

})


// =====================================================
// DÉMONTAGE
// =====================================================

onUnmounted(() => {

  document.removeEventListener(
    "keydown",
    handleKeydown
  )

})

</script>


<template>

  <!-- ===================================================
       ÉCRAN TV PLEIN ÉCRAN
  ==================================================== -->

  <div
    v-if="fullscreen"
    class="tv-screen"
  >

    <!-- =================================================
         BOUTON QUITTER
    ================================================== -->

    <button
      type="button"
      class="close-button"
      title="Quitter l'écran TV"
      aria-label="Quitter l'écran TV"
      @click="exitTv"
    >

      ✕

    </button>


    <!-- =================================================
         CONTENU
    ================================================== -->

    <div class="tv-content">

      <!-- =================================================
           EN-TÊTE
      ================================================== -->

      <div class="tv-header">

        <div>

          <p class="tv-label">
            ÉCRAN TV
          </p>


          <h1 class="tv-title">
            Classement en direct
          </h1>


          <p class="tv-subtitle">
            Résultats des courses
          </p>

        </div>


        <!-- INDICATEUR -->

        <div
          v-if="displayRaces.length > 0"
          class="live-indicator"
        >

          <span class="live-dot"></span>

          LIVE

        </div>

      </div>


      <!-- =================================================
           AUCUNE COURSE
      ================================================== -->

      <div
        v-if="displayRaces.length === 0"
        class="empty-state"
      >

        <div class="empty-icon">
          🏁
        </div>


        <div>
          Aucune course en cours
        </div>


        <p>
          Les résultats apparaîtront ici dès le départ
          d'une course.
        </p>

      </div>


      <!-- =================================================
           COURSES
      ================================================== -->

      <div
        v-else
        class="races-grid"
      >

        <!-- =================================================
             UNE CARTE PAR COURSE
        ================================================== -->

        <div
          v-for="race in displayRaces"
          :key="race.categorie"
          class="race-card"
        >

          <!-- =================================================
               HEADER COURSE
          ================================================= -->

          <div class="race-header">

            <div class="race-header-left">

              <h2 class="race-title">

                {{ race.label }}

              </h2>


              <p class="race-count">

                {{ race.arrivals }}

                /

                {{ race.participants }}

                arrivées

              </p>

            </div>


            <!-- STATUT -->

            <span
              v-if="
                race.status === 'running'
              "
              class="status running"
            >

              <span class="status-dot"></span>

              EN COURS

            </span>


            <span
              v-else-if="
                race.status === 'finished'
              "
              class="status finished"
            >

              🏁 TERMINÉE

            </span>

          </div>


          <!-- =================================================
               CLASSEMENT
          ================================================== -->

          <div class="results">

            <div
              v-for="(
                arrival,
                index
              ) in getTopArrivals(race)"
              :key="
                `${race.categorie}-${arrival.participant?.id}-${arrival.arrivalTime}`
              "
              class="arrival"
            >

              <!-- POSITION -->

              <div class="position">

                {{ index + 1 }}

              </div>


              <!-- PARTICIPANT -->

              <div class="participant">

                <div class="participant-name">

                  {{ arrival.participant?.prenom }}

                  {{ arrival.participant?.nom }}

                </div>


                <div class="participant-info">

                  Dossard
                  {{ arrival.participant?.dossard }}

                  <span
                    v-if="arrival.scanner"
                  >
                    •
                    {{ arrival.scanner }}
                  </span>

                </div>

              </div>


              <!-- TEMPS -->

              <div class="time">

                {{ formatTime(
                  arrival.elapsedTime
                ) }}

              </div>

            </div>


            <!-- =================================================
                 AUCUNE ARRIVÉE
            ================================================== -->

            <div
              v-if="
                getTopArrivals(race).length === 0
              "
              class="waiting"
            >

              En attente des arrivées...

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</template>


<style scoped>

.tv-screen {

  position: fixed;

  inset: 0;

  z-index: 9999;

  width: 100vw;

  height: 100vh;

  overflow-y: auto;

  background:
    #020617;

  color: white;

}


.tv-content {

  min-height: 100vh;

  padding: 50px;

  padding-top: 55px;

}


.close-button {

  position: fixed;

  top: 18px;

  right: 22px;

  z-index: 10000;

  width: 42px;

  height: 42px;

  display: flex;

  align-items: center;

  justify-content: center;

  border: none;

  border-radius: 999px;

  background:
    rgba(255, 255, 255, 0.12);

  color: white;

  font-size: 24px;

  font-weight: 700;

  cursor: pointer;

  backdrop-filter: blur(8px);

  transition:
    background 0.2s,
    transform 0.2s;

}


.close-button:hover {

  background:
    rgba(239, 68, 68, 0.9);

  transform: scale(1.08);

}


.tv-header {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 30px;

  margin-bottom: 35px;

}


.tv-label {

  margin: 0;

  color: #38bdf8;

  font-size: 14px;

  font-weight: 700;

  letter-spacing: 0.35em;

  text-transform: uppercase;

}


.tv-title {

  margin: 8px 0 0;

  font-size: clamp(
    2.4rem,
    4vw,
    4.5rem
  );

  line-height: 1;

  font-weight: 900;

}


.tv-subtitle {

  margin: 12px 0 0;

  color: #94a3b8;

  font-size: 18px;

}


.live-indicator {

  display: flex;

  align-items: center;

  gap: 8px;

  padding: 10px 18px;

  border-radius: 999px;

  background:
    rgba(16, 185, 129, 0.15);

  color: #34d399;

  font-size: 14px;

  font-weight: 800;

}


.live-dot {

  width: 10px;

  height: 10px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 12px
    rgba(34, 197, 94, 0.9);

}


.races-grid {

  display: grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(
        480px,
        1fr
      )
    );

  gap: 24px;

}


.race-card {

  overflow: hidden;

  border:
    1px solid
    rgba(148, 163, 184, 0.1);

  border-radius: 24px;

  background:
    #0f172a;

  box-shadow:
    0 20px 60px
    rgba(0, 0, 0, 0.25);

}


.race-header {

  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 20px;

  padding: 25px;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.1);

}


.race-title {

  margin: 0;

  font-size: clamp(
    1.5rem,
    2.2vw,
    2.4rem
  );

  font-weight: 900;

}


.race-count {

  margin: 6px 0 0;

  color: #94a3b8;

  font-size: 16px;

}


.status {

  display: inline-flex;

  align-items: center;

  gap: 7px;

  flex-shrink: 0;

  padding: 8px 14px;

  border-radius: 999px;

  font-size: 12px;

  font-weight: 800;

}


.status.running {

  background:
    rgba(16, 185, 129, 0.18);

  color: #34d399;

}


.status.finished {

  background:
    rgba(14, 165, 233, 0.18);

  color: #38bdf8;

}


.status-dot {

  width: 9px;

  height: 9px;

  border-radius: 50%;

  background: #22c55e;

}


.results {

  padding: 18px;

}


.arrival {

  display: flex;

  align-items: center;

  gap: 16px;

  min-height: 72px;

  margin-bottom: 10px;

  padding: 14px 18px;

  border-radius: 16px;

  background:
    #020617;

}


.arrival:last-child {

  margin-bottom: 0;

}


.position {

  width: 32px;

  flex-shrink: 0;

  color: #64748b;

  font-size: 20px;

  font-weight: 900;

  text-align: center;

}


.participant {

  min-width: 0;

  flex: 1;

}


.participant-name {

  overflow: hidden;

  color: #f8fafc;

  font-size: 18px;

  font-weight: 800;

  text-overflow: ellipsis;

  white-space: nowrap;

}


.participant-info {

  margin-top: 4px;

  color: #64748b;

  font-size: 12px;

}


.time {

  flex-shrink: 0;

  color: #38bdf8;

  font-family: monospace;

  font-size: 24px;

  font-weight: 900;

}


.waiting {

  padding: 70px 20px;

  color: #64748b;

  font-size: 20px;

  text-align: center;

}


.empty-state {

  display: flex;

  min-height: 55vh;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  color: #64748b;

  font-size: 30px;

  font-weight: 700;

  text-align: center;

}


.empty-state p {

  margin-top: 12px;

  color: #475569;

  font-size: 16px;

  font-weight: 400;

}


.empty-icon {

  margin-bottom: 20px;

  font-size: 60px;

}


/* =====================================================
   PETITS ÉCRANS
===================================================== */

@media (max-width: 700px) {

  .tv-content {

    padding: 25px 15px;

    padding-top: 65px;

  }


  .tv-header {

    margin-bottom: 25px;

  }


  .tv-title {

    font-size: 2.2rem;

  }


  .tv-subtitle {

    font-size: 14px;

  }


  .races-grid {

    grid-template-columns: 1fr;

  }


  .race-header {

    padding: 18px;

  }


  .race-title {

    font-size: 1.4rem;

  }


  .arrival {

    gap: 10px;

    padding: 12px;

  }


  .participant-name {

    font-size: 15px;

  }


  .time {

    font-size: 18px;

  }

}


/* =====================================================
   ÉCRAN LARGE / TV
===================================================== */

@media (min-width: 1600px) {

  .tv-content {

    padding: 60px 70px;

  }


  .races-grid {

    gap: 30px;

  }


  .arrival {

    min-height: 82px;

    padding: 18px 22px;

  }


  .participant-name {

    font-size: 21px;

  }


  .time {

    font-size: 28px;

  }

}

</style>