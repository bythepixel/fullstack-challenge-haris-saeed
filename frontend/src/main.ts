import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { serviceWorkerManager } from "./utils/serviceWorker";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

// Register service worker for enhanced caching
serviceWorkerManager.register().then(success => {
  if (success) {
    console.log('🚀 Enhanced caching enabled via Service Worker')
  }
});
