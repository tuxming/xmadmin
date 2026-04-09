<template>
    <QueryComponent :items="queryItems" @query="onQueryEvent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import QueryComponent from '@/components/QueryComponent.vue';
import UserSelector from '../user/UserSelector.vue';
import { RoleTypeSelector } from './RoleType';
import { AdminRole } from '@/utils/I18NNamespace';

const emit = defineEmits<{
    (e: 'query', values: any): void;
}>();

const { t } = useTranslation(AdminRole);

const queryItems = computed(() => [
    { label: t('角色名'), name: 'roleName', component: 't-input', props: { clearable: true } },
    { label: t('角色代码'), name: 'code', component: 't-input', props: { clearable: true } },
    { label: t('角色类型'), name: 'types', component: RoleTypeSelector, props: { clearable: true } },
    { label: t('创建人'), name: 'creaters', component: UserSelector, props: { mode: 'multiple', clearable: true } },
]);

const onQueryEvent = (values: any) => {
    const v: any = { ...values };

    if (v.types !== undefined && v.types !== null && v.types !== '') {
        v.types = [Number(v.types)];
    }

    if (v.creaters) {
        v.creaters = Array.isArray(v.creaters) ? v.creaters.map((x: any) => Number(x)) : [Number(v.creaters)];
    }

    emit('query', v);
};
</script>
