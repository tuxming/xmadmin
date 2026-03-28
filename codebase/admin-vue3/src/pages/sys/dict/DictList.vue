<template>
  <TableComponent
    :page-size="20"
    :query="query"
    :api-url="api.dict.dicts"
    :width="width"
    :height="height"
    :on-select="onSelect"
    :columns="columns"
    :refresh="refresh"
    :init-load="false"
  />
</template>

<script setup lang="ts">
import { h } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/utils/api';
import TableComponent from '@/components/TableComponent.vue';
import { DictTypeTag } from './DictType';
import { AdminDict } from '@/utils/I18NNamespace';

const props = defineProps<{
  query: any;
  refresh?: { reset: boolean; tag: any };
  width?: number | string;
  usedWidth?: number;
  height?: number | string;
}>();

const emit = defineEmits<{
  (e: 'select', rows: any[]): void;
}>();

const { t } = useTranslation(AdminDict);

const columns : any[] = [
  {
    title: t('ID'),
    key: 'id',
    sort: true,
    ellipsis: true,
    width: 80,
    align: 'left'
  },
  {
    title: t('字典名'),
    key: 'groupLabel',
    sort: true,
    filter: true,
    ellipsis: true,
    width: 90,
    align: 'center'
  },
  {
    title: t('字典代码'),
    key: 'groupName',
    sort: true,
    filter: true,
    ellipsis: true,
    width: 120,
    align: 'center'
  },
  {
    title: t('数据名'),
    key: 'dictLabel',
    sort: true,
    filter: true,
    ellipsis: true,
    width: 150,
    align: 'center'
  },
  {
    title: t('数据KEY'),
    key: 'dictKey',
    sort: true,
    filter: true,
    ellipsis: true,
    width: 150,
    align: 'left'
  },
  {
    title: t('数据值'),
    key: 'dictValue',
    sort: true,
    filter: true,
    ellipsis: true,
    width: 150,
    align: 'center'
  },
  {
    title: t('数据类型'),
    key: 'type',
    sort: true,
    filter: true,
    ellipsis: true,
    width: 150,
    align: 'center',
    render: (text: any) => h(DictTypeTag, null, { default: () => text }),
  }
];

const onSelect = (rows: any[]) => {
  emit('select', rows);
};
</script>
