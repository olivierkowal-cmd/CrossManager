<script setup>
import { computed } from "vue"
import QrCode from "./QrCode.vue"

const props = defineProps({
  participant: {
    type: Object,
    required: true,
  },
})

const couleur = computed(() => {

  const niveau = props.participant.classe?.charAt(0)

  switch (niveau) {

    case "1":
      return "#3B82F6"

    case "2":
      return "#10B981"

    case "3":
      return "#F97316"

    case "4":
      return "#EF4444"

    case "5":
      return "#8B5CF6"

    case "6":
      return "#334155"

    default:
      return "#64748B"
  }

})
</script>

<template>

<div class="bg-white border rounded-xl shadow overflow-hidden">

  <!-- Logo -->

  <div class="pt-6 flex justify-center">

    <!-- Le logo sera ajouté ensuite -->

    <div class="text-center">

      <div class="text-3xl font-bold tracking-[0.3em] text-sky-600">
        ISM
      </div>

      <div class="text-lg text-slate-600">
        RÈVES
      </div>

    </div>

  </div>

  <!-- Numéro -->

  <div class="mt-5 text-center">

    <div class="text-7xl font-black tracking-wider">
      {{ participant.dossard }}
    </div>

  </div>

  <!-- QR -->

  <div class="flex justify-center mt-6">

    <QrCode
      :value="participant.qr"
    />

  </div>

  <!-- Informations -->

  <div class="mt-6 mb-6 text-center">

    <div class="text-3xl font-bold uppercase">
      {{ participant.nom }}
    </div>

    <div class="text-2xl mt-2">
      {{ participant.prenom }}
    </div>

    <div class="mt-3 text-xl">
      Classe {{ participant.classe }}
    </div>

  </div>

  <!-- Bande couleur -->

  <div
    class="h-8"
    :style="{ backgroundColor: couleur }"
  ></div>

</div>

</template>