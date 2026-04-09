<template>
    <div style="height: 100%">
        <DoubleColumnLayout :width="containerWidth" :left-width="leftWidth">
            <template #left>
                <div :style="{ height: pos.height ? (pos.height - 85) + 'px' : '100%' }">
                    <t-space>
                        <AuthButton theme="primary" variant="outline" shape="circle" :tip="t('新增字典名')"
                            :required-permissions="permission.dict.groupAdd.expression" @click="onCreateGroup">
                            <template #icon><t-icon name="add" /></template>
                        </AuthButton>
                        <AuthButton theme="default" variant="outline" shape="circle" :tip="t('编辑字典名')"
                            :required-permissions="permission.dict.groupUpdate.expression" @click="onEditGroup">
                            <template #icon><t-icon name="edit" /></template>
                        </AuthButton>
                        <AuthButton theme="danger" variant="outline" shape="circle" :tip="t('删除字典名')"
                            :required-permissions="permission.dict.groupDelete.expression" @click="onDeletGroup">
                            <template #icon><t-icon name="delete" /></template>
                        </AuthButton>
                    </t-space>
                    <t-divider size="8px" />
                    <t-menu :value="query.groupName"
                        style="text-align: left; height: calc(100% - 90px); overflow: auto;" @change="onSelectMenu">
                        <t-menu-item v-for="item in items" :key="item.key" :value="item.key">
                            {{ item.label }}
                        </t-menu-item>
                    </t-menu>
                </div>
            </template>

            <template #right>
                <div style="padding-left: 15px; height: 100%; display: flex; flex-direction: column;">
                    <QueryComponent @query="onQuery" />
                    <t-divider size="8px" />
                    <t-space wrap>
                        <AuthButton theme="primary" :tip="t('新增字典数据')"
                            :required-permissions="permission.dict.add.expression" @click="onCreateDict">
                            <template #icon><t-icon name="add" /></template>
                            {{ !onlyIcon ? t('新增') : '' }}
                        </AuthButton>
                        <AuthButton theme="default" :tip="t('编辑字典数据')"
                            :required-permissions="permission.dict.update.expression" @click="onEditDict">
                            <template #icon><t-icon name="edit" /></template>
                            {{ !onlyIcon ? t('编辑') : '' }}
                        </AuthButton>
                        <AuthButton theme="danger" :tip="t('删除字典数据')"
                            :required-permissions="permission.dict.delete.expression" @click="onDeleteDict">
                            <template #icon><t-icon name="delete" /></template>
                            {{ !onlyIcon ? t('删除') : '' }}
                        </AuthButton>
                    </t-space>
                    <t-divider size="8px" />
                    <div class="table-container">
                        <DictList :query="query" :refresh="refresh"
                            :width="containerWidth ? containerWidth - leftWidth - 50 : undefined"
                            :used-width="leftWidth + 30" @select="onTableSelectChange" />
                    </div>
                </div>
            </template>
        </DoubleColumnLayout>

        <DictGroupEdit v-if="isGroupEditOpen" v-model:open="isGroupEditOpen" :group="editGroupObj" :title="title"
            @close="onGroupEditClose" />

        <DictEdit v-if="isDictEditOpen" v-model:open="isDictEditOpen" :groups="groups" :dict="selectedDict"
            :title="dictTitle" @close="onDictClose" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayer } from '@/hooks/useLayer';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { useThemeStore } from '@/store/modules/theme';
import { useGlobalStore } from '@/store/modules/global';
import { permission } from '@/utils/permission';
import { api } from '@/utils/api';
import { computePx } from '@/utils/kit';

import AuthButton from '@/components/AuthButton.vue';
import DoubleColumnLayout from '@/components/DoubleColumnLayout.vue';
import QueryComponent from '@/components/QueryComponent.vue';
import DictList from './DictList.vue';
import DictGroupEdit from './DictGroupEdit.vue';
import DictEdit from './DictEdit.vue';
import { AdminDict } from '@/utils/I18NNamespace';

const { t, f } = useTranslation(AdminDict);
const themeStore = useThemeStore();
const globalStore = useGlobalStore();
const { message, confirm } = useLayer();
const request = useRequest();
const showResult = useShowResult(AdminDict);

const containerWidth = ref<number>();
const leftWidth = ref(250);
const groups = ref<any[]>([]);
const query = ref<any>({});
const refresh = ref({ reset: false, tag: 1 });

const selectedDictRows = ref<any[]>([]);
const selectedGroup = ref<any>();

const editGroupObj = ref<any>();
const isGroupEditOpen = ref(false);
const isCreateDict = ref(false);
const title = ref('');
const dictTitle = ref(t('添加字典'));

const isDictEditOpen = ref(false);
const selectedDict = ref<any>();

const onlyIcon = computed(() => themeStore.onlyIcon);

const items = computed(() => {
    return groups.value.map(g => ({
        key: g.code,
        label: `${g.label}-${g.code}`
    }));
});

const getGroups = async () => {
    const result = await request.get(api.dict.groups);
    if (result.status) {
        groups.value = result.data;
    }
};

onMounted(() => {
    getGroups();
});

watch(() => [globalStore.width, themeStore.sideWidth, themeStore.collapsed], () => {
    containerWidth.value = themeStore.collapsed
        ? globalStore.width - 50 - 50
        : globalStore.width - themeStore.sideWidth - 50;
}, { immediate: true });

const onTableSelectChange = (rows: any[]) => {
    selectedDictRows.value = rows;
};

const onQuery = (values: any) => {
    query.value = { ...query.value, ...values };
};

const onSelectMenu = (value: any) => {
    query.value = { ...query.value, groupName: value };
    selectedGroup.value = groups.value.find(s => s.code === value);
};

const onCreateGroup = () => {
    editGroupObj.value = null;
    title.value = t('添加字典');
    isCreateDict.value = true;
    isGroupEditOpen.value = true;
};

const onEditGroup = () => {
    if (!selectedGroup.value) {
        message.warning(t('请选中数据语言后，再编辑'));
        return;
    }
    title.value = t('编辑字典');
    editGroupObj.value = selectedGroup.value;
    isCreateDict.value = false;
    isGroupEditOpen.value = true;
};

const onDeletGroup = () => {
    if (!selectedGroup.value) {
        message.warning(t('请选中字典后，删除'));
        return;
    }
    confirm({
        title: f('确定要删除：%s?', [selectedGroup.value.label]),
        content: t('删除语言将会删除对应的所有数据'),
        onOk: async (onClose) => {
            const result = await request.get(`${api.dict.deleteGroup}?code=${selectedGroup.value.code}`);
            showResult.show(result);
            if (result.status) {
                getGroups();
                if (query.value.groupName === selectedGroup.value.code) {
                    query.value = { ...query.value, groupName: undefined };
                }
            }
            onClose();
        }
    });
};

const onCreateDict = () => {
    if (!query.value.groupName) {
        message.warning(t('请先在左侧选择字典分类'));
        return;
    }
    selectedDict.value = { groupName: query.value.groupName };
    dictTitle.value = t('添加字典数据');
    isDictEditOpen.value = true;
};

const onEditDict = () => {
    if (selectedDictRows.value.length === 0) {
        message.warning(t('请选择一条数据'));
        return;
    }
    dictTitle.value = t('编辑字典数据');
    selectedDict.value = selectedDictRows.value[0];
    isDictEditOpen.value = true;
};

const onDeleteDict = () => {
    if (selectedDictRows.value.length === 0) {
        message.warning(t('请选中字典数据后，再点击删除'));
        return;
    }
    confirm({
        content: f('确定要删除字典：%s?', [selectedDictRows.value[0].dictLabel]),
        onOk: async (onClose) => {
            const result = await request.get(`${api.dict.deleteDict}?id=${selectedDictRows.value[0].id}`);
            showResult.show(result);
            if (result.status) {
                refresh.value = { reset: true, tag: refresh.value.tag + 1 };
                onClose();
            }
        }
    });
};

const onDictClose = (needRefresh: boolean) => {
    isDictEditOpen.value = false;
    if (needRefresh) {
        refresh.value = { reset: true, tag: Date.now() };
    }
};

const onGroupEditClose = (group: any) => {
    if (isCreateDict.value) {
        if (group) {
            getGroups();
        }
    } else {
        getGroups();
    }
    isGroupEditOpen.value = false;
    isCreateDict.value = false;
};

const modalPos = inject<any>('modalContext', null);

const pos = computed(() => {
    if (modalPos?.value?.width && modalPos?.value?.height) {
        return {
            width: computePx(modalPos.value.width),
            height: computePx(modalPos.value.height, true)
        };
    }
    return { width: undefined, height: undefined };
});
</script>

<style scoped>
.table-container {
    flex: 1;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
}
</style>
