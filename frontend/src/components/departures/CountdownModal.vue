<script setup>
const props = defineProps({
  visible: Boolean,
  title: String,
  participants: Number,
  value: [String, Number],

  flash: {
    type: String,
    default: "",
  },
})
</script>

<template>

<transition name="overlay">

<div
v-if="visible"
class="overlay"
:class="{
flashBlue: flash === 'blue',
flashGreen: flash === 'green'
}"
>

<div class="content">

<h1 class="logo">

ISM RÈVES

</h1>

<div class="line"></div>

<h2 class="title">

DÉPART OFFICIEL

</h2>

<p class="race">

{{ title }}

</p>

<p class="participants">

👥 {{ participants }} participants

</p>

<div
class="circle"
:class="{ go: value === 'GO !' }"
>

<span
class="number"
:key="value"
>

{{ value }}

</span>

</div>

</div>

</div>

</transition>

</template>

<style scoped>

.overlay{

position:fixed;
inset:0;

display:flex;
justify-content:center;
align-items:center;

background:#000;

transition:.18s;

z-index:9999;

}

.flashBlue{

background:#082f49;

}

.flashGreen{

background:#052e16;

}

.content{

display:flex;
flex-direction:column;
align-items:center;

color:white;

}

.logo{

font-size:3rem;

letter-spacing:.45em;

color:#38bdf8;

margin:0;

}

.line{

width:220px;

height:4px;

background:#38bdf8;

border-radius:999px;

margin-top:18px;

}

.title{

margin-top:30px;

font-size:3rem;

font-weight:900;

}

.race{

margin-top:35px;

font-size:2.8rem;

font-weight:700;

text-align:center;

}

.participants{

margin-top:12px;

font-size:1.5rem;

color:#cbd5e1;

}

.circle{

margin-top:45px;

width:300px;

height:300px;

border-radius:50%;

display:flex;
justify-content:center;
align-items:center;

border:10px solid #38bdf8;

background:#0f4aa8;

animation:pulse 1s infinite;

transition:.2s;

}

.go{

background:#16a34a;

border-color:#22c55e;

box-shadow:0 0 90px #22c55e;

}

.number{

font-size:8rem;

font-weight:900;

animation:zoom .9s;

}

.overlay-enter-active,
.overlay-leave-active{

transition:.25s;

}

.overlay-enter-from,
.overlay-leave-to{

opacity:0;

}

@keyframes zoom{

0%{

transform:scale(.2);

opacity:0;

}

35%{

transform:scale(1.25);

}

100%{

transform:scale(1);

}

}

@keyframes pulse{

0%{

transform:scale(1);

}

50%{

transform:scale(1.03);

}

100%{

transform:scale(1);

}

}

</style>