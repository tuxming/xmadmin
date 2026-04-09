<template>
    <div :style="wrapperStyle">
        <div style="position: relative;">
            <component :is="`h${titleLevel}`" :style="titleStyle">
                {{ t('分配角色') }}
            </component>
        </div>

        <t-space break-line>
            <t-tag v-for="r in userRoles" :key="r.id" theme="primary" :color="getRoleCustomColor(r.type)"
                variant="light-outline" closable @close="onDelete(r)">
                {{ `${r.roleName}(${r.code})` }}
            </t-tag>

            <t-tag style="background: var(--td-bg-color-container); border-style: dashed; cursor: pointer;"
                @click="onAdd">
                <template #icon><t-icon name="add" /></template>
                {{ t('添加角色') }}
            </t-tag>
        </t-space>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayer } from '@/hooks/useLayer';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { useDictStore } from '@/store/modules/dict';
import { api } from '@/utils/api';
import RoleSelector from '../role/RoleSelector.vue';
import { AdminUser } from '@/utils/I18NNamespace';

const props = withDefaults(defineProps<{
    userId: number;
    titleLevel?: number;
    titleStyle?: any;
    wrapperStyle?: any;
}>(), {
    titleLevel: 5
});

const { t, f } = useTranslation(AdminUser);
const request = useRequest();
const { confirm, message } = useLayer();
const showResult = useShowResult(AdminUser);
const dictStore = useDictStore();

const userRoles = ref<any[]>([]);
const selectRoleValue = ref<any>(null);

const getUserRoles = async () => {
    const result = await request.get(`${api.user.userRoles}?id=${props.userId}`);
    if (result.status) {
        const data: any = result.data;
        userRoles.value = Array.isArray(data) ? data : Array.isArray(data?.list) ? data.list : [];
    }
};

onMounted(() => {
    dictStore.getDict('RoleType');
    getUserRoles();
});

const getRoleColor = (type: any) => {
    const roleTypes = dictStore.dicts['RoleType'] || [];
    const rt = roleTypes.find((r) => r.value == type);
    return rt?.color || '';
};

const getRoleCustomColor = (type: any) => {
    const c = getRoleColor(type);
    const allowed = ['default', 'primary', 'success', 'warning', 'danger'];
    if (!c || (typeof c === 'string' && allowed.includes(c))) return undefined;
    return c;
};


const onDelete = (role: any) => {
    confirm({
        title: t('删除用户角色'),
        content: f('确定要删用户的角色%s？', [role.roleName]),
        onOk: async (close) => {
            const result = await request.get(`${api.user.userRoleDelete}?id=${role.id}`);
            showResult.show(result);
            if (result.status) {
                getUserRoles();
                close();
            }
        }
    });
};

const submitAdd = async (closeFn: Function) => {
    if (!selectRoleValue.value) {
        message.warning(t('请选择角色'));
        return;
    }

    // Handle both array and single value structures from RemoteSelect
    let rid = null;
    if (Array.isArray(selectRoleValue.value) && selectRoleValue.value.length > 0) {
        rid = selectRoleValue.value[0];
    } else {
        rid = selectRoleValue.value;
    }

    const result = await request.get(`${api.user.userRoleAdd}?id=${props.userId}&rid=${rid}`);
    showResult.show(result);
    if (result.status) {
        getUserRoles();
        closeFn();
    }
};

const onAdd = () => {
    selectRoleValue.value = null;

    confirm({
        title: t('请选择角色'),
        width: 300,
        content: h('div', { style: { marginTop: '15px' } }, [
            h(RoleSelector, {
                mode: 'single',
                modelValue: selectRoleValue.value,
                'onUpdate:modelValue': (val: any) => { selectRoleValue.value = val; }
            })
        ]),
        onOk: (closeFn) => {
            submitAdd(closeFn);
        }
    });
};
</script>

<style scoped>
:deep(.t-tag__close) {
    color: inherit;
}
</style>
