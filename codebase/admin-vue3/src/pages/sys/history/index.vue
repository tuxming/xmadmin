<template>
    <div class="history-page">
        <HistoryQuery @query="onQuery" />
        <t-divider size="8px" />

        <t-space wrap style="margin-top: 20px">
            <AuthButton theme="default" :tip="t('查看')" :required-permissions="permission.history.get.expression"
                @click="onViewDetail">
                <template #icon><t-icon name="browse" /></template>
                {{ !onlyIcon ? t('查看') : '' }}
            </AuthButton>

            <AuthButton theme="danger" :tip="t('删除')" :required-permissions="permission.history.delete.expression"
                @click="onDelete">
                <template #icon><t-icon name="delete" /></template>
                {{ !onlyIcon ? t('删除') : '' }}
            </AuthButton>
        </t-space>

        <t-divider size="8px" />

        <div class="table-container">
            <HistoryList :query="query" :refresh="refresh" @select="onTableSelectChange" />
        </div>

        <template v-for="(view, idx) in views" :key="view.id">
            <HistoryDetail :history-id="view.historyId" :offset-x="idx * 30" :offset-y="idx * 30" :open="true"
                @close="() => onViewClose(view)" />
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayer } from '@/hooks/useLayer';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { useThemeStore } from '@/store/modules/theme';
import { permission } from '@/utils/permission';
import { api } from '@/utils/api';

import HistoryQuery from './HistoryQuery.vue';
import HistoryList from './HistoryList.vue';
import HistoryDetail from './HistoryDetail.vue';
import AuthButton from '@/components/AuthButton.vue';
import { AdminHistory } from '@/utils/I18NNamespace';

const { t, f } = useTranslation(AdminHistory);
const request = useRequest();
const { message, confirm } = useLayer();
const showResult = useShowResult(AdminHistory);
const themeStore = useThemeStore();

const query = ref({});
const selectedRows = ref<any[]>([]);
const refresh = ref({ reset: false, tag: 1 });
const views = ref<any[]>([]);

const onlyIcon = computed(() => themeStore.onlyIcon);

const onQuery = (values: any) => {
    query.value = values;
};

const onTableSelectChange = (rows: any[]) => {
    selectedRows.value = rows;
};

const onRefresh = () => {
    refresh.value = { reset: false, tag: refresh.value.tag + 1 };
};

const onViewDetail = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选择要查看的日志'));
        return;
    }
    const map = new Map<any, any>();
    selectedRows.value.forEach((r) => {
        const hid = r?.historyId;
        if (hid === undefined || hid === null) return;
        if (!map.has(hid)) map.set(hid, r);
    });
    views.value = Array.from(map.values());
};

const onViewClose = (item: any) => {
    views.value = views.value.filter(v => v.historyId);
};

const onDelete = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选择要删除的日志'));
        return;
    }

    const histories = selectedRows.value;
    const ids = histories.map(item => item.id).join(', ');

    confirm({
        content: `${t('确定要删除以下日志记录：')}${ids}`,
        onOk: async (close) => {
            const result = await request.get(`${api.history.deletes}?ids=${ids}`);
            showResult.show(result);
            if (result.status) {
                onRefresh();
                selectedRows.value = [];
                close();
            }
        }
    });
};
</script>

<style scoped>
.history-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.table-container {
    flex: 1;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
}
</style>
