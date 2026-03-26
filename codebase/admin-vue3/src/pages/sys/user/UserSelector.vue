<template>
  <RemoteSelect
    v-model="internalValue"
    :multiple="mode !== 'single'"
    :remote-url="api.user.search"
    :placeholder="t('输入关键字搜索用户')"
    v-bind="$attrs"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/utils/api';
import RemoteSelect from '@/components/RemoteSelect.vue';
import { AdminUser } from '@/utils/I18NNamespace';

const props = defineProps<{
  modelValue?: any;
  mode?: 'single' | 'multiple';
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const { t } = useTranslation(AdminUser);
const internalValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  internalValue.value = val;
});

const onChange = (val: any, context: any) => {
  // To match React version output format if needed, though native array of values is usually fine in Vue.
  // In React version, it emitted array of {label, value} objects.
  // Let's emit the value directly for Vue ecosystem compatibility.
  emit('update:modelValue', val);
  emit('change', val, context);
};
</script>
