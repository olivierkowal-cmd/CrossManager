<script setup>
const settings = [
  { label: 'Mode course', value: 'Automatique' },
  { label: 'Affichage public', value: 'Activé' },
  { label: 'Scan de dossard', value: 'Simulation locale' },
  { label: 'Synchronisation', value: 'Non configurée' },
]
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-medium uppercase tracking-[0.3em] text-sky-600">Paramètres</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">Configuration de l’application</h2>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div v-for="setting in settings" :key="setting.label" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm text-slate-500">{{ setting.label }}</p>
          <p class="mt-2 font-semibold text-slate-900">{{ setting.value }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
