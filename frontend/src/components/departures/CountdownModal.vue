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
      class="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden bg-slate-950"
    >

      <!-- =================================================
           CONTENU CENTRAL
      ================================================== -->

      <div
        class="flex w-full max-w-5xl flex-col items-center justify-center px-6 text-center text-white"
      >

        <!-- =================================================
             ÉCOLE
        ================================================== -->

        <p
          class="text-xl font-bold uppercase tracking-[0.55em] text-sky-400 sm:text-2xl md:text-3xl"
        >

          ISM RÈVES

        </p>


        <!-- =================================================
             TITRE
        ================================================== -->

        <h2
          class="mt-5 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl"
        >

          Départ officiel

        </h2>


        <!-- =================================================
             COURSE
        ================================================== -->

        <p
          class="mt-8 text-2xl font-bold sm:text-3xl md:text-4xl"
        >

          {{ title }}

        </p>


        <!-- =================================================
             PARTICIPANTS
        ================================================== -->

        <p
          class="mt-2 text-lg text-slate-300 sm:text-xl md:text-2xl"
        >

          {{ participants }} participants

        </p>


        <!-- =================================================
             COMPTE À REBOURS
        ================================================== -->

        <div
          class="mt-10 flex h-64 w-64 items-center justify-center rounded-full border-[7px] shadow-2xl sm:h-72 sm:w-72 md:mt-12 md:h-80 md:w-80"
          :class="
            value === 'GO !'
              ? 'border-emerald-400 bg-emerald-600'
              : 'border-sky-400 bg-sky-700'
          "
        >

          <span
            class="font-black leading-none text-white"
            :class="
              value === 'GO !'
                ? 'text-6xl sm:text-7xl md:text-8xl'
                : 'text-[110px] sm:text-[130px] md:text-[150px]'
            "
          >

            {{ value }}

          </span>

        </div>

      </div>

    </div>

  </transition>

</template>


<style scoped>

.fade-enter-active,
.fade-leave-active {

  transition:
    opacity 0.25s ease;

}


.fade-enter-from,
.fade-leave-to {

  opacity: 0;

}

</style>