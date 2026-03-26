<template>
  <t-tag :theme="mappedColor" variant="light" v-bind="$attrs">
    {{ mappedText }}
  </t-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';

interface TypeTagOptionProps {
  label: string;
  value: string | number;
  color?: string;
}

interface Props {
  options: TypeTagOptionProps[];
  value: string | number;
}

const props = defineProps<Props>();

const { t } = useTranslation();

const mappedText = computed(() => {
  const type = props.options.find(rt => rt.value === props.value);
  if (type) {
    return t(type.label);
  }
  return props.value;
});

const mappedColor = computed(() => {
  const type = props.options.find(rt => rt.value === props.value);
  if (type && type.color) {
    // map common color strings to tdesign themes if necessary
    const c = type.color.toLowerCase();
    if (['success', 'warning', 'danger', 'primary', 'default'].includes(c)) {
      return c as any;
    }
  }
  return 'primary';
});
</script>
