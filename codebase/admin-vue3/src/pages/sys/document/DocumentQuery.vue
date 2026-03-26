<template>
  <QueryComponent :items="queryItems" @query="onQueryEvent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import QueryComponent from '@/components/QueryComponent.vue';
import UserSelector from '../user/UserSelector.vue';
import dayjs from 'dayjs';
import { AdminDocument } from '@/utils/I18NNamespace';

const emit = defineEmits<{
  (e: 'query', values: any): void;
}>();

const { t } = useTranslation(AdminDocument);

const queryItems = computed(() => [
  { label: t('文件名'), name: 'name', component: 't-input', props: { clearable: true } },
  { label: t('创建人'), name: 'creater', component: UserSelector, props: { mode: 'single', clearable: true } },
  { label: t('文件类型'), name: 'type', component: 't-input', props: { clearable: true } },
  { label: t('备注'), name: 'remark', component: 't-input', props: { clearable: true } },
  { label: t('创建时间'), name: 'created', component: 't-date-range-picker', props: { clearable: true, allowInput: true }, width: 360 },
]);

const onQueryEvent = (values: any) => {
  const v: any = { ...values };

  if (v.creater !== undefined && v.creater !== null && v.creater !== '') {
    v.creater = Number(v.creater);
  }

  if (v.created && Array.isArray(v.created) && v.created.length === 2) {
    v.startDate = dayjs(v.created[0]).format('YYYY-MM-DD');
    v.endDate = dayjs(v.created[1]).format('YYYY-MM-DD');
    delete v.created;
  }

  emit('query', v);
};
</script>
