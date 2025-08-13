import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useSessionStore } from "@/stores/useSessionStore";

const app = createApp(App);
app.use(createPinia());

const sessionStore = useSessionStore();

try {
  await sessionStore.checkSession();
} catch {}

app.use(router);
app.mount("#app");
