import { createI18n } from 'vue-i18n';
import { server } from './utils/api';

// Here we define a custom i18n instance. 
// In React, it used i18next with http-backend to dynamically fetch translations from the server.
// For vue-i18n, we can either write a custom loader or just fetch them on app mount.
// Since the user wants to port the i18n logic, we will set up a basic vue-i18n instance
// and provide a helper hook that can dynamically load namespaces similar to i18next-http-backend.

const i18n = createI18n({
  legacy: false,
  locale: 'zh_CN',
  fallbackLocale: 'zh_CN',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    zh_CN: {},
    en_US: {}
  }
});

export default i18n;