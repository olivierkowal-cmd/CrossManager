<script setup>
import { computed } from "vue"
import QrCode from "./QrCode.vue"

const props = defineProps({

  participant: {
    type: Object,
    required: true,
  },

  settings: {
    type: Object,
    default: () => ({
      schoolName: "CrossManager",
      logo: null,
    }),
  },

  color: {
    type: String,
    default: "#0284c7",
  },

  qrSize: {
    type: String,
    default: "medium",
  },

  showLogo: {
    type: Boolean,
    default: true,
  },

  showName: {
    type: Boolean,
    default: true,
  },

  showClass: {
    type: Boolean,
    default: true,
  },

  showCategory: {
    type: Boolean,
    default: false,
  },

  showQR: {
    type: Boolean,
    default: true,
  },

})

// ==========================
// Taille aperçu QR
// ==========================

const qrClass = computed(() => {

  switch (props.qrSize) {

    case "small":
      return "qr-small"

    case "large":
      return "qr-large"

    case "medium":
    default:
      return "qr-medium"

  }

})

// ==========================
// Nom complet
// ==========================

const fullName = computed(() => {

  const nom =
    props.participant.nom ?? ""

  const prenom =
    props.participant.prenom ?? ""

  return `${nom} ${prenom}`
    .trim()

})
</script>


<template>

  <div
    class="dossard bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
  >

    <!-- ==========================
         BANDEAU ÉTABLISSEMENT
    =========================== -->

    <div
      class="header-band"
      :style="{ backgroundColor: color }"
    >

      <!-- LOGO IMAGE -->

      <img
        v-if="
          showLogo &&
          settings.logo
        "
        :src="settings.logo"
        alt="Logo établissement"
        class="school-logo"
      />


      <!-- LOGO PAR DÉFAUT -->

      <div
        v-else-if="showLogo"
        class="default-logo"
      >
        🏫
      </div>


      <!-- NOM ÉTABLISSEMENT -->

      <div class="school-name">

        {{
          settings.schoolName ||
          "CrossManager"
        }}

      </div>

    </div>


    <!-- ==========================
         NUMÉRO DE DOSSARD
    =========================== -->

    <div
      class="mt-6 text-center"
    >

      <div
        class="text-7xl font-black tracking-wider text-slate-900"
      >
        {{ participant.dossard }}
      </div>

    </div>


    <!-- ==========================
         QR CODE
    =========================== -->

    <div
      v-if="showQR"
      class="flex justify-center mt-6"
    >

      <div
        :class="qrClass"
        class="qr-wrapper"
      >

        <QrCode
          :value="
            participant.qr ||
            `CM-${participant.dossard}`
          "
        />

      </div>

    </div>


    <!-- ==========================
         INFORMATIONS
    =========================== -->

    <div
      class="mt-6 mb-6 text-center px-4"
    >


      <!-- NOM + PRÉNOM -->

      <div
        v-if="showName"
        class="text-2xl font-bold uppercase text-slate-900"
      >

        {{ fullName }}

      </div>


      <!-- CLASSE -->

      <div
        v-if="showClass"
        class="mt-3 text-xl text-slate-700"
      >

        Classe :
        {{ participant.classe || "-" }}

      </div>


      <!-- CATÉGORIE -->

      <div
        v-if="showCategory"
        class="mt-2 text-base font-semibold text-slate-500"
      >

        Catégorie :
        {{ participant.categorie || "-" }}

      </div>

    </div>


    <!-- ==========================
         BANDE COULEUR BASSE
    =========================== -->

    <div
      class="h-3"
      :style="{ backgroundColor: color }"
    ></div>

  </div>

</template>


<style scoped>

.dossard {
  min-height: 520px;
  display: flex;
  flex-direction: column;
}

.header-band {
  min-height: 72px;
  padding: 12px 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 14px;

  color: white;
}

.school-logo {
  width: 52px;
  height: 52px;

  object-fit: contain;

  background: white;

  border-radius: 10px;

  padding: 4px;
}

.default-logo {
  font-size: 32px;
}

.school-name {
  font-size: 1.25rem;
  font-weight: 800;

  text-align: center;
}

.qr-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
}

.qr-small {
  width: 110px;
  height: 110px;
}

.qr-medium {
  width: 150px;
  height: 150px;
}

.qr-large {
  width: 190px;
  height: 190px;
}

.qr-wrapper :deep(canvas),
.qr-wrapper :deep(img),
.qr-wrapper :deep(svg) {
  width: 100% !important;
  height: 100% !important;

  object-fit: contain;
}

@media print {

  .dossard {
    box-shadow: none;
    break-inside: avoid;
  }

}

</style>