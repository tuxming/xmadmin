<template>
  <RemoteSelect
    v-model="internalValue"
    :multiple="mode !== 'single'"
    :remote-url="api.role.search"
    :placeholder="t('输入关键字搜索角色')"
    v-bind="$attrs"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/utils/api';
import RemoteSelect from '@/components/RemoteSelect.vue';
import { AdminRole } from '@/utils/I18NNamespace';

const props = defineProps<{
  modelValue?: any;
  mode?: 'single' | 'multiple';
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const { t } = useTranslation(AdminRole);
const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
});

const onChange = (val: any, context: any) => {
  emit('update:modelValue', val);
  emit('change', val, context);
};
</script>
