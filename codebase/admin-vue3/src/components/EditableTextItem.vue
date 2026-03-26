<template>
  <div class="editable-tag-wrap" style="position: relative; padding-right: 30px">
    <template v-if="editing">
      <t-space align="center" class="editable-tag-wrap__edit">
        <t-input
          v-if="type === 'text'"
          v-model="localValue"
          @blur="onBlur"
          :style="inputStyle"
          auto-focus
        />
        <t-input
          v-else
          v-model="localValue"
          type="password"
          @blur="onBlur"
          :style="inputStyle"
          auto-focus
        />
        <t-button theme="primary" variant="text" shape="square" @click="onClickEnter">
          <template #icon><t-icon name="check" /></template>
        </t-button>
      </t-space>
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
import { ref, watch, computed } from 'vue';
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

const computeWidth = (str: string) => {
  if (!str) return 150;
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) {
      length += 2;
    } else {
      length += 1;
    }
  }
  return length < 7 ? 8 * 16 : length * 16;
};

const inputStyle = computed(() => {
  const w = Math.min(computeWidth(props.value), 560);
  return {
    width: '100%',
    maxWidth: `${w}px`,
    flex: 1,
    minWidth: '180px',
  };
});

</script>

<style scoped>
.editable-tag-wrap__edit {
  width: 100%;
}

.editable-tag-wrap .copy-icon {
  display: none;
}
.editable-tag-wrap:hover .copy-icon {
  display: inline-block;
}
</style>
