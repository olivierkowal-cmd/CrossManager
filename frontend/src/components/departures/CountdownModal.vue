<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: "",
  },

  participants: {
    type: Number,
    default: 0,
  },

  value: {
    type: [String, Number],
    default: "",
  },
})
</script>

<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
    >
      <div class="text-center text-white">

        <p class="mb-4 text-3xl font-bold tracking-[0.35em] text-sky-400">
          ISM RÈVES
        </p>

        <h2 class="text-5xl font-extrabold">
          Départ officiel
        </h2>

        <p class="mt-8 text-3xl font-semibold">
          {{ title }}
        </p>

        <p class="mt-2 text-xl text-slate-300">
          {{ participants }} participants
        </p>

        <div
          class="mt-16 flex h-64 w-64 items-center justify-center rounded-full border-8"
          :class="value === 'GO !'
            ? 'border-green-500 bg-green-600'
            : 'border-sky-500 bg-sky-700'"
        >
          <span class="text-[120px] font-black">
            {{ value }}
          </span>
        </div>

      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active{
  transition:opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to{
  opacity:0;
}
</style>