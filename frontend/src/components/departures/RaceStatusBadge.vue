<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const styles = {
  waiting: {
    label: "🟡 En attente",
    classes: "bg-yellow-100 text-yellow-700",
  },

  countdown: {
    label: "⏳ Compte à rebours",
    classes: "bg-orange-100 text-orange-700",
  },

  running: {
    label: "🟢 En course",
    classes: "bg-green-100 text-green-700",
  },

  finished: {
    label: "✅ Terminée",
    classes: "bg-blue-100 text-blue-700",
  },
}

const current = styles[props.status] ?? styles.waiting
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
    :class="current.classes"
  >
    {{ current.label }}
  </span>
</template>