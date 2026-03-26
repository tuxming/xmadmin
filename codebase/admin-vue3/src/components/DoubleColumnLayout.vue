<template>
  <div class="double-column-layout">
    <t-row style="height: 100%; display: flex; flex: 1; min-height: 0;">
    <t-col :flex="leftFlex" style="height: 100%; overflow: auto; min-width: 0; min-height: 0;">
      <slot name="left"></slot>
    </t-col>
    <t-col :flex="rightFlex" style="height: 100%; overflow: hidden; min-width: 0; min-height: 0;">
      <slot name="right"></slot>
    </t-col>
  </t-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useGlobalStore } from '@/store/modules/global';
import { computePx } from '@/utils/kit';

const props = defineProps<{
  width?: number | string;
  leftWidth?: number | string;
}>();

const globalStore = useGlobalStore();

const leftFlex = computed(() => {
  if (props.leftWidth) {
    return `0 0 ${computePx(props.leftWidth)}px`;
  }
  return '0 0 250px';
});

const rightFlex = computed(() => {
  return '1 1 0%';
});
</script>

<style scoped>
.double-column-layout {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
