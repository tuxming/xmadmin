<template>
  <TableComponent
    :page-size="20"
    :query="query"
    :api-url="api.user.list"
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
import { UserStatusTag } from './UserType';
import { computePx } from '@/utils/kit';
import { useDict } from '@/hooks/useDict';
import { AdminUser } from '@/utils/I18NNamespace';

const props = defineProps<{
  query: any;
  refresh?: { reset: boolean; tag: any };
}>();

const emit = defineEmits<{
  (e: 'select', rows: any[]): void;
}>();

const { t } = useTranslation(AdminUser);
const genderDict = useDict('Gender');

const columns = computed<any[]>(() => [
  { title: t('ID'), key: 'id', sort: true, filter: 'number', ellipsis: true, width: 80, fixed: 'left' },
  { title: t('账号'), key: 'username', sort: true, filter: 'input', ellipsis: true, width: 150 },
  { title: t('姓名'), key: 'fullname', sort: true, filter: 'input', ellipsis: true, width: 150 },
  { title: t('邮件'), key: 'email', sort: true, filter: 'input', ellipsis: true, width: 180 },
  { title: t('电话'), key: 'phone', sort: true, filter: 'input', ellipsis: true, width: 180 },
  {
    title: t('状态'),
    key: 'status',
    sort: true,
    filter: 'multiple',
    filterOptions: 'UserStatus',
    ellipsis: true,
    width: 120,
    render: (text: any) => h(UserStatusTag, null, { default: () => text }),
  },
  { title: t('创建时间'), key: 'created', sort: true, filter: 'datepicker', ellipsis: true, width: 200 },
  { title: t('推广码'), key: 'code', sort: true, filter: 'input', ellipsis: true, width: 120 },
  { title: t('上级'), key: 'parentName', sort: true, filter: 'input', ellipsis: true, width: 150 },
  {
    title: t('性别'),
    key: 'gender',
    sort: true,
    filter: 'single',
    filterOptions: 'Gender',
    ellipsis: true,
    width: 80,
    render: (text: any) => {
      const list = genderDict.value || [];
      const found = list.find((d: any) => d.value === text);
      const label = found ? (found.label ?? String(text)) : String(text);
      return h('span', label);
    },
  },
  { title: t('所在组织'), key: 'deptName', sort: true, filter: 'input', ellipsis: true, width: 200 },
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
