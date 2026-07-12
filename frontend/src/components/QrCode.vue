<script setup>
import QRCode from "qrcode"
import { ref, watchEffect } from "vue"

const props = defineProps({
  value: {
    type: String,
    required: true,
  },

  size: {
    type: Number,
    default: 220,
  },
})

const image = ref("")

watchEffect(async () => {
  if (!props.value) {
    image.value = ""
    return
  }

  image.value = await QRCode.toDataURL(props.value, {
    width: props.size,
    margin: 1,
    errorCorrectionLevel: "H",
  })
})
</script>

<template>
  <img
    v-if="image"
    :src="image"
    :style="{
      width: props.size + 'px',
      height: props.size + 'px'
    }"
    alt="QR Code"
  />
</template>