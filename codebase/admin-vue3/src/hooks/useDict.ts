import { onMounted, computed } from 'vue';
import { useDictStore } from '@/store/modules/dict';

export function useDict(key: string) {
  const dictStore = useDictStore();

  onMounted(() => {
    dictStore.getDict(key);
  });

  return computed(() => dictStore.dicts[key] || []);
}
