<template>
  <div class="editable-tag-wrap" style="position: relative; padding-right: 30px">
    <template v-if="editing">
      <div style="display: flex; width: 100%; align-items: center; gap: 8px;">
        <t-select
          v-model="localValue"
          :options="options"
          style="flex: 1; width: 100%;"
          @blur="onBlur"
        />
        <t-button theme="primary" variant="text" shape="square" @click="onClickEnter">
          <template #icon><t-icon name="check" /></template>
        </t-button>
      </div>
    </template>
    <template v-else>
      <TypeTag :options="options" :value="localValue" />
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
import TypeTag from './TypeTag.vue';

interface Props {
  value: string | number;
  options: any[];
  copyable?: boolean | 'CopyValue' | 'CopyLabel' | 'CopyAll';
  editable?: boolean;
  trigger?: 'click' | 'blur';
  width?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  copyable: false,
  editable: true,
  trigger: 'click'
});

const emit = defineEmits<{
  (e: 'change', val: string | number): void;
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
  let text = "";
  const option = props.options.find(s => s.value === props.value);
  
  if (!option) {
    text = String(props.value);
  } else {
    if (props.copyable === 'CopyLabel') {
      text = String(t(option.label));
    } else if (props.copyable === 'CopyAll') {
      text = JSON.stringify(option);
    } else {
      text = String(props.value);
    }
  }

  navigator.clipboard.writeText(text);
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
