<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const router = useRouter();

function login() {
  if (username.value && password.value) {
    //TODO: 실제 인증 처리 API 연동 필요
    router.push("/");
  }
}
</script>

<template>
  <div class="login-container">
    <n-card title="로그인" class="login-card">
      <n-input v-model:value="username" placeholder="아이디" class="mb-2" />
      <n-input
        v-model:value="password"
        type="password"
        placeholder="비밀번호"
        class="mb-4"
      />
      <n-button type="primary" block @click="login">로그인</n-button>
    </n-card>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center; /* 수직 중앙 정렬 */
  align-items: center; /* 수평 중앙 정렬 */
  background-color: #f5f6f9;
}

.login-card {
  width: 100%;
  max-width: 320px;
  padding: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
