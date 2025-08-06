<script setup lang-="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { signup } from "@/api/auth";
import { useSessionStore } from "@/stores/useSessionStore";
import { useMessage } from "naive-ui";

const router = useRouter();
const sessionStore = useSessionStore();
const message = useMessage();

const form = ref({
  username: "",
  email: "",
  password: "",
});

const handleSignup = async () => {
  try {
    const response = await signup({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    });
    if (response.data.success) {
      message.success("회원가입이 완료되었습니다.");
      sessionStore.setSession(response.data);
      router.push("/login");
    } else {
      errorMsg.value = response.data.errorCode || "UNKNOWN_ERROR";
      message.error(`회원가입 실패: ${errorMsg.value}`);
    }
  } catch (error) {
    errorMsg.value = "UNKNOWN_ERROR";
    message.error(`회원가입 중 오류 발생: ${errorMsg.value}`);
  }
};
</script>

<template>
  <div class="signup-container">
    <n-card title="회원가입" class="signup-card">
      <n-form :model="form" ref="formRef">
        <n-form-item label="아이디" path="username">
          <n-input
            v-model:value="form.username"
            placeholder="아이디를 입력하세요"
          />
        </n-form-item>
        <n-form-item label="이메일" path="email">
          <n-input
            v-model:value="form.email"
            placeholder="이메일을 입력하세요"
          />
        </n-form-item>
        <n-form-item label="비밀번호" path="password">
          <n-input
            type="password"
            v-model:value="form.password"
            placeholder="비밀번호를 입력하세요"
          />
        </n-form-item>
        <n-button type="primary" block @click="handleSignup">회원가입</n-button>
      </n-form>
    </n-card>
  </div>
</template>

<style scoped>
.signup-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f6f9;
}

.signup-card {
  width: 100%;
  max-width: 360px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
