<template>
    <TableComponent :page-size="20" :query="query" :api-url="api.history.list" :width="pos?.width" :height="pos?.height"
        :on-select="onSelect" :columns="columns" :refresh="refresh" />
</template>

<script setup lang="ts">
import { inject, computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/utils/api';
import TableComponent from '@/components/TableComponent.vue';
import { computePx } from '@/utils/kit';
import { AdminHistory } from '@/utils/I18NNamespace';

const props = defineProps<{
    query: any;
    refresh?: { reset: boolean; tag: any };
}>();

const emit = defineEmits<{
    (e: 'select', rows: any[]): void;
}>();

const { t } = useTranslation(AdminHistory);

const columns = computed<any[]>(() => [
    { title: t('ID'), key: 'id', sort: true, ellipsis: true, width: 80, fixed: 'left' },
    { title: t('操作人'), key: 'username', sort: true, filter: true, ellipsis: true, width: 150 },
    { title: t('IP地址'), key: 'ipAddr', sort: true, filter: true, ellipsis: true, width: 150 },
    { title: t('操作类型'), key: 'type', sort: true, filter: true, width: 150 },
    { title: t('操作时间'), key: 'created', sort: true, filter: true, ellipsis: true, width: 200 },
    { title: t('请求参数'), key: 'remark', ellipsis: true, align: 'left', width: 200 },
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
