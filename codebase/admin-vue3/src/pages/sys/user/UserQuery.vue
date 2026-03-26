<template>
  <QueryComponent :items="queryItems" @query="onQueryEvent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import QueryComponent from '@/components/QueryComponent.vue';
import UserSelector from './UserSelector.vue';
import RoleSelector from '../role/RoleSelector.vue';
import dayjs from 'dayjs';
import { AdminUser } from '@/utils/I18NNamespace';

const emit = defineEmits<{
  (e: 'query', values: any): void;
}>();

const { t } = useTranslation(AdminUser);

const queryItems = computed(() => [
  { label: t('账号'), name: 'userId', component: UserSelector, props: { mode: 'single', clearable: true } },
  { label: t('姓名'), name: 'fullname_Q', component: 't-input', props: { clearable: true } },
  { label: t('邮件地址'), name: 'email_Q', component: 't-input', props: { clearable: true } },
  { label: t('电话'), name: 'phone_Q', component: 't-input', props: { clearable: true } },
  { label: t('角色'), name: 'roleIds', component: RoleSelector, props: { mode: 'multiple', clearable: true } },
  { label: t('创建时间'), name: 'created', component: 't-date-range-picker', props: { clearable: true, allowInput: true }, width: 360 },
]);

const onQueryEvent = (values: any) => {
  const v: any = { ...values };

  if (v.roleIds) {
    v.roleIds = Array.isArray(v.roleIds) ? v.roleIds.map((x: any) => Number(x)) : [Number(v.roleIds)];
  }

  if (v.created && Array.isArray(v.created) && v.created.length === 2) {
    v.startDate = dayjs(v.created[0]).format('YYYY-MM-DD');
    v.endDate = dayjs(v.created[1]).format('YYYY-MM-DD');
    delete v.created;
  }

  if (v.userId !== undefined && v.userId !== null && v.userId !== '') {
    v.userId = Number(v.userId);
  }

  const out: any = {};
  Object.keys(v).forEach((k) => {
    const nk = k.endsWith('_Q') ? k.slice(0, -2) : k;
    out[nk] = v[k];
  });

  emit('query', out);
};
</script>
