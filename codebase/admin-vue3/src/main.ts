import { createApp } from 'vue';
import TDesign from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';
import App from './App.vue';
import router from './router';
import { store } from './store';
import i18n from './i18n';
import './assets/iconfont/iconfont.css';
import './style/index.less';

const app = createApp(App);

if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    if (typeof msg === 'string' && msg.includes('Slot "default" invoked outside of the render function')) {
      return;
    }
    console.warn(msg + trace);
  };
}

app.use(TDesign);
app.use(store);
app.use(router);
app.use(i18n);

app.mount('#app');
