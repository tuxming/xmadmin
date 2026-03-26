import { defineStore } from 'pinia';
import { useRequest } from '@/hooks/useRequest';
import { api } from '@/utils/api';

export interface DictType {
  key: any;
  label: string;
  value: any;
  type: number;
  color?: string;
}

export const useDictStore = defineStore('dict', {
  state: () => ({
    dicts: {} as Record<string, DictType[]>,
    requests: {} as Record<string, boolean>
  }),
  actions: {
    async getDict(key: string) {
      if (this.dicts[key] || this.requests[key]) {
        return;
      }
      this.requests[key] = true;
      const request = useRequest();
      try {
        const result = await request.get(`${api.dict.byKey}?key=${encodeURIComponent(key)}`, false);
        if (result.status && result.data && result.data.length > 0) {
          const dictData = result.data.map((d: any) => ({
            key: d.dictKey,
            label: d.dictLabel,
            value: (d.type === 1 || d.type === 3) ? Number(d.dictValue) : d.dictValue,
            type: d.type,
            color: d.remark,
          }));
          const groupName = result.data[0].groupName || key;
          this.dicts[groupName] = dictData;
        }
      } catch (err) {
        console.error(err);
      } finally {
        delete this.requests[key];
      }
    }
  }
});
