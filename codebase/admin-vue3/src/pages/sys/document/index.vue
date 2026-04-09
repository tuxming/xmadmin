<template>
    <div class="document-page">
        <DocumentQuery @query="onQuery" />
        <t-divider size="8px" />

        <t-space wrap>
            <t-upload ref="uploadRef" theme="custom" :request-method="customUpload" :show-upload-progress="false"
                @success="onUploadSuccess" @fail="onUploadFail">
                <AuthButton theme="primary" :tip="t('上传文件')"
                    :required-permissions="permission.document.create.expression">
                    <template #icon><t-icon name="upload" /></template>
                    {{ !onlyIcon ? t('上传') : '' }}
                </AuthButton>
            </t-upload>

            <AuthButton theme="danger" variant="outline" :tip="t('删除文件')"
                :required-permissions="permission.document.delete.expression" @click="onDelete">
                <template #icon><t-icon name="delete" /></template>
                {{ !onlyIcon ? t('删除') : '' }}
            </AuthButton>
        </t-space>

        <t-divider size="8px" />

        <div class="table-container">
            <DocumentList :query="query" :refresh="refresh" @select="onTableSelectChange" />
        </div>
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

import DocumentQuery from './DocumentQuery.vue';
import DocumentList from './DocumentList.vue';
import AuthButton from '@/components/AuthButton.vue';
import { AdminDocument } from '@/utils/I18NNamespace';

const { t } = useTranslation(AdminDocument);
const request = useRequest();
const { message, confirm } = useLayer();
const showResult = useShowResult(AdminDocument);
const themeStore = useThemeStore();

const query = ref({});
const selectedRows = ref<any[]>([]);
const refresh = ref({ reset: false, tag: 1 });

const onlyIcon = computed(() => themeStore.onlyIcon);

const uploadType = 'common';
const uploadAction = computed(() => `${api.document.upload}?type=${encodeURIComponent(uploadType)}`);

const customUpload = async (file: any) => {
    try {
        const formData = new FormData();
        formData.append('file', file.raw);
        const res: any = await request.post(uploadAction.value, formData, {
            'Content-Type': 'multipart/form-data'
        });

        if (res && res.status) {
            return { status: 'success', response: res };
        } else {
            return { status: 'fail', error: res?.msg || '上传失败' };
        }
    } catch (err: any) {
        return { status: 'fail', error: err.message || '上传失败' };
    }
};

const onQuery = (values: any) => {
    query.value = values;
};

const onTableSelectChange = (rows: any[]) => {
    selectedRows.value = rows;
};

const onRefresh = (reset = false) => {
    refresh.value = { reset, tag: refresh.value.tag + 1 };
};

const onDelete = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选择要删除的文件'));
        return;
    }

    const docs = selectedRows.value;
    const names = docs.map(item => item.fileName).join(', ');

    confirm({
        content: `${t('确定要删除以下文件：')}${names}`,
        onOk: async (close) => {
            const ids = docs.map(p => p.id).join(',');
            const result = await request.get(`${api.document.deletes}?ids=${ids}`);
            showResult.show(result);
            if (result.status) {
                onRefresh();
                selectedRows.value = [];
                close();
            }
        }
    });
};

const onUploadSuccess = (context: any) => {
    const { file } = context;
    // context.response contains the formatted response returned by formatUploadResponse
    const response = context.response;

    if (response?.status === 'success' || response?.status === true) {
        message.success(`${file.name} ${t('上传成功')}`);
        onRefresh(true);
    } else {
        message.error(`${file.name} ${t('上传失败')}: ${response?.error || response?.msg || ''}`);
    }
};

const onUploadFail = (context: any) => {
    const { file } = context;
    message.error(`${file.name} ${t('上传失败')}`);
};
</script>

<style scoped>
.document-page {
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
