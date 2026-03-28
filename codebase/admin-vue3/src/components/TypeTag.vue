<template>
  <t-tag 
    :theme="mappedColor" 
    :color="customColor"
    :variant="variant" 
    v-bind="$attrs"
  >
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
  variant?: 'dark' | 'light' | 'outline' | 'light-outline';
  theme?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'dark'
});

const { t } = useTranslation();

const mappedText = computed(() => {
  // 使用 == 而不是 ===，因为 val 可能是字符串 "0"，而 type.value 可能是数字 0
  const type = props.options.find(rt => rt.value == props.value);
  if (type) {
    return t(type.label);
  }
  return props.value;
});

const mappedColor = computed(() => {
  // 如果外部显式传入了 theme 属性，则优先使用外部传入的 theme
  if (props.theme) {
    return props.theme as any;
  }

  const type = props.options.find(rt => rt.value == props.value);
  if (type && type.color) {
    // map common color strings to tdesign themes if necessary
    const c = type.color.toLowerCase();
    if (['success', 'warning', 'danger', 'primary', 'default'].includes(c)) {
      return c as any;
    }
    // 处理 antd 中的 gold 颜色，映射为 warning
    if (c === 'gold') {
      return 'warning';
    }
  }
  return 'default';
});

const customColor = computed(() => {
  const type = props.options.find(rt => rt.value == props.value);
  if (type && type.color) {
    const c = type.color.toLowerCase();
    // 如果不是内置主题色，而是具体的颜色值（如 hex 或 purple/cyan），直接将其作为 color 属性传递给 t-tag
    if (!['success', 'warning', 'danger', 'primary', 'default', 'gold'].includes(c)) {
      return type.color;
    }
  }
  return undefined;
});
</script>
