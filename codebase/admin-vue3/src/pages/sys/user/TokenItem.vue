<template>
  <div class="editable-tag-wrap" style="position: relative; padding-right: 55px">
    <span style="word-break: break-all;">
      {{ show ? value : (value.substring(0, 1) + '*'.repeat(30) + value.substring(value.length - 1)) }}
    </span>
    <span style="position: absolute; top: 2px; right: 0;">
      <t-tooltip :content="t('查看')">
        <span @click="onShow" style="cursor: pointer; margin-right: 5px;">
          <t-icon :name="show ? 'browse-off' : 'browse'" style="color: var(--td-brand-color)" />
        </span>
      </t-tooltip>
      <t-tooltip :content="t('刷新')">
        <span @click="onClickRefresh" style="cursor: pointer; margin-right: 5px;">
          <t-icon name="refresh" class="refresh-icon" style="color: var(--td-brand-color)" />
        </span>
      </t-tooltip>
      <template v-if="copyable">
        <t-icon v-if="copyed" name="check" style="color: var(--td-success-color)" />
        <t-tooltip v-else :content="t('复制')">
          <span style="cursor: pointer;" @click="onCopy">
            <t-icon name="file-copy" class="copy-icon" style="color: var(--td-brand-color)" />
          </span>
        </t-tooltip>
      </template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { AdminUser } from '@/utils/I18NNamespace';

interface Props {
  value: string;
  copyable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  copyable: false
});

const emit = defineEmits<{
  (e: 'refresh', val: string): void;
}>();

const { t } = useTranslation(AdminUser);
const copyed = ref(false);
const show = ref(false);

const onClickRefresh = () => {
  emit('refresh', '');
};

const onCopy = () => {
  navigator.clipboard.writeText(props.value);
  copyed.value = true;
  setTimeout(() => {
    copyed.value = false;
  }, 4000);
};

const onShow = () => {
  show.value = !show.value;
};
</script>

<style scoped>
.editable-tag-wrap .copy-icon {
  display: none;
}
.editable-tag-wrap:hover .copy-icon {
  display: inline-block;
}
</style>
