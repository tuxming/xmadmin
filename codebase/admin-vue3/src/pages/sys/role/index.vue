<template>
    <div class="role-page">
        <RoleQuery @query="onQuery" />
        <t-divider size="8px" />

        <t-space wrap style="margin-top: 20px">
            <AuthButton theme="primary" :tip="t('新增角色')" :required-permissions="permission.role.create.expression"
                @click="onCreate">
                <template #icon><t-icon name="add" /></template>
                {{ !onlyIcon ? t('新增') : '' }}
            </AuthButton>

            <AuthButton theme="default" :tip="t('编辑角色')" :required-permissions="permission.role.update.expression"
                @click="onEdit">
                <template #icon><t-icon name="edit" /></template>
                {{ !onlyIcon ? t('编辑') : '' }}
            </AuthButton>

            <AuthButton theme="danger" :tip="t('删除角色')" :required-permissions="permission.role.delete.expression"
                @click="onDelete">
                <template #icon><t-icon name="delete" /></template>
                {{ !onlyIcon ? t('删除') : '' }}
            </AuthButton>

            <t-dropdown :options="dropdownItems" @click="handleDropdownClick">
                <t-button theme="default" variant="outline">
                    {{ t('更多操作') }}
                    <template #suffix><t-icon name="chevron-down" /></template>
                </t-button>
            </t-dropdown>
        </t-space>

        <t-divider size="8px" />

        <div class="table-container">
            <RoleList :query="query" :refresh="refresh" @select="onTableSelectChange" />
        </div>

        <RoleEdit v-if="isOpenEdit" v-model:open="isOpenEdit" :role="role" @close="onAddClose" />

        <RoleGrantPermission v-if="grantPermissionVisible" :open="grantPermissionVisible"
            @update:open="grantPermissionVisible = $event" :role-id="grantPermissionRoleId"
            @close="() => grantPermissionVisible = false" />

        <RoleGrantMenu v-if="grantMenuVisible" :open="grantMenuVisible" @update:open="grantMenuVisible = $event"
            :role-id="grantMenuRoleId" @close="() => grantMenuVisible = false" />
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

import RoleQuery from './RoleQuery.vue';
import RoleList from './RoleList.vue';
import RoleEdit from './RoleEdit.vue';
import RoleGrantPermission from './RoleGrantPermission.vue';
import RoleGrantMenu from './RoleGrantMenu.vue';
import { AdminRole } from '@/utils/I18NNamespace';

const { t, f } = useTranslation(AdminRole);
const request = useRequest();
const { message, confirm } = useLayer();
const showResult = useShowResult(AdminRole);
const themeStore = useThemeStore();

const query = ref({});
const selectedRows = ref<any[]>([]);
const refresh = ref({ reset: false, tag: 1 });

const isOpenEdit = ref(false);
const role = ref<any>(null);

const grantPermissionVisible = ref(false);
const grantPermissionRoleId = ref<any>(null);

const grantMenuVisible = ref(false);
const grantMenuRoleId = ref<any>(null);

const onlyIcon = computed(() => themeStore.onlyIcon);

const onQuery = (values: any) => {
    query.value = values;
};

const onTableSelectChange = (rows: any[]) => {
    selectedRows.value = rows;
};

const onCreate = () => {
    role.value = null;
    isOpenEdit.value = true;
};

const onEdit = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选择要编辑的角色'));
        return;
    }
    role.value = selectedRows.value[0];
    isOpenEdit.value = true;
};

const onDelete = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选择要删除的角色'));
        return;
    }

    confirm({
        content: f('确定要删除选中的 %s 个角色吗?', [selectedRows.value.length]),
        onOk: async (close) => {
            // Create comma-separated string of IDs
            const ids = selectedRows.value.map(r => r.id).join(',');
            const result = await request.get(`${api.role.deletes}?ids=${ids}`);
            showResult.show(result);
            if (result.status) {
                refresh.value = { reset: true, tag: refresh.value.tag + 1 };
                selectedRows.value = [];
                close();
            }
        }
    });
};

const onAddClose = (needRefresh: boolean) => {
    if (needRefresh) {
        refresh.value = { reset: true, tag: refresh.value.tag + 1 };
    }
    isOpenEdit.value = false;
};

const grantMenus = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选择角色'));
        return;
    }
    grantMenuRoleId.value = selectedRows.value[0].id;
    grantMenuVisible.value = true;
};

const grantPermissions = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选择角色'));
        return;
    }
    grantPermissionRoleId.value = selectedRows.value[0].id;
    grantPermissionVisible.value = true;
};

const dropdownItems = computed(() => {
    const items = [];

    items.push({ content: t('分配菜单'), value: 'grantMenu' });
    items.push({ content: t('分配权限'), value: 'grantPermission' });

    return items;
});

const handleDropdownClick = (data: any) => {
    if (data.value === 'grantMenu') {
        grantMenus();
    } else if (data.value === 'grantPermission') {
        grantPermissions();
    }
};
</script>

<style scoped>
.role-page {
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
