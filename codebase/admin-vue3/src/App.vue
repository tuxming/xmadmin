<template>
  <t-config-provider :global-config="globalConfig">
    <router-view />
    <template v-for="(layer, key) in layerState" :key="key">
      <component
        v-if="layer.type === 'confirm'"
        :is="layer.component"
        v-bind="layer.props"
        @ok="layer.props.onOk"
        @cancel="layer.props.onCancel"
        @close="layer.props.onClose"
      />
      <component
        v-else-if="layer.type === 'modal'"
        :is="layer.component"
        v-bind="layer.props"
        @close="layer.props.onClose"
      >
        <component v-if="layer.props.content" :is="layer.props.content" v-bind="layer.props.contentProps" />
      </component>
    </template>
  </t-config-provider>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue';
import { useThemeStore } from '@/store';
import { layerState } from '@/hooks/useLayer';
import zhConfig from 'tdesign-vue-next/es/locale/zh_CN';

const themeStore = useThemeStore();

const globalConfig = reactive({
  ...zhConfig
});

watch(() => themeStore.theme, (val) => {
  if (val === 'dark') {
    document.documentElement.setAttribute('theme-mode', 'dark');
  } else {
    document.documentElement.removeAttribute('theme-mode');
  }
}, { immediate: true });

// Listen for component size changes to update TDesign global size
watch(() => themeStore.componentSize, (size) => {
  if (size) document.documentElement.setAttribute('theme-size', size);
}, { immediate: true });

onMounted(() => {
  // Restore primary color
  if (themeStore.primaryColor) {
    document.documentElement.style.setProperty('--td-brand-color', themeStore.primaryColor);
  }
  // Restore border radius
  if (themeStore.borderRadius !== undefined) {
    document.documentElement.style.setProperty('--td-radius-default', `${themeStore.borderRadius}px`);
  }
});
</script>

<style>
/* App global styles */
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

[theme-size="small"] {
  --td-comp-size-m: 24px;
  --td-comp-size-l: 28px;
  --td-comp-size-xl: 32px;
}
[theme-size="medium"] {
  /* Default TDesign sizes */
}
[theme-size="large"] {
  --td-comp-size-m: 36px;
  --td-comp-size-l: 40px;
  --td-comp-size-xl: 48px;
}
</style>