<script setup>
defineProps({
  show: Boolean,
  title: String,
  message: String,
})

const emit = defineEmits(["confirm", "cancel"])
</script>

<template>
  <div
    v-if="show"
    class="overlay"
  >
        <div class="dialog">

        <h2>⚠️ {{ title }}</h2>

        <p>{{ message }}</p>

      <div class="buttons">

        <button
          class="cancel"
          @click="emit('cancel')"
        >
          Annuler
        </button>

        <button
          class="confirm"
          @click="emit('confirm')"
        >
          🗑️ Continuer
        </button>

      </div>

    </div>
  </div>
</template>

<style scoped>
.overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:9999;
}

.dialog{
  width:420px;
  background:white;
  border-radius:20px;
  padding:30px;
  box-shadow:0 20px 60px rgba(0,0,0,.25);
}

.dialog h2{
  margin:0;
  font-size:1.5rem;
}

.dialog p{
  margin:20px 0;
  color:#475569;
  line-height:1.5;
}

.buttons{
  display:flex;
  justify-content:flex-end;
  gap:12px;
}

button{
  border:none;
  padding:12px 18px;
  border-radius:12px;
  cursor:pointer;
  font-weight:700;
}

.cancel{
  background:#e2e8f0;
}

.confirm{
  background:#ef4444;
  color:white;
}
</style>