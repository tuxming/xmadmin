import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi, {HttpBackendOptions } from 'i18next-http-backend';
import { server } from "../common/api";

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .use(HttpApi)
    .use(LanguageDetector)
    .init<HttpBackendOptions>({
        // load: 'languageOnly',  en_US, en_FR => en, zh_CN, zh_TW, zh_HK =>  zh 
        saveMissing: true,
        backend: {
            loadPath: server+'/public/locales?lng={{lng}}&ns={{ns}}',
            addPath: server+'/public/localesAdd?lng={{lng}}&ns={{ns}}',

            // allow cross domain requests
            crossDomain: true,

            // allow credentials on cross domain requests
            withCredentials: true,
        },

        // the translations
        // (tip move them in a JSON file and import them,
        // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
        // allow cross domain requests

        lng: "zh_CN", // if you're using a language detector, do not define the lng option
        fallbackLng: "zh_CN",

        interpolation: {
            escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        }
  });
