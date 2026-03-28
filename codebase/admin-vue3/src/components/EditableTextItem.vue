<template>
  <div class="editable-tag-wrap" style="position: relative; padding-right: 30px">
    <template v-if="editing">
      <div style="display: flex; width: 100%; align-items: center; gap: 8px;">
        <t-input
          v-if="type === 'text'"
          v-model="localValue"
          @blur="onBlur"
          style="flex: 1; width: 100%;"
          auto-focus
        />
        <t-input
          v-else
          v-model="localValue"
          type="password"
          @blur="onBlur"
          style="flex: 1; width: 100%;"
          auto-focus
        />
        <t-button theme="primary" variant="text" shape="square" @click="onClickEnter">
          <template #icon><t-icon name="check" /></template>
        </t-button>
      </div>
    </template>
    <template v-else>
      <span style="word-break: break-all;">{{ value }}</span>
      <span style="position: absolute; top: 2px; right: 0;">
        <t-tooltip v-if="editable" :content="t('编辑')">
          <span style="cursor: pointer; margin-right: 5px;" @click="onEditIconClick">
            <t-icon name="edit" style="color: var(--td-brand-color)" />
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  value: string;
  copyable?: boolean;
  editable?: boolean;
  trigger?: 'click' | 'blur';
  type?: 'text' | 'password';
}

const props = withDefaults(defineProps<Props>(), {
  copyable: false,
  editable: true,
  trigger: 'click',
  type: 'text'
});

const emit = defineEmits<{
  (e: 'change', val: string): void;
}>();

const { t } = useTranslation();
const editing = ref(false);
const localValue = ref(props.value);
const copyed = ref(false);

watch(() => props.value, (val) => {
  localValue.value = val;
});

const onEditIconClick = () => {
  editing.value = true;
};

const onEnter = () => {
  editing.value = false;
  if (localValue.value !== props.value) {
    emit('change', localValue.value);
  }
};

const onBlur = () => {
  if (props.trigger === 'blur') {
    onEnter();
  }
};

const onClickEnter = () => {
  if (props.trigger === 'click') {
    onEnter();
  }
};

const onCopy = () => {
  navigator.clipboard.writeText(props.value || '');
  copyed.value = true;
  setTimeout(() => {
    copyed.value = false;
  }, 4000);
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
