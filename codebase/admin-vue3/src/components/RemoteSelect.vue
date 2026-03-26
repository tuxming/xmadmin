<template>
  <t-select
    v-model="internalValue"
    :multiple="multiple"
    :filterable="true"
    :options="options"
    :loading="loading"
    :placeholder="placeholder"
    :reserve-keyword="props.reserveKeyword"
    @search="onSearch"
    @focus="onFocus"
    @change="onChange"
    v-bind="$attrs"
  >
    <template #suffixIcon>
      <t-icon name="search" />
    </template>
  </t-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRequest } from '@/hooks/useRequest';

interface Props {
  modelValue?: any;
  multiple?: boolean;
  remoteUrl: string;
  placeholder?: string;
  labelField?: string;
  valueField?: string;
  reserveKeyword?: boolean;
  searchOnFocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  labelField: 'label',
  valueField: 'value',
  reserveKeyword: false,
  searchOnFocus: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void;
  (e: 'change', val: any, context: any): void;
}>();

const request = useRequest();
const internalValue = ref(props.modelValue);
const options = ref<any[]>([]);
const loading = ref(false);
const lastSearch = ref('');

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
});

let timer: any = null;

const remoteMethod = (search: string, force = false) => {
  lastSearch.value = search;
  if (timer) clearTimeout(timer);
  if (!search && !force) {
    options.value = [];
    return;
  }
  
  timer = setTimeout(async () => {
    loading.value = true;
    try {
      const result = await request.get(`${props.remoteUrl}?keyword=${encodeURIComponent(search)}`);
      if (result.status && result.data) {
        const data: any = result.data;
        const list: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data.list)
            ? data.list
            : (data && typeof data === 'object')
              ? Object.entries(data).map(([key, val]) => ({
                  label: String(val),
                  value: /^\d+$/.test(String(key)) ? Number(key) : key,
                }))
              : [];

        options.value = list.map((item: any) => {
          if (item && typeof item === 'object' && 'label' in item && 'value' in item) {
            return item;
          }
          const label = item?.[props.labelField] || item?.label || item?.name || item?.fullname || String(item);
          const value = item?.[props.valueField] || item?.value || item?.id || item;
          return { label, value, ...(item && typeof item === 'object' ? item : {}) };
        });
      } else {
        options.value = [];
      }
    } catch (e) {
      options.value = [];
    } finally {
      loading.value = false;
    }
  }, 300);
};

const onFocus = () => {
  if (!props.searchOnFocus) return;
  remoteMethod(lastSearch.value || '', true);
};

const onSearch = (val: string) => {
  remoteMethod(val);
};

const onChange = (val: any, context: any) => {
  internalValue.value = val;
  emit('update:modelValue', val);
  emit('change', val, context);
};
</script>
