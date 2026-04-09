<template>
    <div class="user-page">
        <UserQuery @query="onQuery" />
        <t-divider size="8px" />

        <t-space wrap>
            <AuthButton theme="primary" :tip="t('新增用户')" :required-permissions="permission.user.create.expression"
                @click="onCreate">
                <template #icon><t-icon name="add" /></template>
                {{ !onlyIcon ? t('新增') : '' }}
            </AuthButton>

            <AuthButton theme="default" :tip="t('编辑用户')" :required-permissions="permission.user.update.expression"
                @click="onEdit">
                <template #icon><t-icon name="edit" /></template>
                {{ !onlyIcon ? t('编辑') : '' }}
            </AuthButton>

            <AuthButton theme="danger" :tip="t('删除用户')" :required-permissions="permission.user.delete.expression"
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
            <UserList :query="query" :refresh="refresh" @select="onTableSelectChange" />
        </div>

        <UserAdd v-if="openAdd" v-model:open="openAdd" @close="onAddClose" />

        <UserEdit v-for="(user, index) in editUsers" :key="user.id || index" :open="true" :user="user"
            :modal-offset="{ x: index * 10, y: index * 10 }"
            @update:open="(val) => { if (!val) onEditClose(false, index) }"
            @close="(needRefresh) => onEditClose(needRefresh, index)" />

        <UserGrantDataPermissionModal v-if="openGrantData" v-model:open="openGrantData" :user-id="grantUser?.id"
            @close="() => openGrantData = false" />

        <UserGrantRoleModal v-if="openGrantUserRole" v-model:open="openGrantUserRole" :user-id="grantRoleUser?.id"
            @close="() => openGrantUserRole = false" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayer } from '@/hooks/useLayer';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { useThemeStore } from '@/store/modules/theme';
import { useUserStore } from '@/store/modules/user';
import { permission } from '@/utils/permission';
import { api } from '@/utils/api';
import AuthButton from '@/components/AuthButton.vue';

import UserQuery from './UserQuery.vue';
import UserList from './UserList.vue';
import UserAdd from './UserAdd.vue';
import UserEdit from './UserEdit.vue';
import UserGrantDataPermissionModal from './UserGrantDataPermissionModal.vue';
import UserGrantRoleModal from './UserGrantRoleModal.vue';
import { AdminUser } from '@/utils/I18NNamespace';

const { t, f } = useTranslation(AdminUser);
const request = useRequest();
const { message, confirm } = useLayer();
const showResult = useShowResult(AdminUser);
const themeStore = useThemeStore();
const userStore = useUserStore();

const query = ref({});
const selectedRows = ref<any[]>([]);
const refresh = ref({ reset: false, tag: 1 });

const openAdd = ref(false);
const openGrantData = ref(false);
const openGrantUserRole = ref(false);

// 使用数组来存储需要打开的编辑窗口的用户数据
const editUsers = ref<any[]>([]);
const grantUser = ref<any>(null);
const grantRoleUser = ref<any>(null);

const onlyIcon = computed(() => themeStore.onlyIcon);

const onQuery = (values: any) => {
    query.value = values;
};

const onTableSelectChange = (rows: any[]) => {
    selectedRows.value = rows;
};

const onCreate = () => {
    openAdd.value = true;
};

const onEdit = async () => {
    if (selectedRows.value && selectedRows.value.length > 0) {
        // 遍历所有选中的行，为每一行获取详情并打开一个编辑窗口
        for (const row of selectedRows.value) {
            const result = await request.get(`${api.user.get}?id=${row.id}`);
            showResult.show(result);
            if (result.status) {
                // 将获取到的用户详情推入数组
                editUsers.value.push(result.data);
            }
        }
    } else {
        message.warning(t('请先选中用户，再编辑'));
    }
};

const onDelete = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选中要删除的用户后，再删除'));
        return;
    }

    confirm({
        content: f('确定要删除用户：%s?', [selectedRows.value[0].fullname]),
        onOk: async (close) => {
            const result = await request.get(`${api.user.delete}?id=${selectedRows.value[0].id}`);
            showResult.show(result);
            if (result.status) {
                refresh.value = { reset: true, tag: refresh.value.tag + 1 };
                selectedRows.value = [];
                close();
            }
        }
    });
};

const onForceDelete = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选中要删除的用户后，再操作'));
        return;
    }

    confirm({
        content: f('确定要彻底删除用户及相关数据权限：%s?', [selectedRows.value[0].fullname]),
        onOk: async (close) => {
            const result = await request.get(`${api.user.forceDelete}?id=${selectedRows.value[0].id}`);
            showResult.show(result);
            if (result.status) {
                refresh.value = { reset: true, tag: refresh.value.tag + 1 };
                selectedRows.value = [];
                close();
            }
        }
    });
};

const setNeedRefresh = (needRefresh: boolean) => {
    if (needRefresh) {
        refresh.value = { reset: true, tag: refresh.value.tag + 1 };
    }
};

const onAddClose = (needRefresh: boolean) => {
    setNeedRefresh(needRefresh);
    openAdd.value = false;
};

const onEditClose = (needRefresh: boolean, index: number) => {
    setNeedRefresh(needRefresh);
    // 从数组中移除当前关闭的编辑窗口数据
    editUsers.value.splice(index, 1);
};

const grantData = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选中要用户后，再操作'));
        return;
    }
    grantUser.value = selectedRows.value[0];
    openGrantData.value = true;
};

const grantRole = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选中要用户后，再操作'));
        return;
    }
    grantRoleUser.value = selectedRows.value[0];
    openGrantUserRole.value = true;
};

const loginAsUser = () => {
    if (!selectedRows.value || selectedRows.value.length === 0) {
        message.warning(t('请选中要登录的用户后，再操作'));
        return;
    }

    confirm({
        content: f('确定要以 %s 的身份登录吗?', [selectedRows.value[0].fullname]),
        onOk: async (close) => {
            const result = await request.get(`${api.user.loginAs}?id=${selectedRows.value[0].id}`);
            showResult.show(result);
            if (result.status) {
                const tokenHistory = JSON.parse(localStorage.getItem('userInfos') || '[]');

                tokenHistory.unshift({
                    user: userStore.userInfo,
                    token: userStore.token
                });

                if (tokenHistory.length > 5) {
                    tokenHistory.splice(5);
                }

                localStorage.setItem('userInfos', JSON.stringify(tokenHistory));

                userStore.setToken(result.data.jwtToken);
                userStore.setUserInfo(result.data.user);
                document.cookie = `jwtToken=${result.data.jwtToken}; path=/; max-age=${60 * 60 * 24}`;

                setTimeout(() => {
                    window.location.href = api.backendPage;
                }, 1000);
                close();
            }
        }
    });
};

const dropdownItems = computed(() => {
    const items = [];

    items.push({ content: t('分配角色'), value: 'grantRole' });
    items.push({ content: t('分配数据权限'), value: 'grantData' });
    items.push({ content: t('登录此用户'), value: 'loginAs' });

    items.push({
        content: t('彻底删除'),
        value: 'forceDelete',
        theme: 'error'
    });

    return items;
});

const handleDropdownClick = (data: any) => {
    if (data.value === 'grantRole') {
        grantRole();
    } else if (data.value === 'grantData') {
        grantData();
    } else if (data.value === 'loginAs') {
        loginAsUser();
    } else if (data.value === 'forceDelete') {
        onForceDelete();
    }
};
</script>

<style scoped>
.user-page {
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
