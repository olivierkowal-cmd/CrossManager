<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  "close",
  "validate",
])

const dossard = ref("")

watch(
  () => props.visible,
  (value) => {
    if (value) {
      dossard.value = ""
    }
  }
)

function validate() {

  const value = dossard.value.trim()

  if (!value) return

  emit("validate", value)

  dossard.value = ""

}

function close() {

  dossard.value = ""

  emit("close")

}
</script>

<template>

<div
v-if="visible"
class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
>

<div
class="w-full max-w-md rounded-3xl bg-white shadow-2xl p-8"
>

<h2 class="text-2xl font-bold">

Saisie manuelle

</h2>

<p class="mt-2 text-slate-500">

Le QR Code est illisible ? Entrez le numéro du dossard.

</p>

<input

v-model="dossard"

type="number"

placeholder="Numéro du dossard"

class="mt-6 w-full rounded-xl border border-slate-300 p-4 text-center text-3xl font-bold outline-none focus:border-sky-500"

@keyup.enter="validate"
/>

<div class="mt-8 flex gap-4">

<button

class="flex-1 rounded-xl border border-slate-300 py-3 font-semibold"

@click="close"
>

Annuler

</button>

<button

class="flex-1 rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-700"

@click="validate"
>

Valider

</button>

</div>

</div>

</div>

</template>