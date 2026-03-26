<template>
  <TableComponent
    :page-size="20"
    :query="query"
    :api-url="api.role.list"
    :width="pos?.width"
    :height="pos?.height"
    :on-select="onSelect"
    :columns="columns"
    :refresh="refresh"
  />
</template>


<script setup lang="ts">
import { h, inject, computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/utils/api';
import TableComponent from '@/components/TableComponent.vue';
import { RoleTypeTag } from './RoleType';
import { computePx } from '@/utils/kit';
import { AdminRole } from '@/utils/I18NNamespace';

const props = defineProps<{
  query: any;
  refresh?: { reset: boolean; tag: any };
}>();

const emit = defineEmits<{
  (e: 'select', rows: any[]): void;
}>();

const { t } = useTranslation(AdminRole);

const columns : any[]= [
  { title: t('ID'), key: 'id', sort: true, ellipsis: true, width: 100 },
  { title: t('角色名'), key: 'roleName', sort: true, filter: true, ellipsis: true, width: 150 },
  { title: t('角色代码'), key: 'code', sort: true, filter: true, ellipsis: true, width: 200 },
  { 
    title: t('角色类型'), 
    key: 'type', 
    sort: true, 
    filter: true, 
    ellipsis: true, 
    width: 150,
    render: (text: any) => h(RoleTypeTag, { value: text }),
  },
  { title: t('创建人'), key: 'createrName', sort: true, filter: true, ellipsis: true, width: 150 },
];

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

const onSelect = (rows: any[]) => {
  emit('select', rows);
};
</script>
