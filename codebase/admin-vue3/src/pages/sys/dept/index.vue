<template>
    <div class="dept-page">
        <div class="table-toolbar">
            <t-space wrap>
                <AuthButton theme="primary" :tip="t('新增组织')" :required-permissions="permission.dept?.create?.expression"
                    @click="onCreate">
                    <template #icon><t-icon name="add" /></template>
                    {{ !onlyIcon ? t('新增') : '' }}
                </AuthButton>
                <AuthButton theme="default" :tip="t('编辑组织')" :required-permissions="permission.dept?.update?.expression"
                    @click="onEdit">
                    <template #icon><t-icon name="edit" /></template>
                    {{ !onlyIcon ? t('编辑') : '' }}
                </AuthButton>
                <AuthButton theme="danger" :tip="t('删除组织')" :required-permissions="permission.dept?.delete?.expression"
                    @click="onDelete">
                    <template #icon><t-icon name="delete" /></template>
                    {{ !onlyIcon ? t('删除') : '' }}
                </AuthButton>
            </t-space>
        </div>

        <div class="table-container">
            <DeptList ref="listRef" :query="query" @select="onTableSelectChange" />
        </div>

        <DeptEdit v-if="isEditOpen" v-model:open="isEditOpen" :title="title" :dept="dept" @close="onEditClose"
            @success="onEditSuccess" />
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
import AuthButton from '@/components/AuthButton.vue';
import DeptList from './DeptList.vue';
import DeptEdit from './DeptEdit.vue';
import { AdminDept } from '@/utils/I18NNamespace';

const { t, f } = useTranslation(AdminDept);
const themeStore = useThemeStore();
const { message, confirm } = useLayer();
const request = useRequest();
const showResult = useShowResult(AdminDept);

const onlyIcon = computed(() => themeStore.onlyIcon);

const query = ref({});
const selectedRows = ref<any[]>([]);
const isEditOpen = ref(false);
const title = ref('');
const dept = ref<any>(undefined);
const listRef = ref<any>(null);

const onTableSelectChange = (rows: any[]) => {
    selectedRows.value = rows;
};

const onCreate = () => {
    if (selectedRows.value && selectedRows.value.length > 0) {
        const row = selectedRows.value[0];

        // TDesign 在 tree 模式下，真实的业务数据通常包裹在 row.row 里面
        const rowData = row.row || row;

        // row.pathName is like "系统管理/研发部/" or "研发部/"
        let pName = rowData.name;

        if (rowData.pathName) {
            const parts = String(rowData.pathName).split('/').filter(Boolean);
            if (parts.length > 0) {
                pName = parts[parts.length - 1];
            }
        }


        dept.value = {
            // 传递完整的对象给选择器，这样它就能提取 id 和 name
            parentId: {
                id: rowData.id,
                name: pName
            },
            parentName: rowData.pathName,
            path: rowData.path ? String(rowData.path) : ''
        };
    } else {
        dept.value = {};
    }
    isEditOpen.value = true;
    title.value = t('新增组织');
};

const onEdit = () => {
    if (selectedRows.value && selectedRows.value.length > 0) {
        const row = selectedRows.value[0];

        // TDesign 在 tree 模式下，真实的业务数据通常包裹在 row.row 里面
        const rowData = row.row || row;

        if (rowData.id === 1) {
            message.warning(t('禁止编辑'));
            return;
        }

        let parentName = '';
        if (rowData.pathName) {
            parentName = rowData.pathName.substring(0, rowData.pathName.length - 1);
            parentName = parentName.substring(0, parentName.lastIndexOf('/') + 1);
        }

        // row.path is like "/1/34/35/". The parent path would be "/1/34/"
        const pathStr = rowData.path ? String(rowData.path) : '';
        let parentPath = '';
        if (pathStr) {
            parentPath = pathStr.substring(0, pathStr.length - 1);
            parentPath = parentPath.substring(0, parentPath.lastIndexOf('/') + 1);
        }

        let pName = parentName;
        if (parentName) {
            const parts = String(parentName).split('/').filter(Boolean);
            if (parts.length > 0) {
                pName = parts[parts.length - 1];
            }
        }

        dept.value = {
            ...rowData,
            parentId: { id: rowData.parentId, name: pName },
            parentName,
            path: parentPath
        };
        isEditOpen.value = true;
        title.value = t('编辑组织');
    } else {
        message.warning(t('请先选中组织，在编辑'));
    }
};

const onEditSuccess = (payload: { type: string, object: any }) => {
    isEditOpen.value = false;
    selectedRows.value = [];
    if (listRef.value) {
        listRef.value.refreshNode(payload.type, payload.object);
    }
};

const onEditClose = () => {
    isEditOpen.value = false;
};

const onDelete = () => {
    if (selectedRows.value.length === 0) {
        message.warning(t('请选择要删除的组织'));
        return;
    }

    const row = selectedRows.value[0];
    const rowData = row.row || row;

    if (rowData.id === 1) {
        message.warning(t('禁止删除'));
        return;
    }

    confirm({
        content: f('确定要删除组织：%s?, 该组织及其子节点都会被一起删除，请确定无误在删除！', [rowData.name]),
        onOk: async (onClose) => {
            const result = await request.get(`${api.dept.delete}?id=${rowData.id}`);
            showResult.show(result);
            if (result.status) {
                if (listRef.value) {
                    listRef.value.refreshNode('delete', rowData);
                }
                onClose();
            }
        }
    });
};


</script>

<style scoped>
.dept-page {
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.table-toolbar {
    margin-bottom: 16px;
}

.table-container {
    width: 100%;
    flex: 1;
    overflow: hidden;
}
</style>
