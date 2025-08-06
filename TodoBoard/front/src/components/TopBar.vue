<script setup lang="ts">
import { ref, onMounted } from "vue";
import dayjs from "dayjs";

import { useSessionStore } from "@/stores/useSessionStore";

const sessionStore = useSessionStore();
const currentDate = dayjs().format("YYYY-MM-DD (ddd)");
const currentTime = ref(dayjs().format("HH:mm:ss"));

async function logout() {
  await sessionStore.logout();
}

onMounted(() => {
  setInterval(() => {
    currentTime.value = dayjs().format("HH:mm:ss");
  }, 1000);
});
</script>

<template>
  <header class="top-bar">
    <div class="left">📅 {{ currentDate }}</div>
    <div class="right">
      <div v-if="sessionStore.user">
        <span>{{ sessionStore.user.username }}</span>
        <n-button size="small" @click="logout">로그아웃</n-button>
      </div>
      {{ currentTime }}
    </div>
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
