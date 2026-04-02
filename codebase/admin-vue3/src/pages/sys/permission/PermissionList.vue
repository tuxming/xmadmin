<template>
  <TableComponent
    :page-size="20"
    :query="query"
    :api-url="api.permission.list"
    :width="pos?.width"
    :height="pos?.height"
    :on-select="onSelect"
    :columns="columns"
    :refresh="refresh"
  />
</template>

<script setup lang="ts">
import { inject, computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/utils/api';
import TableComponent from '@/components/TableComponent.vue';
import { computePx } from '@/utils/kit';
import { AdminPermission } from '@/utils/I18NNamespace';

const props = defineProps<{
  query: any;
  refresh?: { reset: boolean; tag: any };
}>();

const emit = defineEmits<{
  (e: 'select', rows: any[]): void;
}>();

const { t } = useTranslation(AdminPermission);

const columns = computed<any[]>(() => [
  { title: t('ID'), key: 'id', sort: true, ellipsis: true, width: 100, filter: 'number' },
  { title: t('分组名'), key: 'groupName', sort: true, ellipsis: true, width: 150, filter: 'input' },
  { title: t('权限名'), key: 'name', sort: true, ellipsis: true, width: 200 , filter: 'input'},
  { title: t('表达式'), key: 'expression', sort: true, filter: 'input', ellipsis: true, width: 200 },
]);

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
