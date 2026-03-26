<template>
  <t-popup
    placement="bottom-left"
    trigger="click"
    :visible="popupVisible"
    @visible-change="onPopupVisibleChange"
  >
    <div class="custom-select-trigger" :class="{ 'is-active': popupVisible }">
      <span class="trigger-text" v-if="displayLabel">{{ displayLabel }}</span>
      <span class="trigger-placeholder" v-else>请选择组织</span>
      <t-icon name="chevron-down" class="trigger-icon" />
    </div>

    <template #content>
      <div class="tree-panel">
        <t-tree
          :data="treeData"
          :keys="fieldNames"
          :load="onLoadData"
          :expanded="expandedKeys"
          @expand="onTreeExpand"
          hover
          activable
          @click="onTreeNodeClick"
        />
      </div>
    </template>
  </t-popup>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRequest } from '@/hooks/useRequest';
import { api } from '@/utils/api';

const props = defineProps<{
  modelValue?: any;
  path?: string;
  parentName?: string;
  returnObject?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const request = useRequest();
const treeData = ref<any[]>([]);
const expandedKeys = ref<any[]>([]);
const popupVisible = ref(false);
const labelCache = ref<Record<string, string>>({});
const requestedIds = ref<Set<string>>(new Set());

const onPopupVisibleChange = (visible: boolean) => {
  popupVisible.value = visible;
};

const onTreeExpand = (val: any[]) => {
  expandedKeys.value = val;
};

const fieldNames = {
  label: 'displayName',
  value: 'id',
  children: 'children'
};

const getDisplayLabel = (val: any) => {
  if (val === undefined || val === null || val === '') {
    return '';
  }
  
  let valId = val;

  // 如果 val 传进来的是个对象，我们优先使用对象里的数据拼接
  if (typeof val === 'object' && val !== null) {
    if (val.id !== undefined && val.name) {
      return `${val.id}-${val.name}`;
    }
    
    // 如果只有 id 没有 name，我们把 val 降级为单纯的 id，让后续的逻辑去树里找或者通过 parentName 找
    if (val.id !== undefined) {
      valId = val.id;
    } else if (val.value !== undefined) {
      valId = val.value;
    }
  }

  const cacheKey = String(valId);
  if (labelCache.value[cacheKey]) {
    return labelCache.value[cacheKey];
  }

  const findNode = (nodes: any[]): any => {
    for (const n of nodes) {
      if (n.id === valId) return n.displayName || n.name;
      if (n.children && Array.isArray(n.children)) {
        const found = findNode(n.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  const name = findNode(treeData.value);
  if (name) {
    return name;
  }
  
  if (props.parentName) {
    // parentName is something like "系统管理/研发部/"
    const parts = props.parentName.split('/').filter(Boolean);
    if (parts.length > 0) {
      const result = `${valId}-${parts[parts.length - 1]}`;
      return result;
    }
  }
  
  return String(valId);
};

const displayLabel = computed(() => getDisplayLabel(props.modelValue));

const onTreeNodeClick = (context: any) => {
  const nodeData = context?.node?.data || {};
  const val = context.node.value;
  if (val !== undefined && val !== null && nodeData?.name) {
    labelCache.value[String(val)] = `${nodeData.id ?? val}-${nodeData.name}`;
  }
  const nextVal = props.returnObject ? { id: nodeData.id ?? val, name: nodeData.name } : val;
  emit('update:modelValue', nextVal);
  emit('change', nextVal, context);
  popupVisible.value = false;
};

const onLoadData = (node?: any) => {
  return new Promise<any[]>((resolve) => {
    const parentId = node && node.value ? node.value : null;
    request.post(api.dept.list, { parentId }).then((result) => {
      if (result.status && result.data && result.data.list) {
        const list = result.data.list.map((s: any) => ({
          ...s,
          displayName: `${s.id}-${s.name}`,
          children: s.hasChildren ? true : []
        }));
        resolve(list);
      } else {
        resolve([]);
      }
    });
  });
};

onMounted(async () => {
  const rootNodes = await onLoadData();
  
  if (props.path) {
    // path is like "/1/34/35/" or could be undefined
    const ids = typeof props.path === 'string' ? props.path.split('/').filter(Boolean).map(Number) : [];
    let currentNodes = rootNodes;
    const expandKeys = [];
    
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const node = currentNodes.find((n: any) => n.id === id);
      if (node && node.hasChildren) {
        expandKeys.push(id);
        const children = await onLoadData({ value: id });
        node.children = children;
        currentNodes = children;
      } else {
        break;
      }
    }
    expandedKeys.value = expandKeys;
  }
  
  treeData.value = rootNodes;
});

const resolveDeptNameById = async (id: any) => {
  if (id === undefined || id === null || id === '') return;
  const cacheKey = String(id);
  if (labelCache.value[cacheKey] || requestedIds.value.has(cacheKey)) return;
  requestedIds.value.add(cacheKey);
  try {
    const result = await request.get(`${api.dept.get}?id=${encodeURIComponent(cacheKey)}`);
    if (result.status && result.data) {
      const dept = result.data;
      const name = dept.name || dept.deptName || dept.label;
      const did = dept.id ?? id;
      if (name) {
        labelCache.value[cacheKey] = `${did}-${name}`;
      }
    }
  } finally {
    requestedIds.value.delete(cacheKey);
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val === undefined || val === null || val === '') return;
    if (typeof val === 'object' && val !== null && val.id !== undefined && val.name) return;
    const id = typeof val === 'object' && val !== null ? (val.id ?? val.value) : val;
    resolveDeptNameById(id);
  },
  { immediate: true },
);
</script>

<style scoped>
.custom-select-trigger {
  box-sizing: border-box;
  width: 100%;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);
  background-color: var(--td-bg-color-container);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.custom-select-trigger:hover {
  border-color: var(--td-brand-color-hover);
}

.custom-select-trigger.is-active {
  border-color: var(--td-brand-color);
  box-shadow: 0 0 0 2px var(--td-brand-color-focus);
}

.trigger-text {
  font-size: 14px;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-placeholder {
  font-size: 14px;
  color: var(--td-text-color-placeholder);
}

.trigger-icon {
  color: var(--td-text-color-placeholder);
  transition: transform 0.2s;
}

.is-active .trigger-icon {
  transform: rotate(180deg);
}

.tree-panel {
  width: 300px;
  max-height: 300px;
  overflow: auto;
  padding: 4px;
}
</style>
