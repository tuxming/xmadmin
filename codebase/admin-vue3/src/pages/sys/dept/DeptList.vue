<template>
  <div class="table-wrap" ref="tableWrapRef">
    <t-enhanced-table
      ref="tableRef"
      class="need-buttom-border"
      :data="data"
      :columns="tdColumns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      :selected-row-keys="selectedRowKeys"
      :height="tableHeight"
      :scroll="{ type: 'virtual', rowHeight: 48, bufferSize: 20 }"
      :tree="treeConfig"
      bordered
      @page-change="onPageChange"
      @select-change="onSelectChange"
      @expanded-tree-nodes-change="onExpandedTreeNodesChange"
    >
      <template #type="{ row }">
        <DeptTypeTag :value="row.type" />
      </template>
      <template #name="{ row }">
        {{ row.name }}{{ row.total ? `(${row.total})` : '' }}
      </template>
    </t-enhanced-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject, computed, onMounted, onUnmounted } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useRequest } from '@/hooks/useRequest';
import { useLayer } from '@/hooks/useLayer';
import { api } from '@/utils/api';
import { DeptTypeTag } from './DeptType';
import { computePx } from '@/utils/kit';
import { AdminDept } from '@/utils/I18NNamespace';

const props = defineProps<{
  query: any;
}>();

const emit = defineEmits<{
  (e: 'select', rows: any[]): void;
}>();

const { t } = useTranslation(AdminDept);
const request = useRequest();
const { message } = useLayer();

const data = ref<any[]>([]);
const loading = ref(false);
const selectedRowKeys = ref<any[]>([]);
const tableRef = ref();

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  pageSizeOptions: [10, 20, 50, 100, 200, 500],
  showJumper: true
});

const tdColumns = computed(() => {
  return [
    {
      colKey: 'row-select',
      type: 'single',
      width: 50,
      fixed: 'left'
    },
    {
      title: t('名称'),
      colKey: 'name',
      width: 300,
      align: 'left',
      ellipsis: true,
      sorter: true,
    },
    {
      title: t('ID'),
      colKey: 'id',
      width: 100,
      ellipsis: true,
      sorter: true,
    },
    {
      title: t('类型'),
      colKey: 'type',
      width: 200,
      ellipsis: true,
      sorter: true,
    },
    {
      title: t('路径'),
      colKey: 'path',
      width: 200,
      align: 'left',
      ellipsis: true,
      sorter: true,
    },
    {
      title: t('路径名'),
      colKey: 'pathName',
      width: 200,
      align: 'left',
      ellipsis: true,
      sorter: true,
    }
  ];
});

const modalPos = inject<any>('modalContext', null);

const pos = computed(() => {
  if (modalPos?.value?.width && modalPos?.value?.height) {
    return {
      width: computePx(modalPos.value.width),
      height: computePx(modalPos.value.height, true) - 350
    };
  }
  return { width: undefined, height: undefined };
});

const windowHeight = ref(window.innerHeight);
const handleResize = () => {
  windowHeight.value = window.innerHeight;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  fetchData();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const tableHeight = computed(() => {
  if (pos.value.height) {
    return pos.value.height;
  }
  // 终极绝招：由于所有的内部 flex 或者 resizeObserver 都可能因为外部结构导致测量出被撑开后的错误高度，
  // 我们直接用浏览器视口高度（window.innerHeight）减去一个安全距离，
  // 这样无论外部怎么撑开，传给 TDesign 的 max-height 永远是一个受控的、绝对不会超出屏幕的数字！
  const vh = windowHeight.value;
  // 减去顶部导航、Tab栏、页面 Padding、分页组件等高度，大约需要 260px，
  // 您可以根据实际的屏幕展示情况微调这个 260，直到分页刚好出现在屏幕底部边缘。
  return vh - 370;
});


const fetchData = async () => {
  loading.value = true;
  const result = await request.post(api.dept.list, {
    ...props.query,
    parentId: 0,
    start: (pagination.value.current - 1) * pagination.value.pageSize,
    length: pagination.value.pageSize
  });
  
  loading.value = false;
  
  if (result.status) {
    selectedRowKeys.value = [];
    const list = result.data.list || [];
    data.value = list.map((item: any) => {
      // 恢复官方数据结构，为了兼容 treeConfig，如果有子节点，赋值 children 为 true 触发加号
      if (item.hasChildren) {
        return { ...item, children: true };
      }
      return item;
    });
    
    if (result.data.total !== undefined && result.data.total !== null) {
      pagination.value.total = result.data.total;
    }
  } else {
    message.error(result.msg || t('获取数据失败'));
  }
};

const treeConfig = computed(() => {
  return {
    childrenKey: 'children',
    treeNodeColumnIndex: 1, // 'name' column
    checkStrictly: false,
    expandTreeNodeOnClick: false // 先关闭点击行展开，确保只点击图标能触发
  };
});

const onExpandedTreeNodesChange = async (expandedTreeNodes: any[], context: any, ...rest: any[]) => {
  // console.log("expandedTreeNodesChange triggered", expandedTreeNodes, context);
  
  let ctx = context;
  if (!ctx || !ctx.rowState) {
    ctx = rest[0]; // rest[0] 对应 arguments[2] 等位置，不过在 Vue template 中通常 context 就是第二个参数。如果 TDesign 的版本直接抛出 context 为第一个参数，这里我们可以从 expandedTreeNodes 中取。
  }
  // 更加鲁棒的取法：遍历所有传进来的参数，找到包含 rowState 的那个对象
  if (!ctx || !ctx.rowState) {
    const allArgs = [expandedTreeNodes, context, ...rest];
    ctx = allArgs.find(arg => arg && typeof arg === 'object' && 'rowState' in arg);
  }
  
  if (!ctx || !ctx.rowState) {
    return;
  }

  // ctx.rowState.expanded 在 type === 'expand' 且 trigger === 'expand-fold-icon' 时为 true
  if (ctx.type === 'expand' && ctx.row.hasChildren) {
    const result = await request.post(api.dept.list, { parentId: ctx.row.id });
    if (result.status && result.data && result.data.list) {
      const children = result.data.list.map((item: any) => {
        if (item.hasChildren) {
          return { ...item, children: true };
        }
        return item;
      });
      // 告诉 TDesign 将请求到的子节点追加到当前节点
      tableRef.value?.appendTo(ctx.row.id, children);
    }
  }
};

const refreshNode = async (type: string, object: any) => {
  console.log(type, object)
  if (type === 'delete') {
    tableRef.value?.remove(object.id);
    return;
  }
  
  if (type === 'update') {
    const rowState = tableRef.value?.getData(object.id);
    if (rowState) {
      const oldParentId = rowState.row?.parentId || 0;
      const newParentId = object.parentId || 0;

      if (oldParentId === newParentId) {
        const rawData = { ...rowState.row, ...object };
        if (rawData.hasChildren) {
          rawData.children = true;
        }
        tableRef.value?.setData(object.id, rawData);
        return;
      }

      const refreshParentChildren = async (parentId: number, forceExpand = false) => {
        if (!parentId) {
          fetchData();
          return;
        }

        let parentState = tableRef.value?.getData(parentId);
        if (!parentState) {
          if (forceExpand) {
            await fetchData();
            await new Promise((resolve) => setTimeout(resolve, 120));
            parentState = tableRef.value?.getData(parentId);
          }
          if (!parentState) {
            return;
          }
        }

        const needFetchChildren = forceExpand || parentState.expanded;
        if (needFetchChildren) {
          const result = await request.post(api.dept.list, { parentId });
          if (result.status && result.data && result.data.list) {
            const children = result.data.list.map((item: any) => {
              if (item.hasChildren) return { ...item, children: true };
              return item;
            });

            tableRef.value?.removeChildren(parentId);
            if (children.length > 0) {
              tableRef.value?.appendTo(parentId, children);
            } else {
              const latestParent = tableRef.value?.getData(parentId);
              if (latestParent) {
                tableRef.value?.setData(parentId, { ...latestParent.row, hasChildren: false, children: [] });
              }
            }
          }
        }

        if (forceExpand) {
          const latestParent = tableRef.value?.getData(parentId);
          if (latestParent && !latestParent.expanded) {
            tableRef.value?.toggleExpandData(latestParent);
          }
        }
        return;
      };

      tableRef.value?.remove(object.id);

      if (!oldParentId || !newParentId) {
        await refreshParentChildren(oldParentId);
        await refreshParentChildren(newParentId, true);
        return;
      }

      await refreshParentChildren(oldParentId);
      await refreshParentChildren(newParentId, true);
    }
    return;
  }
  
  if (type === 'create') {
    const parentId = object.parentId || 0;
    if (parentId === 0) {
      fetchData();
      return;
    }

    const rowState = tableRef.value?.getData(parentId);
    if (rowState) {
      const rawData = { ...rowState.row };

      if (rawData.hasChildren && rawData.children !== true) {
        rawData.children = true;
        tableRef.value?.setData(parentId, rawData);
      }

      const rowChildren = rowState.children;
      const hasLoadedChildren = Array.isArray(rowChildren) && rowChildren.length > 0;
      const isLeafNode = !rawData.hasChildren && !hasLoadedChildren;

      // 1. 如果它是叶子节点（原来没有子节点），让它变成父节点并展开
      if (isLeafNode) {
        rawData.hasChildren = true;
        rawData.children = true;

        tableRef.value?.setData(parentId, rawData);

        setTimeout(() => {
          const newState = tableRef.value?.getData(parentId);
          if (!newState) return;
          if (!newState.expanded) {
            tableRef.value?.toggleExpandData(newState);
            return;
          }
          tableRef.value?.toggleExpandData(newState);
          setTimeout(() => {
            tableRef.value?.toggleExpandData(newState);
          }, 100);
        }, 100);
        return;
      }

      // 2. 如果它本来就是父节点，并且已经加载过子节点了
      if (rowState.expanded) {
        const result = await request.post(api.dept.list, { parentId: parentId });
        if (result.status && result.data && result.data.list) {
          const children = result.data.list.map((item: any) => {
            if (item.hasChildren) return { ...item, children: true };
            return item;
          });
          tableRef.value?.removeChildren(parentId);
          tableRef.value?.appendTo(parentId, children);
        }
        return;
      }

      tableRef.value?.toggleExpandData(rowState);
    }
  }
};

defineExpose({
  refreshNode
});

const onPageChange = (pageInfo: any) => {
  pagination.value.current = pageInfo.current;
  pagination.value.pageSize = pageInfo.pageSize;
  fetchData();
};

const onSelectChange = (keys: any[], ctx: any) => {
  selectedRowKeys.value = keys;
  emit('select', ctx.selectedRowData);
};

const onRowClick = (context: any) => {
  // 如果开启了 expandTreeNodeOnClick: true，这里就不需要再手动 toggle 了
  // 因为点击行时组件内部会自动触发 expanded-tree-nodes-change
};
</script>

<style scoped>
.table-wrap {
  width: 100%;
  height: 100%;
}
</style>
