import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { useRequest } from './useRequest';
import { server } from '@/utils/api';

const loadedNamespaces: Record<string, boolean> = {};
const loadingNamespaces: Record<string, Promise<void> | undefined> = {};
const missingSent: Record<string, boolean> = {};

export function useTranslation(ns: string = 'translation') {
    const { locale, setLocaleMessage, getLocaleMessage } = useI18n();
    const request = useRequest();

    const loadNamespace = async (namespace: string, lang: string) => {
        const key = `${lang}_${namespace}`;
        if (loadedNamespaces[key]) return;
        if (loadingNamespaces[key]) return loadingNamespaces[key];
        loadingNamespaces[key] = (async () => {
            try {
                const url = `${server}/public/locales?lng=${lang}&ns=${namespace}`;
                const res: any = await request.get(url);
                const payload =
                    res && typeof res === 'object' && 'status' in res
                        ? res.status
                            ? (res as any).data
                            : null
                        : res;
                if (payload && typeof payload === 'object') {
                    const currentMessages = getLocaleMessage(lang) as Record<string, any>;
                    const next = {
                        ...currentMessages,
                        [namespace]: {
                            ...((currentMessages && currentMessages[namespace]) || {}),
                            ...payload,
                        },
                    };
                    setLocaleMessage(lang, next);
                }
                loadedNamespaces[key] = true;
            } catch (e) {
                console.error(`Failed to load i18n namespace ${namespace} for ${lang}`, e);
                throw e;
            }
        })()
            .finally(() => {
                loadingNamespaces[key] = undefined;
            });
        return loadingNamespaces[key];
    };

    onMounted(() => {
        loadNamespace(ns, locale.value);
    });
    loadNamespace(ns, locale.value);

    const addMissing = async (key: string, namespace: string, lang: string, value?: string) => {
        console.log(`Add missing i18n key ${key} for ${lang} in namespace ${namespace}`);
        const missKey = `${lang}_${namespace}_${key}`;
        if (missingSent[missKey]) return;
        missingSent[missKey] = true;
        try {
            const url = `${server}/public/localesAdd?lng=${lang}&ns=${namespace}`;
            await request.post(url, { [key]: value ?? key });
        } catch (_) {
            missingSent[missKey] = false;
        }
    };

    const ti = (key: string, namespace?: string) => {
        const nsUse = namespace ?? ns;
        loadNamespace(nsUse, locale.value);
        const current = getLocaleMessage(locale.value) as Record<string, any>;
        const container = nsUse ? (current && current[nsUse]) || {} : current || {};
        const exists = Object.prototype.hasOwnProperty.call(container, key);
        const nsKey = `${locale.value}_${nsUse}`;
        if (exists) {
            const val = (container as any)[key];
            if (val === undefined || val === null) return key;
            if (typeof val === 'string') return val.length > 0 ? val : key;
            return String(val);
        }
        if (loadedNamespaces[nsKey] && !exists) {
            addMissing(key, nsUse, locale.value, undefined);
        }
        return key;
    };

    const f = (key: string, values: any[], namespace?: string) => {
        let msg = ti(key, namespace);
        if (values && values.length > 0) {
            for (let i = 0; i < values.length; i++) {
                msg = msg.replace("%s", String(values[i]));
            }
        }
        return msg;
    }

    return {
        t: ti,
        f: f,
        i18n: {
            changeLanguage: async (lang: string) => {
                locale.value = lang;
                await loadNamespace(ns, lang);
            }
        }
    };
}
