<script setup>
import { computed, ref } from "vue"
import { useRaceStore } from "../stores/raceStore"

const raceStore = useRaceStore()

// ==========================
// Paramètres système
// ==========================

const systemSettings = [
  {
    label: "Mode course",
    value: "Automatique",
  },
  {
    label: "Affichage public",
    value: "Activé",
  },
  {
    label: "Scan de dossard",
    value: "Simulation locale",
  },
  {
    label: "Synchronisation",
    value: "Non configurée",
  },
]

// ==========================
// Paramètres établissement
// ==========================

const schoolName = computed({
  get() {
    return raceStore.settings.schoolName
  },

  set(value) {
    raceStore.settings.schoolName = value
  },
})

const eventName = computed({
  get() {
    return raceStore.settings.eventName
  },

  set(value) {
    raceStore.settings.eventName = value
  },
})

// ==========================
// Logo
// ==========================

const fileInput = ref(null)

function selectLogo() {
  fileInput.value?.click()
}

function handleLogo(event) {

  const file =
    event.target.files?.[0]

  if (!file) {
    return
  }

  // Vérification du type
  if (!file.type.startsWith("image/")) {

    alert(
      "Veuillez sélectionner une image."
    )

    event.target.value = ""

    return
  }

  // Limite : 2 Mo
  const maxSize =
    2 * 1024 * 1024

  if (file.size > maxSize) {

    alert(
      "Le logo est trop volumineux. Taille maximale : 2 Mo."
    )

    event.target.value = ""

    return
  }

  const reader =
    new FileReader()

  reader.onload = () => {

    raceStore.settings.logo =
      reader.result

  }

  reader.onerror = () => {

    alert(
      "Impossible de lire le fichier."
    )

  }

  reader.readAsDataURL(file)

}

function removeLogo() {

  raceStore.settings.logo = null

  if (fileInput.value) {
    fileInput.value.value = ""
  }

}

// ==========================
// Reset
// ==========================

function resetSettings() {

  if (
    !confirm(
      "Réinitialiser les paramètres de l'application ?"
    )
  ) {
    return
  }

  raceStore.settings.schoolName =
    "ISM Rèves"

  raceStore.settings.eventName =
    "Cross 2026"

  raceStore.settings.logo =
    null

  raceStore.settings.apiUrl =
    ""

  raceStore.settings.autoBeep =
    true

  raceStore.settings.autoFullscreen =
    true

}
</script>


<template>

  <section class="space-y-6">

    <!-- ==========================
         TITRE
    =========================== -->

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <p
        class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600"
      >
        Paramètres
      </p>

      <h2
        class="mt-2 text-2xl font-semibold text-slate-900"
      >
        Configuration de l’application
      </h2>

      <p
        class="mt-2 text-slate-500"
      >
        Configurez votre établissement et votre événement sportif.
      </p>

    </div>


    <!-- ==========================
         ÉTABLISSEMENT
    =========================== -->

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <h3
        class="text-xl font-semibold text-slate-900"
      >
        🏫 Établissement
      </h3>

      <p
        class="mt-1 text-sm text-slate-500"
      >
        Ces informations apparaîtront sur les dossards et les documents exportés.
      </p>


      <div
        class="mt-6 grid gap-6 md:grid-cols-2"
      >

        <!-- NOM ÉCOLE -->

        <div>

          <label
            class="block text-sm font-semibold text-slate-700"
          >
            Nom de l'établissement
          </label>

          <input
            v-model="schoolName"
            type="text"
            placeholder="ISM Rèves"
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

        </div>


        <!-- NOM ÉVÉNEMENT -->

        <div>

          <label
            class="block text-sm font-semibold text-slate-700"
          >
            Nom de l'événement
          </label>

          <input
            v-model="eventName"
            type="text"
            placeholder="Cross 2026"
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />

        </div>

      </div>

    </div>


    <!-- ==========================
         LOGO
    =========================== -->

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <div
        class="flex flex-wrap items-start justify-between gap-4"
      >

        <div>

          <h3
            class="text-xl font-semibold text-slate-900"
          >
            🖼️ Logo de l'établissement
          </h3>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Le logo pourra apparaître sur les dossards et les documents PDF.
          </p>

        </div>


        <!-- INPUT CACHÉ -->

        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          class="hidden"
          @change="handleLogo"
        />

      </div>


      <div
        class="mt-6"
      >

        <!-- AUCUN LOGO -->

        <div
          v-if="!raceStore.settings.logo"
          class="flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8"
        >

          <div
            class="text-5xl"
          >
            🏫
          </div>

          <p
            class="mt-4 font-semibold text-slate-700"
          >
            Aucun logo sélectionné
          </p>

          <p
            class="mt-1 text-sm text-slate-500"
          >
            Formats acceptés : PNG, JPG et WEBP
          </p>

          <button
            type="button"
            class="mt-5 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
            @click="selectLogo"
          >
            Choisir un logo
          </button>

        </div>


        <!-- APERÇU LOGO -->

        <div
          v-else
          class="rounded-2xl border border-slate-200 bg-slate-50 p-6"
        >

          <div
            class="flex flex-wrap items-center gap-8"
          >

            <div
              class="flex h-40 w-40 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >

              <img
                :src="raceStore.settings.logo"
                alt="Logo de l'établissement"
                class="max-h-full max-w-full object-contain"
              />

            </div>


            <div>

              <p
                class="font-semibold text-slate-900"
              >
                Logo actuel
              </p>

              <p
                class="mt-1 text-sm text-slate-500"
              >
                Ce logo sera utilisé lors de la génération des dossards.
              </p>


              <div
                class="mt-5 flex flex-wrap gap-3"
              >

                <button
                  type="button"
                  class="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
                  @click="selectLogo"
                >
                  Changer le logo
                </button>

                <button
                  type="button"
                  class="rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                  @click="removeLogo"
                >
                  Supprimer le logo
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>


    <!-- ==========================
         PARAMÈTRES SYSTÈME
    =========================== -->

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <h3
        class="text-xl font-semibold text-slate-900"
      >
        ⚙️ Configuration système
      </h3>


      <div
        class="mt-6 grid gap-4 md:grid-cols-2"
      >

        <div
          v-for="setting in systemSettings"
          :key="setting.label"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >

          <p
            class="text-sm text-slate-500"
          >
            {{ setting.label }}
          </p>

          <p
            class="mt-2 font-semibold text-slate-900"
          >
            {{ setting.value }}
          </p>

        </div>

      </div>

    </div>


    <!-- ==========================
         RÉINITIALISATION
    =========================== -->

    <div
      class="rounded-3xl border border-red-200 bg-white p-6 shadow-sm"
    >

      <h3
        class="text-xl font-semibold text-red-700"
      >
        Réinitialiser les paramètres
      </h3>

      <p
        class="mt-2 text-sm text-slate-500"
      >
        Cette action remet le nom de l'établissement, le nom de l'événement et le logo à leurs valeurs par défaut.
      </p>

      <button
        type="button"
        class="mt-5 rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
        @click="resetSettings"
      >
        Réinitialiser
      </button>

    </div>

  </section>

</template>