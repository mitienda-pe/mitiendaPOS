import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './index.css';

// Create the app instance
const app = createApp(App);

// Install plugins
app.use(createPinia());
app.use(router);

// Mount the app
app.mount('#app');
