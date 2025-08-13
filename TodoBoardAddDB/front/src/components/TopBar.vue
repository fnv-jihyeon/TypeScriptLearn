<script setup lang="ts">
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import { useSessionStore } from "@/stores/useSessionStore";
import router from "@/router";

import type { ERROR_CODES } from "@shared/constants/errorCodes";
import { ERROR_MESSAGES } from "@/constants/errorMessageMap";
import { useMessage } from "naive-ui";

const sessionStore = useSessionStore();
const currentDate = dayjs().format("YYYY-MM-DD (ddd)");
const currentTime = ref(dayjs().format("HH:mm:ss"));
const message = useMessage();

async function handlelogout() {
  try {
    await sessionStore.logout();
    router.push("/login");
  } catch (error: any) {
    const code = (error?.message as ERROR_CODES) ?? "UNKNOWN_ERROR";
    const msg = ERROR_MESSAGES[code] || "로그아웃 중 오류 발생";
    message.error(msg);
  }
}

onMounted(async () => {
  if (!sessionStore.isLoaded) {
    try {
      await sessionStore.checkSession();
    } catch {}
  }

  setInterval(() => {
    currentTime.value = dayjs().format("HH:mm:ss");
  }, 1000);
});
</script>

<template>
  <header class="top-bar">
    <div class="left">{{ currentDate }}</div>
    <div class="right">
      <template v-if="!sessionStore.isLoaded">
        <n-skeleton text style="width: 120px" />
      </template>
      <template v-else>
        <div v-if="sessionStore.user">
          <span>{{ sessionStore.user.username }}</span>
          <n-button size="small" @click="handlelogout" type="error">로그아웃</n-button>
        </div>
        <div v-else>
          <span>로그인하지 않음</span>
        </div>
      </template>
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
