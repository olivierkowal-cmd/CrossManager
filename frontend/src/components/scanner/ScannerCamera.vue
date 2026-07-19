<script setup>
import {
  ref,
  onUnmounted,
  nextTick,
} from "vue"

import {
  Html5Qrcode,
} from "html5-qrcode"


const emit =
  defineEmits([
    "scanned",
  ])


const readerId =
  "crossmanager-reader"


const isRunning =
  ref(false)

const isStarting =
  ref(false)

const cameraError =
  ref("")

const lastCode =
  ref("")


let html5QrCode =
  null

let lock =
  false


// ==================================================
// CHOISIR LA CAMÉRA ARRIÈRE
// ==================================================

function chooseCamera(
  cameras
) {

  if (
    !cameras ||
    cameras.length === 0
  ) {

    return null

  }


  // Chercher une caméra dont le nom
  // indique qu'il s'agit de la caméra arrière

  const backCamera =
    cameras.find(
      camera => {

        const label =
          String(
            camera.label || ""
          )
            .toLowerCase()


        return (
          label.includes("back") ||
          label.includes("rear") ||
          label.includes("environment") ||
          label.includes("arrière") ||
          label.includes("traseira")
        )

      }
    )


  if (
    backCamera
  ) {

    return backCamera.id

  }


  // Sur beaucoup de téléphones,
  // la dernière caméra de la liste
  // correspond à la caméra arrière.

  return cameras[
    cameras.length - 1
  ].id

}


// ==================================================
// DÉMARRER LA CAMÉRA
// ==================================================

async function startScanner() {

  if (
    isRunning.value ||
    isStarting.value
  ) {

    return

  }


  isStarting.value =
    true

  cameraError.value =
    ""


  try {

    // ----------------------------------------------
    // Vérifier HTTPS
    // ----------------------------------------------

    if (
      !window.isSecureContext
    ) {

      throw new Error(
        "HTTPS_REQUIRED"
      )

    }


    // ----------------------------------------------
    // Vérifier support caméra
    // ----------------------------------------------

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      throw new Error(
        "CAMERA_NOT_SUPPORTED"
      )

    }


    // ----------------------------------------------
    // Demander explicitement l'autorisation caméra
    // ----------------------------------------------

    const permissionStream =
      await navigator.mediaDevices
        .getUserMedia({

          video: true,

          audio: false,

        })


    // L'autorisation est obtenue.
    // On ferme immédiatement ce flux temporaire.

    permissionStream
      .getTracks()
      .forEach(
        track => {

          track.stop()

        }
      )


    // ----------------------------------------------
    // Récupérer les caméras disponibles
    // ----------------------------------------------

    const cameras =
      await Html5Qrcode
        .getCameras()


    console.log(
      "📷 Caméras détectées :",
      cameras
    )


    if (
      !cameras ||
      cameras.length === 0
    ) {

      throw new Error(
        "NO_CAMERA"
      )

    }


    // ----------------------------------------------
    // Choisir la caméra arrière
    // ----------------------------------------------

    const cameraId =
      chooseCamera(
        cameras
      )


    console.log(
      "📷 Caméra sélectionnée :",
      cameraId
    )


    // ----------------------------------------------
    // Attendre que le DOM soit prêt
    // ----------------------------------------------

    await nextTick()


    // ----------------------------------------------
    // Nettoyer ancienne instance
    // ----------------------------------------------

    if (
      html5QrCode
    ) {

      try {

        if (
          isRunning.value
        ) {

          await html5QrCode.stop()

        }


        await html5QrCode.clear()

      }

      catch (
        error
      ) {

        console.warn(
          "Nettoyage caméra :",
          error
        )

      }


      html5QrCode =
        null

    }


    // ----------------------------------------------
    // Créer scanner
    // ----------------------------------------------

    html5QrCode =
      new Html5Qrcode(
        readerId
      )


    // ----------------------------------------------
    // Démarrer scanner
    // ----------------------------------------------

    await html5QrCode.start(

      cameraId,

      {

        fps: 10,


        qrbox: (
          width,
          height
        ) => {

          const minimum =
            Math.min(
              width,
              height
            )


          const size =
            Math.floor(
              minimum * 0.7
            )


          return {

            width:
              size,

            height:
              size,

          }

        },

      },


      // --------------------------------------------
      // QR CODE DÉTECTÉ
      // --------------------------------------------

      decodedText => {

        if (
          lock
        ) {

          return

        }


        lock =
          true


        const code =
          String(
            decodedText
          )
            .trim()


        lastCode.value =
          code


        console.log(
          "📷 QR détecté :",
          code
        )


        emit(
          "scanned",
          code
        )


        setTimeout(
          () => {

            lock =
              false

          },

          1500
        )

      },


      // Erreurs normales pendant
      // la recherche d'un QR Code

      () => {}

    )


    isRunning.value =
      true


    console.log(
      "✅ Caméra démarrée"
    )

  }

  catch (
    error
  ) {

    console.error(
      "❌ Erreur caméra :",
      error
    )


    isRunning.value =
      false


    const errorName =
      error?.name || ""

    const errorMessage =
      String(
        error?.message ||
        error ||
        ""
      )


    if (
      errorMessage ===
      "HTTPS_REQUIRED"
    ) {

      cameraError.value =
        "La caméra nécessite une connexion HTTPS."

    }

    else if (
      errorMessage ===
      "CAMERA_NOT_SUPPORTED"
    ) {

      cameraError.value =
        "Ce navigateur ne permet pas l'accès à la caméra."

    }

    else if (
      errorMessage ===
      "NO_CAMERA"
    ) {

      cameraError.value =
        "Aucune caméra n'a été détectée sur ce téléphone."

    }

    else if (
      errorName ===
        "NotAllowedError" ||
      errorMessage
        .toLowerCase()
        .includes(
          "permission"
        )
    ) {

      cameraError.value =
        "L'accès à la caméra est bloqué. Autorisez la caméra pour ce site dans les paramètres de votre navigateur."

    }

    else if (
      errorName ===
      "NotFoundError"
    ) {

      cameraError.value =
        "Aucune caméra disponible n'a été trouvée."

    }

    else if (
      errorName ===
      "NotReadableError"
    ) {

      cameraError.value =
        "La caméra est déjà utilisée par une autre application. Fermez les autres applications utilisant la caméra puis réessayez."

    }

    else {

      cameraError.value =
        `Impossible de démarrer la caméra. ${errorMessage}`

    }

  }

  finally {

    isStarting.value =
      false

  }

}


// ==================================================
// ARRÊTER LA CAMÉRA
// ==================================================

async function stopScanner() {

  try {

    if (
      html5QrCode &&
      isRunning.value
    ) {

      await html5QrCode.stop()

    }


    if (
      html5QrCode
    ) {

      await html5QrCode.clear()

    }

  }

  catch (
    error
  ) {

    console.warn(
      "Erreur arrêt caméra :",
      error
    )

  }


  html5QrCode =
    null

  isRunning.value =
    false

}


// ==================================================
// DÉMONTAGE
// ==================================================

onUnmounted(
  async () => {

    await stopScanner()

  }
)
</script>


<template>

<div class="scanner-camera">

  <div class="camera-wrapper">


    <!-- ==================================================
         CAMÉRA
    =================================================== -->

    <div
      :id="readerId"
      class="reader"
    ></div>


    <!-- ==================================================
         CAMÉRA NON DÉMARRÉE
    =================================================== -->

    <div
      v-if="
        !isRunning &&
        !isStarting
      "
      class="camera-overlay"
    >

      <div class="camera-icon">

        📷

      </div>


      <h2>

        Scanner QR

      </h2>


      <p>

        Activez la caméra pour scanner
        les dossards.

      </p>


      <button
        type="button"
        class="start-button"
        @click="startScanner"
      >

        📷 Activer la caméra

      </button>

    </div>


    <!-- ==================================================
         DÉMARRAGE
    =================================================== -->

    <div
      v-if="isStarting"
      class="camera-overlay"
    >

      <div class="loading-icon">

        📷

      </div>


      <h2>

        Activation de la caméra...

      </h2>


      <p>

        Autorisez l'accès à la caméra
        si votre téléphone vous le demande.

      </p>

    </div>

  </div>


  <!-- ==================================================
       ERREUR
  =================================================== -->

  <div
    v-if="cameraError"
    class="camera-error"
  >

    <strong>

      ⚠️ Problème caméra

    </strong>


    <p>

      {{ cameraError }}

    </p>


    <button
      type="button"
      @click="startScanner"
    >

      Réessayer

    </button>

  </div>


  <!-- ==================================================
       ÉTAT
  =================================================== -->

  <div class="camera-status">

    <span
      :class="[
        'status-dot',
        isRunning
          ? 'active'
          : 'inactive'
      ]"
    ></span>


    <span>

      {{
        isRunning
          ? "Caméra active — prête à scanner"
          : "Caméra inactive"
      }}

    </span>

  </div>


  <!-- ==================================================
       DERNIER QR
  =================================================== -->

  <div class="last-qr">

    <p>

      Dernier QR détecté

    </p>


    <strong>

      {{
        lastCode ||
        "—"
      }}

    </strong>

  </div>

</div>

</template>


<style scoped>

.scanner-camera {

  width: 100%;

}


.camera-wrapper {

  position: relative;

  width: 100%;

  min-height: 420px;

  overflow: hidden;

  border-radius: 24px;

  background: #0f172a;

}


.reader {

  width: 100%;

  min-height: 420px;

}


.camera-overlay {

  position: absolute;

  inset: 0;

  z-index: 20;


  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;


  gap: 16px;

  padding: 24px;


  background: #0f172a;

  color: white;


  text-align: center;

}


.camera-overlay h2 {

  font-size: 26px;

  font-weight: 900;

}


.camera-overlay p {

  max-width: 320px;

  color: #cbd5e1;

}


.camera-icon,
.loading-icon {

  font-size: 72px;

}


.start-button {

  width: min(
    90%,
    320px
  );


  min-height: 60px;


  margin-top: 10px;


  padding: 14px 24px;


  border: 0;

  border-radius: 16px;


  background: #0284c7;

  color: white;


  font-size: 19px;

  font-weight: 900;


  cursor: pointer;

}


.camera-error {

  margin-top: 12px;

  padding: 16px;


  border-radius: 16px;


  background: #fee2e2;

  color: #991b1b;

}


.camera-error p {

  margin-top: 6px;

}


.camera-error button {

  margin-top: 12px;


  padding: 10px 18px;


  border-radius: 10px;


  background: #b91c1c;

  color: white;


  font-weight: 800;

}


.camera-status {

  display: flex;

  align-items: center;

  justify-content: center;


  gap: 8px;


  margin-top: 12px;


  font-size: 13px;

  font-weight: 700;

  color: #475569;

}


.status-dot {

  width: 10px;

  height: 10px;


  border-radius: 50%;

}


.status-dot.active {

  background: #10b981;

}


.status-dot.inactive {

  background: #ef4444;

}


.last-qr {

  margin-top: 16px;

  padding: 16px;


  border: 1px solid #e2e8f0;

  border-radius: 16px;


  background: #f8fafc;

}


.last-qr p {

  font-size: 13px;

  color: #64748b;

}


.last-qr strong {

  display: block;

  margin-top: 6px;


  font-family: monospace;

  font-size: 22px;

}


:deep(video) {

  display: block !important;

  width: 100% !important;

  height: 420px !important;

  object-fit: cover !important;

}


:deep(canvas) {

  display: none !important;

}


/* ==================================================
   MOBILE
================================================== */

@media (
  max-width: 768px
) {

  .camera-wrapper {

    min-height: 58dvh;

    border-radius: 16px;

  }


  .reader {

    min-height: 58dvh;

  }


  :deep(video) {

    width: 100% !important;

    height: 58dvh !important;

    min-height: 380px !important;

    object-fit: cover !important;

  }


  .last-qr {

    display: none;

  }


  .camera-icon,
  .loading-icon {

    font-size: 80px;

  }

}

</style>
