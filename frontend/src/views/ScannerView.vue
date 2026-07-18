<script setup>
import {
  computed,
  ref,
} from "vue"

import {
  useScannerStore,
} from "../stores/scannerStore"

import {
  useAppStore,
} from "../stores/appStore"

import ScannerCamera from "../components/scanner/ScannerCamera.vue"
import LastArrivalCard from "../components/scanner/LastArrivalCard.vue"


// ==================================================
// STORES
// ==================================================

const scannerStore =
  useScannerStore()

const app =
  useAppStore()


// ==================================================
// MODE SCANNER
// ==================================================

if (
  app.mode !== "scanner"
) {

  app.setScanner(1)

}


// ==================================================
// ÉTAT
// ==================================================

const message =
  ref("")

const messageColor =
  ref("")

const success =
  ref(false)

const duplicate =
  ref(false)

const manualBib =
  ref("")

const isProcessing =
  ref(false)


// ==================================================
// STATISTIQUES
// ==================================================

const totalScans =
  computed(() =>
    scannerStore.totalScans
  )


const recentArrivals =
  computed(() => {

    return [
      ...scannerStore.arrivals
    ]
      .reverse()
      .slice(0, 10)

  })


// ==================================================
// FORMATAGE DU TEMPS
// ==================================================

function formatTime(
  milliseconds
) {

  const value =
    Number(milliseconds ?? 0)

  const minutes =
    Math.floor(
      value / 60000
    )

  const seconds =
    Math.floor(
      (value % 60000) / 1000
    )

  return (
    String(minutes)
      .padStart(2, "0") +
    ":" +
    String(seconds)
      .padStart(2, "0")
  )

}


// ==================================================
// BIP
// ==================================================

function beep(
  duration = 120,
  frequency = 900
) {

  try {

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext


    if (
      !AudioContextClass
    ) {

      return

    }


    const context =
      new AudioContextClass()


    const oscillator =
      context.createOscillator()


    const gain =
      context.createGain()


    oscillator.connect(
      gain
    )


    gain.connect(
      context.destination
    )


    oscillator.frequency.value =
      frequency


    gain.gain.value =
      0.15


    oscillator.start()


    oscillator.stop(

      context.currentTime +

      duration / 1000

    )


    oscillator.onended =
      () => {

        context.close()

      }

  }

  catch (
    error
  ) {

    console.warn(
      "Bip indisponible :",
      error
    )

  }

}


// ==================================================
// TYPES DE BIPS
// ==================================================

function successBeep() {

  beep(
    120,
    950
  )

}


function warningBeep() {

  beep(
    300,
    650
  )

}


function errorBeep() {

  beep(
    450,
    350
  )

}


// ==================================================
// VIBRATION
// ==================================================

function vibrate(
  duration = 80
) {

  if (
    navigator.vibrate
  ) {

    navigator.vibrate(
      duration
    )

  }

}


// ==================================================
// TRAITEMENT COMMUN D'UN SCAN
// ==================================================

async function processScan(
  code
) {

  if (
    isProcessing.value
  ) {

    return

  }


  const cleanCode =
    String(
      code ?? ""
    )
      .trim()


  if (
    !cleanCode
  ) {

    showError(
      "Veuillez saisir un numéro de dossard."
    )

    return

  }


  isProcessing.value =
    true


  try {

    const result =
      await scannerStore
        .scanParticipant(

          cleanCode,

          app.deviceName

        )


    console.log(
      "Résultat du scan :",
      result
    )


    // ==================================================
    // SUCCÈS
    // ==================================================

    if (
      result.success
    ) {

      success.value =
        true

      duplicate.value =
        false


      successBeep()

      vibrate(
        70
      )


      message.value =

        `${result.participant.prenom} ${result.participant.nom}`


      messageColor.value =
        "bg-emerald-600"


      manualBib.value =
        ""

    }


    // ==================================================
    // DOUBLON
    // ==================================================

    else if (
      result.duplicate
    ) {

      success.value =
        false

      duplicate.value =
        true


      warningBeep()

      vibrate(
        250
      )


      message.value =
        "Participant déjà scanné"


      messageColor.value =
        "bg-orange-500"

    }


    // ==================================================
    // ERREUR
    // ==================================================

    else {

      showError(

        result.message ||

        "Impossible d'enregistrer le participant."

      )

      return

    }


    clearMessageLater()

  }

  catch (
    error
  ) {

    console.error(
      "Erreur scanner :",
      error
    )


    showError(
      "Une erreur est survenue pendant le scan."
    )

  }

  finally {

    isProcessing.value =
      false

  }

}


// ==================================================
// SCAN CAMÉRA
// ==================================================

async function onScanned(
  code
) {

  await processScan(
    code
  )

}


// ==================================================
// SAISIE MANUELLE
// ==================================================

async function submitManualBib() {

  const bib =
    manualBib.value
      .trim()


  if (
    !bib
  ) {

    showError(
      "Veuillez saisir un numéro de dossard."
    )

    return

  }


  await processScan(
    bib
  )

}


// ==================================================
// AFFICHAGE ERREUR
// ==================================================

function showError(
  text
) {

  success.value =
    false

  duplicate.value =
    false


  errorBeep()


  vibrate([
    120,
    80,
    120,
  ])


  message.value =
    text


  messageColor.value =
    "bg-red-600"


  clearMessageLater()

}


// ==================================================
// EFFACER MESSAGE
// ==================================================

let messageTimeout =
  null


function clearMessageLater() {

  if (
    messageTimeout
  ) {

    clearTimeout(
      messageTimeout
    )

  }


  messageTimeout =
    setTimeout(
      () => {

        message.value =
          ""

        success.value =
          false

        duplicate.value =
          false

      },

      2200

    )

}


// ==================================================
// RÉINITIALISER LE SCANNER
// ==================================================

function resetScanner() {

  if (
    scannerStore.arrivals.length === 0
  ) {

    return

  }


  const confirmation =
    window.confirm(

      "Voulez-vous vraiment vider l'historique local du scanner ?"

    )


  if (
    !confirmation
  ) {

    return

  }


  scannerStore
    .resetScanner()

}
</script>


<template>

  <section
    class="space-y-8"
  >

    <!-- ==================================================
         EN-TÊTE
    =================================================== -->

    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >

      <div>

        <p
          class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600"
        >
          {{ app.deviceName }}
        </p>


        <h1
          class="mt-2 text-4xl font-black text-slate-900"
        >
          Scanner QR
        </h1>


        <p
          class="mt-2 text-slate-500"
        >
          Scanner les dossards des participants à l'arrivée
        </p>

      </div>


      <div
        class="flex items-center gap-3"
      >

        <div
          class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
        >

          <p
            class="text-xs font-semibold uppercase tracking-wider text-emerald-600"
          >
            Scanner
          </p>

          <p
            class="mt-1 font-bold text-emerald-800"
          >
            ● Actif
          </p>

        </div>


        <button
          v-if="scannerStore.arrivals.length > 0"
          type="button"
          class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          @click="resetScanner"
        >
          Effacer l'historique
        </button>

      </div>

    </div>


    <!-- ==================================================
         STATISTIQUES
    =================================================== -->

    <div
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >

      <!-- TOTAL SCANS -->

      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >

        <p
          class="text-sm font-medium text-slate-500"
        >
          Arrivées scannées
        </p>


        <div
          class="mt-2 flex items-center justify-between"
        >

          <p
            class="text-4xl font-black text-slate-900"
          >
            {{ totalScans }}
          </p>

          <span
            class="text-3xl"
          >
            📱
          </span>

        </div>

      </div>


      <!-- DERNIER DOSSARD -->

      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >

        <p
          class="text-sm font-medium text-slate-500"
        >
          Dernier dossard
        </p>


        <div
          class="mt-2 flex items-center justify-between"
        >

          <p
            class="text-4xl font-black text-sky-600"
          >

            {{
              scannerStore.lastArrival
                ?.participant
                ?.dossard ||
              "—"
            }}

          </p>

          <span
            class="text-3xl"
          >
            🏷️
          </span>

        </div>

      </div>


      <!-- DERNIÈRE POSITION -->

      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1"
      >

        <p
          class="text-sm font-medium text-slate-500"
        >
          Dernière position
        </p>


        <div
          class="mt-2 flex items-center justify-between"
        >

          <p
            class="text-4xl font-black text-slate-900"
          >

            {{
              scannerStore.lastArrival
                ?.position ||
              "—"
            }}

          </p>

          <span
            class="text-3xl"
          >
            🏁
          </span>

        </div>

      </div>

    </div>


    <!-- ==================================================
         VALIDATION DU SCAN
    =================================================== -->

    <transition
      name="scan"
    >

      <div
        v-if="message"
        :class="messageColor"
        class="overflow-hidden rounded-3xl shadow-2xl"
      >

        <!-- ==================================================
             SUCCÈS
        =================================================== -->

        <div
          v-if="success"
          class="py-10 text-center text-white"
        >

          <div
            class="text-8xl"
          >
            ✅
          </div>


          <p
            class="mt-4 text-lg font-semibold uppercase tracking-wider text-emerald-100"
          >
            Arrivée enregistrée
          </p>


          <h2
            class="mt-2 text-4xl font-black md:text-5xl"
          >

            {{
              scannerStore.lastArrival
                ?.participant
                ?.prenom
            }}

            {{
              scannerStore.lastArrival
                ?.participant
                ?.nom
            }}

          </h2>


          <p
            class="mt-2 text-2xl text-emerald-100"
          >

            Dossard

            {{
              scannerStore.lastArrival
                ?.participant
                ?.dossard
            }}

            ·

            {{
              scannerStore.lastArrival
                ?.participant
                ?.categorie
            }}

          </p>


          <div
            class="mx-auto mt-8 max-w-md rounded-2xl bg-white/10 p-6"
          >

            <div
              class="flex justify-between text-2xl"
            >

              <span>
                Temps
              </span>

              <strong>

                {{
                  formatTime(
                    scannerStore.lastArrival
                      ?.elapsedTime
                  )
                }}

              </strong>

            </div>


            <div
              class="mt-4 flex justify-between text-2xl"
            >

              <span>
                Position
              </span>

              <strong>

                {{
                  scannerStore.lastArrival
                    ?.position
                }}

              </strong>

            </div>


            <div
              class="mt-4 flex justify-between text-xl"
            >

              <span>
                Scanner
              </span>

              <strong>

                {{
                  scannerStore.lastArrival
                    ?.scanner
                }}

              </strong>

            </div>

          </div>

        </div>


        <!-- ==================================================
             DOUBLON
        =================================================== -->

        <div
          v-else-if="duplicate"
          class="py-10 text-center text-white"
        >

          <div
            class="text-8xl"
          >
            ⚠️
          </div>


          <h2
            class="mt-4 text-4xl font-black"
          >
            Participant déjà scanné
          </h2>


          <p
            class="mt-3 text-xl text-orange-100"
          >
            Cette arrivée a déjà été enregistrée.
          </p>

        </div>


        <!-- ==================================================
             ERREUR
        =================================================== -->

        <div
          v-else
          class="py-10 text-center text-white"
        >

          <div
            class="text-8xl"
          >
            ❌
          </div>


          <h2
            class="mt-4 text-4xl font-black"
          >
            {{ message }}
          </h2>

        </div>

      </div>

    </transition>


    <!-- ==================================================
         SAISIE MANUELLE
    =================================================== -->

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-end"
      >

        <div
          class="flex-1"
        >

          <label
            class="block text-sm font-semibold text-slate-700"
          >
            Saisie manuelle du dossard
          </label>


          <p
            class="mt-1 text-sm text-slate-500"
          >
            Utilisez cette fonction si le QR Code ne peut pas être lu.
          </p>


          <input
            v-model="manualBib"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="Exemple : 0042"
            class="mt-3 w-full rounded-xl border border-slate-300 px-4 py-4 text-2xl font-bold outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            @keyup.enter="submitManualBib"
          />

        </div>


        <button
          type="button"
          class="rounded-xl bg-sky-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="
            isProcessing ||
            !manualBib.trim()
          "
          @click="submitManualBib"
        >

          <span
            v-if="isProcessing"
          >
            Enregistrement...
          </span>

          <span
            v-else
          >
            🏁 Enregistrer l'arrivée
          </span>

        </button>

      </div>

    </div>


    <!-- ==================================================
         CAMÉRA + DERNIÈRE ARRIVÉE
    =================================================== -->

    <div
      class="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]"
    >

      <div>

        <div
          class="mb-4"
        >

          <h2
            class="text-xl font-bold text-slate-900"
          >
            Scanner caméra
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Présentez le QR Code du dossard devant la caméra.
          </p>

        </div>


        <ScannerCamera
          @scanned="onScanned"
        />

      </div>


      <div>

        <div
          class="mb-4"
        >

          <h2
            class="text-xl font-bold text-slate-900"
          >
            Dernière arrivée
          </h2>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Dernier participant enregistré par ce scanner.
          </p>

        </div>


        <LastArrivalCard
          :arrival="scannerStore.lastArrival"
        />

      </div>

    </div>


    <!-- ==================================================
         HISTORIQUE DES DERNIERS SCANS
    =================================================== -->

    <div
      class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >

      <div
        class="border-b border-slate-200 p-6"
      >

        <div
          class="flex items-center justify-between"
        >

          <div>

            <h2
              class="text-xl font-bold text-slate-900"
            >
              Dernières arrivées
            </h2>

            <p
              class="mt-1 text-sm text-slate-500"
            >
              Les 10 derniers participants enregistrés par ce scanner.
            </p>

          </div>


          <span
            class="rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-700"
          >
            {{ totalScans }} scan(s)
          </span>

        </div>

      </div>


      <!-- AUCUNE ARRIVÉE -->

      <div
        v-if="recentArrivals.length === 0"
        class="px-6 py-12 text-center"
      >

        <div
          class="text-5xl"
        >
          🏁
        </div>

        <p
          class="mt-4 font-semibold text-slate-700"
        >
          Aucune arrivée enregistrée
        </p>

        <p
          class="mt-1 text-sm text-slate-500"
        >
          Les participants apparaîtront ici après leur scan.
        </p>

      </div>


      <!-- TABLEAU -->

      <div
        v-else
        class="overflow-x-auto"
      >

        <table
          class="min-w-full divide-y divide-slate-200 text-left text-sm"
        >

          <thead
            class="bg-slate-50"
          >

            <tr>

              <th
                class="px-5 py-3 font-semibold text-slate-700"
              >
                Position
              </th>

              <th
                class="px-5 py-3 font-semibold text-slate-700"
              >
                Dossard
              </th>

              <th
                class="px-5 py-3 font-semibold text-slate-700"
              >
                Participant
              </th>

              <th
                class="px-5 py-3 font-semibold text-slate-700"
              >
                Catégorie
              </th>

              <th
                class="px-5 py-3 font-semibold text-slate-700"
              >
                Temps
              </th>

              <th
                class="px-5 py-3 font-semibold text-slate-700"
              >
                Scanner
              </th>

            </tr>

          </thead>


          <tbody
            class="divide-y divide-slate-100"
          >

            <tr
              v-for="arrival in recentArrivals"
              :key="
                arrival.id ||
                `${arrival.participant?.id}-${arrival.position}`
              "
              class="hover:bg-slate-50"
            >

              <td
                class="px-5 py-4"
              >

                <span
                  class="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-slate-100 px-2 font-black text-slate-700"
                >
                  {{ arrival.position }}
                </span>

              </td>


              <td
                class="px-5 py-4"
              >

                <span
                  class="rounded-lg bg-sky-50 px-3 py-1.5 font-bold text-sky-700"
                >
                  {{
                    arrival.participant
                      ?.dossard
                  }}
                </span>

              </td>


              <td
                class="px-5 py-4 font-semibold text-slate-900"
              >

                {{
                  arrival.participant
                    ?.prenom
                }}

                {{
                  arrival.participant
                    ?.nom
                }}

              </td>


              <td
                class="px-5 py-4 text-slate-600"
              >
                {{
                  arrival.participant
                    ?.categorie
                }}
              </td>


              <td
                class="px-5 py-4 font-mono font-semibold text-slate-700"
              >
                {{
                  formatTime(
                    arrival.elapsedTime
                  )
                }}
              </td>


              <td
                class="px-5 py-4 text-slate-600"
              >
                {{ arrival.scanner }}
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </section>

</template>


<style scoped>

.scan-enter-active,
.scan-leave-active {

  transition:
    opacity 0.3s ease,
    transform 0.3s ease;

}


.scan-enter-from,
.scan-leave-to {

  opacity: 0;

  transform:
    scale(0.92);

}

</style>