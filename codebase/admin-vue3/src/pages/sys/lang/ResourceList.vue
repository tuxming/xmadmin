<template>
  <TableComponent
    :page-size="20"
    :query="query"
    :api-url="api.lang.resources"
    :width="width"
    :height="height"
    :on-select="onSelect"
    :columns="columns"
    :refresh="refresh"
    :init-load="false"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/utils/api';
import TableComponent from '@/components/TableComponent.vue';
import { AdminLang } from '@/utils/I18NNamespace';

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

const { t } = useTranslation(AdminLang);

const columns = computed<any[]>(() => [
  { title: t('ID'), key: 'id', sort: true, ellipsis: true, width: 100, align: 'left' },
  { title: t('KEY'), key: 'resKey', sort: true, filter: true, ellipsis: true, width: 250, align: 'left' },
  { title: t('显示值'), key: 'resValue', sort: true, filter: true, ellipsis: true, width: 250, align: 'left' },
]);

const onSelect = (rows: any[]) => {
  emit('select', rows);
};
</script>
