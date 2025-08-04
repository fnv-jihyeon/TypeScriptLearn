<script setup lang="ts">
import { ref, onMounted } from "vue";
import dayjs from "dayjs";

const currentDate = dayjs().format("YYYY-MM-DD (ddd)");
const currentTime = ref(dayjs().format("HH:mm:ss"));

onMounted(() => {
  setInterval(() => {
    currentTime.value = dayjs().format("HH:mm:ss");
  }, 1000);
});
</script>

<template>
  <header class="top-bar">
    <div class="left">📅 {{ currentDate }}</div>
    <div class="right">{{ currentTime }}</div>
  </header>
</template>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}
</style>
