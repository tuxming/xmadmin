<template>
  <t-icon v-if="isTDesignIcon" :name="name" v-bind="$attrs" />
  <i v-else :class="['iconfont', name, customClass]" :style="styleObj" v-bind="$attrs"></i>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  name?: string;
  color?: string;
  size?: string;
  hoverColor?: string;
}>();

// TDesign内置图标通常没有类似 icon- 或 xm- 这样的前缀
const isTDesignIcon = computed(() => {
  return props.name && !props.name.startsWith('icon-') && !props.name.startsWith('xm-');
});

const customClass = computed(() => {
  return props.hoverColor ? 'hoverable-icon' : '';
});

const styleObj = computed(() => {
  const style: Record<string, string> = {};
  if (props.color) style.color = props.color;
  if (props.size) style.fontSize = `${props.size}px`;
  if (props.hoverColor) {
    style['--hover-color'] = props.hoverColor;
  }
  return style;
});
</script>

<style scoped>
.hoverable-icon {
  cursor: pointer;
  transition: color 0.2s;
}
.hoverable-icon:hover {
  color: var(--hover-color) !important;
}
</style>