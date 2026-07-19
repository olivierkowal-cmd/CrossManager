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

<section class="scanner-page">

  <!-- ==================================================
       EN-TÊTE
  =================================================== -->

  <header class="scanner-header">

    <div>

      <p class="device-name">
        📱 {{ app.deviceName }}
      </p>

      <h1>
        Scanner QR
      </h1>

      <p class="desktop-only scanner-description">
        Scanner les dossards des participants à l'arrivée
      </p>

    </div>


    <div class="scanner-status">

      <span class="status-dot"></span>

      Scanner actif

    </div>

  </header>


  <!-- ==================================================
       STATISTIQUES PC UNIQUEMENT
  =================================================== -->

  <div class="desktop-only stats-grid">

    <div class="stat-card">

      <p>
        Arrivées scannées
      </p>

      <strong>
        {{ totalScans }}
      </strong>

    </div>


    <div class="stat-card">

      <p>
        Dernier dossard
      </p>

      <strong class="text-sky-600">

        {{
          scannerStore.lastArrival
            ?.participant
            ?.dossard ||
          "—"
        }}

      </strong>

    </div>


    <div class="stat-card">

      <p>
        Dernière position
      </p>

      <strong>

        {{
          scannerStore.lastArrival
            ?.position ||
          "—"
        }}

      </strong>

    </div>

  </div>


  <!-- ==================================================
       ZONE PRINCIPALE
  =================================================== -->

  <div class="scanner-main">


    <!-- ==================================================
         CAMÉRA
    =================================================== -->

    <div class="camera-zone">

      <div class="desktop-only camera-title">

        <h2>
          Scanner caméra
        </h2>

        <p>
          Présentez le QR Code du dossard devant la caméra.
        </p>

      </div>


      <div class="camera-container">

        <ScannerCamera
          @scanned="onScanned"
        />

      </div>


      <!-- INDICATION MOBILE -->

      <div class="mobile-only scan-instruction">

        <span class="scan-icon">
          ⌗
        </span>

        <span>
          Placez le QR Code dans le cadre
        </span>

      </div>

    </div>


    <!-- ==================================================
         DERNIÈRE ARRIVÉE PC
    =================================================== -->

    <div class="desktop-only last-arrival-zone">

      <h2>
        Dernière arrivée
      </h2>

      <p>
        Dernier participant enregistré par ce scanner.
      </p>

      <div class="mt-4">

        <LastArrivalCard
          :arrival="scannerStore.lastArrival"
        />

      </div>

    </div>

  </div>


  <!-- ==================================================
       VALIDATION SCAN
       OVERLAY SUR MOBILE
  =================================================== -->

  <transition name="scan">

    <div
      v-if="message"
      :class="[
        messageColor,
        'scan-result'
      ]"
    >


      <!-- SUCCÈS -->

      <div
        v-if="success"
        class="result-content"
      >

        <div class="result-icon">
          ✅
        </div>

        <p class="result-label">
          Arrivée enregistrée
        </p>

        <h2 class="result-name">

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


        <p class="result-bib">

          Dossard

          <strong>

            {{
              scannerStore.lastArrival
                ?.participant
                ?.dossard
            }}

          </strong>

        </p>


        <p class="result-category">

          {{
            scannerStore.lastArrival
              ?.participant
              ?.categorie
          }}

        </p>


        <div class="result-details">

          <div>

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


          <div>

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

        </div>

      </div>


      <!-- DOUBLON -->

      <div
        v-else-if="duplicate"
        class="result-content"
      >

        <div class="result-icon">
          ⚠️
        </div>

        <h2 class="result-name">
          Déjà scanné
        </h2>

        <p class="result-message">
          Cette arrivée a déjà été enregistrée.
        </p>

      </div>


      <!-- ERREUR -->

      <div
        v-else
        class="result-content"
      >

        <div class="result-icon">
          ❌
        </div>

        <h2 class="result-name">
          {{ message }}
        </h2>

      </div>

    </div>

  </transition>


  <!-- ==================================================
       SAISIE MANUELLE
  =================================================== -->

  <div class="manual-zone">

    <div class="manual-header">

      <div>

        <h2>
          Saisie manuelle
        </h2>

        <p class="desktop-only">
          À utiliser uniquement si le QR Code ne peut pas être lu.
        </p>

      </div>

    </div>


    <div class="manual-form">

      <input
        v-model="manualBib"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        placeholder="N° dossard"
        @keyup.enter="submitManualBib"
      />


      <button
        type="button"
        :disabled="
          isProcessing ||
          !manualBib.trim()
        "
        @click="submitManualBib"
      >

        <span
          v-if="isProcessing"
        >
          ...
        </span>

        <span
          v-else
        >
          Valider
        </span>

      </button>

    </div>

  </div>


  <!-- ==================================================
       HISTORIQUE PC UNIQUEMENT
  =================================================== -->

  <div class="desktop-only history-zone">

    <div class="history-header">

      <div>

        <h2>
          Dernières arrivées
        </h2>

        <p>
          Les 10 derniers participants enregistrés par ce scanner.
        </p>

      </div>


      <div class="history-actions">

        <span>
          {{ totalScans }} scan(s)
        </span>


        <button
          v-if="scannerStore.arrivals.length > 0"
          type="button"
          @click="resetScanner"
        >
          Effacer l'historique
        </button>

      </div>

    </div>


    <div
      v-if="recentArrivals.length === 0"
      class="empty-history"
    >

      🏁

      <p>
        Aucune arrivée enregistrée
      </p>

    </div>


    <div
      v-else
      class="history-table"
    >

      <table>

        <thead>

          <tr>

            <th>
              Position
            </th>

            <th>
              Dossard
            </th>

            <th>
              Participant
            </th>

            <th>
              Catégorie
            </th>

            <th>
              Temps
            </th>

            <th>
              Scanner
            </th>

          </tr>

        </thead>


        <tbody>

          <tr
            v-for="arrival in recentArrivals"
            :key="
              arrival.id ||
              `${arrival.participant?.id}-${arrival.position}`
            "
          >

            <td>
              {{ arrival.position }}
            </td>

            <td>
              {{ arrival.participant?.dossard }}
            </td>

            <td>

              {{ arrival.participant?.prenom }}

              {{ arrival.participant?.nom }}

            </td>

            <td>
              {{ arrival.participant?.categorie }}
            </td>

            <td>
              {{ formatTime(arrival.elapsedTime) }}
            </td>

            <td>
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

/* ==================================================
   BASE
   ================================================== */

.scanner-page {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.mobile-only {
  display: none;
}


/* ==================================================
   HEADER
   ================================================== */

.scanner-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.device-name {
  font-size: 14px;
  font-weight: 700;
  color: #0284c7;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.scanner-header h1 {
  margin-top: 8px;
  font-size: 36px;
  line-height: 1;
  font-weight: 900;
  color: #0f172a;
}

.scanner-description {
  margin-top: 10px;
  color: #64748b;
}

.scanner-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #a7f3d0;
  border-radius: 16px;
  background: #ecfdf5;
  color: #047857;
  font-weight: 700;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
}


/* ==================================================
   STATISTIQUES
   ================================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
}

.stat-card p {
  color: #64748b;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 36px;
  color: #0f172a;
}


/* ==================================================
   CAMÉRA
   ================================================== */

.scanner-main {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 32px;
}

.camera-title h2,
.last-arrival-zone h2 {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.camera-title p,
.last-arrival-zone > p {
  margin-top: 4px;
  font-size: 14px;
  color: #64748b;
}

.camera-container {
  margin-top: 16px;
}


/* ==================================================
   RÉSULTAT DU SCAN
   ================================================== */

.scan-result {
  border-radius: 24px;
  color: white;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25);
}

.result-content {
  padding: 40px 20px;
  text-align: center;
}

.result-icon {
  font-size: 72px;
}

.result-label {
  margin-top: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.result-name {
  margin-top: 10px;
  font-size: 40px;
  font-weight: 900;
}

.result-bib,
.result-category,
.result-message {
  margin-top: 10px;
  font-size: 20px;
}

.result-details {
  display: flex;
  justify-content: space-around;
  max-width: 450px;
  margin: 28px auto 0;
  padding: 20px;
  border-radius: 18px;
  background: rgba(255,255,255,0.15);
}

.result-details div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.result-details strong {
  font-size: 26px;
}


/* ==================================================
   SAISIE MANUELLE
   ================================================== */

.manual-zone {
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: white;
}

.manual-zone h2 {
  font-size: 18px;
  font-weight: 800;
}

.manual-zone p {
  margin-top: 4px;
  color: #64748b;
}

.manual-form {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.manual-form input {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  outline: none;
}

.manual-form input:focus {
  border-color: #0ea5e9;
}

.manual-form button {
  padding: 14px 28px;
  border-radius: 12px;
  background: #0284c7;
  color: white;
  font-weight: 800;
}

.manual-form button:disabled {
  opacity: 0.5;
}


/* ==================================================
   HISTORIQUE
   ================================================== */

.history-zone {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: white;
}

.history-header {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.history-header h2 {
  font-size: 20px;
  font-weight: 800;
}

.history-header p {
  color: #64748b;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-actions button {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

.empty-history {
  padding: 50px;
  text-align: center;
  font-size: 48px;
}

.empty-history p {
  margin-top: 12px;
  font-size: 16px;
}

.history-table {
  overflow-x: auto;
}

.history-table table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 14px 20px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.history-table th {
  background: #f8fafc;
}


/* ==================================================
   ANIMATION
   ================================================== */

.scan-enter-active,
.scan-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.scan-enter-from,
.scan-leave-to {
  opacity: 0;
  transform: scale(0.95);
}


/* ==================================================
   VERSION MOBILE
   ================================================== */

@media (max-width: 768px) {

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex;
  }

  .scanner-page {
    gap: 12px;
    width: 100%;
    min-height: calc(100dvh - 20px);
  }


  /* HEADER MOBILE */

  .scanner-header {
    align-items: center;
    padding: 8px 10px;
  }

  .device-name {
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  .scanner-header h1 {
    margin-top: 3px;
    font-size: 22px;
  }

  .scanner-status {
    padding: 8px 10px;
    font-size: 12px;
    border-radius: 12px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
  }


  /* CAMÉRA MOBILE */

  .scanner-main {
    display: block;
  }

  .camera-container {
    margin-top: 0;
    width: 100%;
  }

  .scan-instruction {
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    color: #475569;
    font-size: 13px;
    font-weight: 600;
  }

  .scan-icon {
    font-size: 20px;
  }


  /* SAISIE MANUELLE MOBILE */

  .manual-zone {
    padding: 12px;
    border-radius: 16px;
  }

  .manual-zone h2 {
    font-size: 14px;
  }

  .manual-form {
    margin-top: 8px;
    gap: 8px;
  }

  .manual-form input {
    padding: 12px;
    font-size: 18px;
  }

  .manual-form button {
    padding: 12px 18px;
  }


  /* RÉSULTAT PLEIN ÉCRAN MOBILE */

  .scan-result {
    position: fixed;
    inset: 0;
    z-index: 9999;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 0;
  }

  .result-content {
    width: 100%;
    padding: 30px 20px;
  }

  .result-icon {
    font-size: 90px;
  }

  .result-label {
    margin-top: 20px;
    font-size: 15px;
  }

  .result-name {
    margin-top: 14px;
    font-size: clamp(32px, 10vw, 52px);
    line-height: 1.05;
  }

  .result-bib {
    margin-top: 20px;
    font-size: 24px;
  }

  .result-category {
    font-size: 20px;
  }

  .result-message {
    font-size: 20px;
  }

  .result-details {
    margin-top: 28px;
    padding: 18px;
  }

  .result-details span {
    font-size: 14px;
  }

  .result-details strong {
    font-size: 28px;
  }

}


/* ==================================================
   PETITS TÉLÉPHONES
   ================================================== */

@media (max-width: 400px) {

  .scanner-header h1 {
    font-size: 19px;
  }

  .scanner-status {
    padding: 7px 8px;
    font-size: 11px;
  }

  .manual-form button {
    padding-left: 12px;
    padding-right: 12px;
  }

}

</style>