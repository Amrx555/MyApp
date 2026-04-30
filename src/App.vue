<template>
  <div id="app">
    <NavBar v-if="showNav" />
    <router-view />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";

const route = useRoute();
const showNav = computed(() => route.path !== "/");
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  background: #05050a;
  font-family: "Cairo", sans-serif;
}
@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap");
</style>
