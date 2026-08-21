<script setup>

defineProps({

  events: {
    type: Array,
    default: () => [],
  },

})


// =====================================================
// APPARENCE DE L'ÉVÉNEMENT
// =====================================================

function eventStyle(event) {

  // Erreur
  if (
    event.type === "error" ||
    event.level === "error"
  ) {

    return {
      icon: "❌",
      badge: "bg-red-500/20 text-red-400",
      border: "border-red-500/30",
    }

  }


  // Avertissement / doublon
  if (
    event.type === "warning" ||
    event.level === "warning"
  ) {

    return {
      icon: "⚠️",
      badge: "bg-orange-500/20 text-orange-400",
      border: "border-orange-500/30",
    }

  }


  // Arrivée
  if (event.type === "arrival") {

    return {
      icon: "🏃",
      badge: "bg-emerald-500/20 text-emerald-400",
      border: "border-emerald-500/30",
    }

  }


  // Départ
  if (event.type === "start") {

    return {
      icon: "🏁",
      badge: "bg-sky-500/20 text-sky-400",
      border: "border-sky-500/30",
    }

  }


  // Fin de course
  if (event.type === "finish") {

    return {
      icon: "🏆",
      badge: "bg-blue-500/20 text-blue-400",
      border: "border-blue-500/30",
    }

  }


  // Scanner
  if (event.type === "scanner") {

    return {
      icon: "📱",
      badge: "bg-purple-500/20 text-purple-400",
      border: "border-purple-500/30",
    }

  }


  // Événement général
  return {
    icon: "ℹ️",
    badge: "bg-slate-500/20 text-slate-400",
    border: "border-slate-500/30",
  }

}


// =====================================================
// NOM DU TYPE
// =====================================================

function eventLabel(event) {

  switch (event.type) {

    case "start":
      return "Départ"

    case "arrival":
      return "Arrivée"

    case "finish":
      return "Course terminée"

    case "scanner":
      return "Scanner"

    case "warning":
      return "Avertissement"

    case "error":
      return "Erreur"

    default:
      return "Information"

  }

}

</script>


<template>

<div
  class="rounded-3xl bg-slate-950 p-6 text-white"
>

  <!-- =================================================
       TITRE
  ================================================== -->

  <div class="flex items-center justify-between">

    <div>

      <h2 class="text-2xl font-black">
        📜 Activité
      </h2>

      <p class="mt-1 text-sm text-slate-400">
        Derniers événements du cross
      </p>

    </div>

    <div
      class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-400"
    >

      {{ events.length }} événement{{ events.length > 1 ? "s" : "" }}

    </div>

  </div>


  <!-- =================================================
       LISTE
  ================================================== -->

  <div class="mt-5 space-y-3">

    <div
      v-for="event in events"
      :key="event.id"
      class="rounded-2xl border bg-slate-900 p-4"
      :class="eventStyle(event).border"
    >

      <div class="flex items-start gap-3">

        <!-- ICÔNE -->

        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
          :class="eventStyle(event).badge"
        >

          {{ eventStyle(event).icon }}

        </div>


        <!-- CONTENU -->

        <div class="min-w-0 flex-1">

          <div
            class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          >

            <span
              class="text-xs font-bold uppercase tracking-wider"
              :class="
                eventStyle(event).badge
                  .replace('bg-', 'text-')
              "
            >

              {{ eventLabel(event) }}

            </span>


            <span
              class="text-xs text-slate-500"
            >

              {{
                new Date(
                  event.timestamp
                ).toLocaleTimeString(
                  "fr-BE"
                )
              }}

            </span>

          </div>


          <!-- MESSAGE -->

          <p
            class="mt-1 font-medium text-white"
          >

            {{ event.message }}

          </p>

        </div>

      </div>

    </div>


    <!-- =================================================
         AUCUN ÉVÉNEMENT
    ================================================== -->

    <div
      v-if="events.length === 0"
      class="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-400"
    >

      📭 Aucun événement pour le moment.

    </div>

  </div>

</div>

</template>