<template>
  <div style="height: 100%">
    <DoubleColumnLayout :width="containerWidth" :left-width="leftWidth">
      <template #left>
        <div :style="{ height: pos.height ? (pos.height - 90) + 'px' : '100%' }">
          <t-space>
            <AuthButton theme="primary" variant="outline" shape="circle" :tip="t('新增语言')" :required-permissions="permission.lang?.langAdd?.expression" @click="onCreateLang">
              <template #icon><t-icon name="add" /></template>
            </AuthButton>
            <AuthButton theme="default" variant="outline" shape="circle" :tip="t('编辑语言')" :required-permissions="permission.lang?.langEdit?.expression" @click="onEditLang">
              <template #icon><t-icon name="edit" /></template>
            </AuthButton>
            <AuthButton theme="danger" variant="outline" shape="circle" :tip="t('删除语言')" :required-permissions="permission.lang?.langDelete?.expression" @click="onLangDelete">
              <template #icon><t-icon name="delete" /></template>
            </AuthButton>
          </t-space>
          <t-divider size="8px" />
          
          <t-menu
            :value="activeMenuKey"
            :expanded="openKeys"
            style="text-align: left; height: calc(100% - 90px); overflow: auto;"
            @change="onSelectMenu"
            @expand="onOpenMenu"
          >
            <t-submenu v-for="g in groups" :key="g" :value="g" :title="g">
              <t-menu-item v-for="lang in langs" :key="lang.id + '$$' + g" :value="lang.id + '$$' + g">
                {{ lang.label }}({{ lang.code }})
              </t-menu-item>
            </t-submenu>
          </t-menu>
        </div>
      </template>

      <template #right>
        <div style="padding-left: 15px; height: 100%; display: flex; flex-direction: column;">
          <QueryComponent @query="onQuery" />
          <t-divider size="8px" />
          
          <t-space wrap>
            <AuthButton theme="primary" :tip="t('新增资源')" :required-permissions="permission.lang?.resAdd?.expression" @click="onResCreate">
              <template #icon><t-icon name="add" /></template>
              {{ !onlyIcon ? t('新增') : '' }}
            </AuthButton>
            
            <AuthButton theme="default" :tip="t('编辑资源')" :required-permissions="permission.lang?.resEdit?.expression" @click="onResEdit">
              <template #icon><t-icon name="edit" /></template>
              {{ !onlyIcon ? t('编辑') : '' }}
            </AuthButton>
            
            <AuthButton theme="danger" :tip="t('删除资源')" :required-permissions="permission.lang?.resDelete?.expression" @click="onResDelete">
              <template #icon><t-icon name="delete" /></template>
              {{ !onlyIcon ? t('删除') : '' }}
            </AuthButton>
          </t-space>
          <t-divider size="8px" />
          
          <div class="table-container">
            <ResourceList
              :query="query"
              :refresh="refresh"
              :width="containerWidth ? containerWidth - leftWidth - 50 : undefined"
              :used-width="leftWidth + 30"
              @select="onTableSelectChange"
            />
          </div>
        </div>
      </template>
    </DoubleColumnLayout>

    <LangEdit
      v-if="isLangEditOpen"
      v-model:open="isLangEditOpen"
      :lang="editLangObj"
      :title="title"
      @close="onLangEditClose"
    />
    
    <ResourceEdit
      v-if="isResEditOpen"
      v-model:open="isResEditOpen"
      :langs="langs"
      :groups="groups"
      :resource="selectedResource"
      @close="onResClose"
    />
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
import ResourceList from './ResourceList.vue';
import LangEdit from './LangEdit.vue';
import ResourceEdit from './ResourceEdit.vue';
import { AdminLang } from '@/utils/I18NNamespace';

const { t, f } = useTranslation(AdminLang);
const themeStore = useThemeStore();
const globalStore = useGlobalStore();
const { message, confirm } = useLayer();
const request = useRequest();
const showResult = useShowResult(AdminLang);

const containerWidth = ref<number>();
const leftWidth = ref(250);
const groups = ref<any[]>([]);
const langs = ref<any[]>([]);
const query = ref<any>({});
const refresh = ref({ reset: false, tag: 1 });

const openKeys = ref<any[]>([]);
const activeMenuKey = ref<string>('');
const selectedResRows = ref<any[]>([]);
const selectedLang = ref<any>();

const editLangObj = ref<any>();
const isLangEditOpen = ref(false);
const isCreateLang = ref(false);
const title = ref('');

const isResEditOpen = ref(false);
const selectedResource = ref<any>();

const onlyIcon = computed(() => themeStore.onlyIcon);

const getLangs = async () => {
  const result = await request.get(api.lang.langs);
  if (result.status) {
    langs.value = result.data;
  }
};

const getGroups = async () => {
  const result = await request.get(api.lang.groups);
  if (result.status) {
    groups.value = result.data;
  }
};

onMounted(() => {
  getGroups();
  getLangs();
});

watch(() => [globalStore.width, themeStore.sideWidth, themeStore.collapsed], () => {
  containerWidth.value = themeStore.collapsed 
    ? globalStore.width - 50 - 50 
    : globalStore.width - themeStore.sideWidth - 50;
}, { immediate: true });

const onTableSelectChange = (rows: any[]) => {
  selectedResRows.value = rows;
};

const onQuery = (values: any) => {
  query.value = { ...query.value, ...values };
};

const onOpenMenu = (keys: any[]) => {
  if (keys.length < 2) {
    openKeys.value = keys;
  } else {
    // Keep only the newly expanded one
    openKeys.value = keys.filter(k => openKeys.value.indexOf(k) === -1);
  }
};

const onSelectMenu = (value: any) => {
  activeMenuKey.value = value;
  const ids = value.split("$$");
  const langId = Number(ids[0]);

  selectedLang.value = langs.value.find(s => s.id === langId);
  query.value = { ...query.value, groupName: ids[1], langId: langId };
};

const onCreateLang = () => {
  title.value = t('创建语言');
  editLangObj.value = {};
  isLangEditOpen.value = true;
  isCreateLang.value = true;
};

const onEditLang = () => {
  if (!selectedLang.value) {
    message.warning(t('请选中数据语言后，再编辑'));
    return;
  }
  title.value = t('编辑语言');
  editLangObj.value = selectedLang.value;
  isLangEditOpen.value = true;
  isCreateLang.value = false;
};

const onLangEditClose = (lang: { id?: number | null; label?: string; code?: string } | null) => {
  isLangEditOpen.value = false;
  if (lang) {
    getLangs();
    selectedLang.value = lang;
  }
};

const onLangDelete = () => {
  if (!selectedLang.value) {
    message.warning(t('请选中数据语言后，删除'));
    return;
  }
  confirm({
    title: f('确定要删除语言：%s?', [selectedLang.value.label]),
    content: t('删除语言将会删除语言对应的所有资源'),
    onOk: async (close) => {
      const result = await request.get(`${api.lang.deleteLang}?id=${selectedLang.value.id}`);
      showResult.show(result);
      if (result.status) {
        getLangs();
      }
      close();
    }
  });
};

const onResCreate = () => {
  selectedResource.value = null;
  isResEditOpen.value = true;
};

const onResEdit = () => {
  if (!selectedResRows.value || selectedResRows.value.length === 0) {
    message.warning(t('请选择一条数据'));
    return;
  }
  selectedResource.value = selectedResRows.value[0];
  isResEditOpen.value = true;
};

const onResClose = (needRefresh: boolean) => {
  isResEditOpen.value = false;
  if (needRefresh) {
    refresh.value = { reset: true, tag: refresh.value.tag + 1 };
  }
};

const doDeleteRes = async (deleteAll: boolean) => {
  const result = await request.get(`${api.lang.deleteRes}?id=${selectedResRows.value[0].id}&a=${deleteAll ? '1' : '0'}`);
  showResult.show(result);
  if (result.status) {
    refresh.value = { reset: true, tag: refresh.value.tag + 1 };
  }
};

const onResDelete = () => {
  if (!selectedResRows.value || selectedResRows.value.length === 0) {
    message.warning(t('请选中数据语言后，再点击删除'));
    return;
  }
  
  confirm({
    content: f('确定要删除语言资源：%s?', [selectedResRows.value[0].resKey]),
    onOk: (onClose) => {
      confirm({
        content: f('是否要删除: %s， 下面所有的翻译', [selectedResRows.value[0].resKey]),
        onOk: (close) => {
          doDeleteRes(true);
          close();
        },
        onCancel: () => {
          doDeleteRes(false);
        }
      });
      onClose();
    },
  });
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
