<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "@/stores/useSessionStore";
import type { ERROR_CODES } from "@shared/constants/errorCodes";
import { ERROR_MESSAGES } from "@/constants/errorMessageMap";
import { EyeOutline, EyeOffOutline } from "@vicons/ionicons5";
import { useMessage } from "naive-ui";

const username = ref("");
const password = ref("");
const router = useRouter();
const sessionStore = useSessionStore();
const message = useMessage();
const isLoading = ref(false);
const showPassword = ref(false);

async function login() {
  if (!username.value || !password.value) {
    message.error("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  isLoading.value = true;

  try {
    await sessionStore.login(username.value, password.value);
    message.success("로그인 성공!");
    router.push("/schedule");
  } catch (error: any) {
    const code = (error?.message as ERROR_CODES) ?? "UNKNOWN_ERROR";
    const msg = ERROR_MESSAGES[code] ?? "로그인에 실패했습니다.";
    message.error(msg);
  } finally {
    isLoading.value = false;
    username.value = "";
    password.value = "";
  }
}

const goToSignup = () => {
  router.push("/signup");
};
</script>

<template>
  <div class="login-container">
    <n-card title="로그인" class="login-card" data-cy="login-card">
      <n-input v-model:value="username" placeholder="아이디" autocomplete="off" class="mb-2" :input-props="{ 'data-cy': 'username' }" />
      <n-input v-model:value="password" :type="showPassword ? 'text' : 'password'" placeholder="비밀번호" autocomplete="off" class="mb-4" :input-props="{ 'data-cy': 'password' }">
        <template #suffix>
          <n-icon :component="showPassword ? EyeOffOutline : EyeOutline" style="cursor: pointer" @click="showPassword = !showPassword" />
        </template>
      </n-input>
      <n-button type="primary" block :loading="isLoading" @click="login" data-cy="login-submit">로그인</n-button>
      <n-button secondary block @click="goToSignup"> 회원가입 </n-button>
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
