<template>
  <div class="permission-page">
    <QueryComponent @query="onQuery" />
    <t-divider size="8px" />
    
    <t-space wrap>
      <AuthButton
        theme="primary"
        :tip="t('新增权限')"
        :required-permissions="permission.permission.create.expression"
        @click="onCreate"
      >
        <template #icon><t-icon name="add" /></template>
        {{ !onlyIcon ? t('新增') : '' }}
      </AuthButton>
      
      <AuthButton
        theme="default"
        :tip="t('编辑权限')"
        :required-permissions="permission.permission.update.expression"
        @click="onEdit"
      >
        <template #icon><t-icon name="edit" /></template>
        {{ !onlyIcon ? t('编辑') : '' }}
      </AuthButton>
      
      <AuthButton
        theme="default"
        :tip="t('扫描权限')"
        :required-permissions="permission.permission.scan.expression"
        @click="onScan"
      >
        <template #icon><t-icon name="scan" /></template>
        {{ !onlyIcon ? t('扫描') : '' }}
      </AuthButton>
      
      <AuthButton
        theme="danger"
        :tip="t('删除权限')"
        :required-permissions="permission.permission.delete.expression"
        @click="onDelete"
      >
        <template #icon><t-icon name="delete" /></template>
        {{ !onlyIcon ? t('删除') : '' }}
      </AuthButton>
    </t-space>
    
    <t-divider size="8px" />
    
    <div class="table-container">
      <PermissionList
        :query="query"
        :refresh="refresh"
        @select="onTableSelectChange"
      />
    </div>

    <PermissionEdit
      v-if="isOpenEdit"
      v-model:open="isOpenEdit"
      :permission="currPermission"
      :title="title"
      @close="onAddClose"
    />
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

import QueryComponent from '@/components/QueryComponent.vue';
import AuthButton from '@/components/AuthButton.vue';
import PermissionList from './PermissionList.vue';
import PermissionEdit from './PermissionEdit.vue';
import { AdminPermission } from '@/utils/I18NNamespace';

const { t, f } = useTranslation(AdminPermission);
const request = useRequest();
const { message, confirm } = useLayer();
const showResult = useShowResult(AdminPermission);
const themeStore = useThemeStore();

const query = ref({});
const selectedRows = ref<any[]>([]);
const refresh = ref({ reset: false, tag: 1 });

const isOpenEdit = ref(false);
const currPermission = ref<any>(null);
const title = ref('');

const onlyIcon = computed(() => themeStore.onlyIcon);

const onQuery = (values: any) => {
  query.value = values;
};

const onTableSelectChange = (rows: any[]) => {
  selectedRows.value = rows;
};

const onCreate = () => {
  currPermission.value = null;
  title.value = t('添加权限');
  isOpenEdit.value = true;
};

const onEdit = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    message.warning(t('请选择要编辑的权限'));
    return;
  }
  currPermission.value = selectedRows.value[0];
  title.value = t('编辑权限');
  isOpenEdit.value = true;
};

const onDelete = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    message.warning(t('请选择要删除的权限'));
    return;
  }

  const permissions = selectedRows.value;
  const names = permissions.map(item => item.name).join(', ');

  confirm({
    content: `${t('确定要删除以下权限：')}${names}`,
    onOk: async (close) => {
      const ids = permissions.map(p => p.id).join(',');
      const result = await request.get(`${api.permission.deletes}?ids=${ids}`);
      showResult.show(result);
      if (result.status) {
        refresh.value = { reset: true, tag: refresh.value.tag + 1 };
        selectedRows.value = [];
        close();
      }
    }
  });
};

const onScan = () => {
  confirm({
    content: t('确定要扫描整个系统的权限吗?'),
    onOk: async (close) => {
      const result = await request.get(api.permission.scan);
      showResult.show(result);
      if (result.status) {
        refresh.value = { reset: true, tag: refresh.value.tag + 1 };
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
</script>

<style scoped>
.permission-page {
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
