<script setup>
import { computed } from "vue"

const props = defineProps({
  arrivals: {
    type: Array,
    default: () => [],
  },
})

const categories = computed(() => {
  const counts = {}

  props.arrivals.forEach(arrival => {
    const category =
      arrival.categorie ||
      arrival.participant?.categorie ||
      "Sans catégorie"

    counts[category] =
      (counts[category] || 0) + 1
  })

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) =>
      a.name.localeCompare(
        b.name,
        "fr",
        { numeric: true }
      )
    )
})
</script>

<template>
  <div
    class="rounded-3xl border border-slate-200 bg-white shadow-sm"
  >
    <div class="border-b border-slate-200 p-5">
      <h2 class="text-xl font-bold">
        Arrivées par catégorie
      </h2>

      <p class="mt-1 text-sm text-slate-500">
        Répartition des arrivées enregistrées
      </p>
    </div>

    <div
      v-if="categories.length"
      class="grid grid-cols-2 gap-4 p-6 lg:grid-cols-4"
    >
      <div
        v-for="category in categories"
        :key="category.name"
        class="rounded-2xl bg-slate-50 p-5 text-center"
      >
        <p class="text-sm font-semibold text-slate-500">
          {{ category.name }}
        </p>

        <p class="mt-2 text-3xl font-bold text-sky-700">
          {{ category.count }}
        </p>

        <p class="mt-1 text-xs text-slate-400">
          arrivée(s)
        </p>
      </div>
    </div>

    <div
      v-else
      class="p-10 text-center text-slate-400"
    >
      Aucune arrivée enregistrée
    </div>
  </div>
</template>