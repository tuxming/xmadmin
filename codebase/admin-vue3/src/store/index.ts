import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export const store = createPinia();
store.use(piniaPluginPersistedstate);

export * from './modules/user';
export * from './modules/menu';
export * from './modules/theme';