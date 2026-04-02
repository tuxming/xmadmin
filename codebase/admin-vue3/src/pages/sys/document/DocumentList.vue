<template>
  <TableComponent
    :page-size="20"
    :query="query"
    :api-url="api.document.list"
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
import { computePx } from '@/utils/kit';
import { AdminDocument } from '@/utils/I18NNamespace';

const props = defineProps<{
  query: any;
  refresh?: { reset: boolean; tag: any };
}>();

const emit = defineEmits<{
  (e: 'select', rows: any[]): void;
}>();

const { t } = useTranslation(AdminDocument);

const imgUrl = api.document?.img ;

const columns = computed<any[]>(() => [   
  { title: t('ID'), key: 'id', sort: true, ellipsis: true, width: 100 },
  { 
    title: t('缩略图'), 
    key: 'thumb', 
    sort: false, 
    filter: false, 
    ellipsis: true, 
    width: 80,
    render: (text: any, record: any) => {
      const name = (record.fileName || '').toLowerCase();
      if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')) {
        return h('img', { 
          src: `${imgUrl}?id=${record.id}`, 
          style: { width: '45px', height: '45px', objectFit: 'cover' } 
        });
      }
      return h('span');
    }
  },
  { title: t('文件名'), key: 'fileName', sort: true, filter: "input", ellipsis: true, width: 150 },
  { title: t('文件路径'), key: 'path', sort: true, filter: "input", ellipsis: true, width: 200, align: 'left' },
  { title: t('类型'), key: 'type', sort: true, filter: "select", ellipsis: true, width: 150 },
  { title: t('创建人'), key: 'createrName', sort: true, filter: "input", ellipsis: true, width: 150 },
  { title: t('创建时间'), key: 'created', sort: true, filter: "datepicker", ellipsis: true, width: 150 },
  { title: t('备注'), key: 'remark', sort: true, filter: "input", ellipsis: true, width: 150 },
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
