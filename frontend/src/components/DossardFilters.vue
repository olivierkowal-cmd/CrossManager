<script setup>
const props = defineProps({
  classes: Array,
  categories: Array,
})

const filtreClasse = defineModel("classe")
const filtreCategorie = defineModel("categorie")
const recherche = defineModel("recherche")
</script>

<template>

<div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

  <h2 class="text-xl font-bold mb-5">
    Filtrer les dossards
  </h2>

  <div class="grid md:grid-cols-3 gap-5">

    <div>
      <label class="block mb-2 font-semibold">
        Classe
      </label>

      <select
        v-model="filtreClasse"
        class="w-full rounded-xl border p-3"
      >
        <option value="">Toutes</option>

        <option
          v-for="classe in classes"
          :key="classe"
          :value="classe"
        >
          {{ classe }}
        </option>

      </select>

    </div>

    <div>

      <label class="block mb-2 font-semibold">
        Catégorie
      </label>

      <select
        v-model="filtreCategorie"
        class="w-full rounded-xl border p-3"
      >
        <option value="">Toutes</option>

        <option
          v-for="cat in categories"
          :key="cat"
          :value="cat"
        >
          {{ cat }}
        </option>

      </select>

    </div>

    <div>

      <label class="block mb-2 font-semibold">
        Recherche
      </label>

      <input
        v-model="recherche"
        class="w-full rounded-xl border p-3"
        placeholder="Nom ou prénom"
      >

    </div>

  </div>

</div>

</template>