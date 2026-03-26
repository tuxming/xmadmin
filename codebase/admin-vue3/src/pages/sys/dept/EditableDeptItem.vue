<template>
  <div class="editable-tag-wrap" style="position: relative; padding-right: 30px">
    <template v-if="editing">
      <t-space align="center">
        <DeptSelector
          v-model="localValue.value"
          style="width: calc(100% - 50px)"
          @change="onSelect"
        />
        <t-button theme="primary" variant="text" shape="square" @click="onEnter">
          <template #icon><t-icon name="check" /></template>
        </t-button>
      </t-space>
    </template>
    <template v-else>
      <span>{{ deptName }}<br/>{{ deptPath }}<br/>{{ deptPathName }}</span>
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
import DeptSelector from '@/pages/sys/dept/DeptSelector.vue';
import { AdminDept } from '@/utils/I18NNamespace';

interface Props {
  value: number;
  deptName: string;
  deptPath: string;
  deptPathName: string;
  editable?: boolean;
  copyable?: boolean | 'CopyValue' | 'CopyLabel' | 'CopyAll';
}

const props = withDefaults(defineProps<Props>(), {
  copyable: false,
  editable: true,
});

const emit = defineEmits<{
  (e: 'change', val: number, obj: any): void;
}>();

const { t } = useTranslation(AdminDept);
const editing = ref(false);
const copyed = ref(false);

const localValue = ref({
  value: props.value,
  deptName: props.deptName,
  deptPath: props.deptPath,
  deptPathName: props.deptPathName
});

watch(() => props.value, () => {
  localValue.value = {
    value: props.value,
    deptName: props.deptName,
    deptPath: props.deptPath,
    deptPathName: props.deptPathName
  };
});

const onEditIconClick = () => {
  editing.value = true;
};

const onEnter = () => {
  editing.value = false;
  if (localValue.value.value !== props.value) {
    emit('change', localValue.value.value, localValue.value);
  }
};

const onSelect = (value: any, context: any) => {
  if (context && context.node) {
    const node = context.node.data;
    localValue.value = {
      value: value,
      deptName: node.name,
      deptPath: node.path,
      deptPathName: node.pathName
    };
  }
};

const onCopy = () => {
  let text = "";
  if (props.copyable === 'CopyLabel') {
    text = localValue.value.deptName + "";
  } else if (props.copyable === 'CopyAll') {
    text = JSON.stringify(localValue.value);
  } else {
    text = props.value + "";
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
