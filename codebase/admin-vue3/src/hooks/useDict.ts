import { computed } from 'vue';
import { useDictStore } from '@/store/modules/dict';

export function useDict(key: string) {
    const dictStore = useDictStore();
    dictStore.getDict(key);

    return computed(() => dictStore.dicts[key] || []);
}
