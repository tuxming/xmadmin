<template>
  <div class="menu-page">
    <DoubleColumnLayout :width="containerWidth" :left-width="300">
      <template #left>
        <div style="height: 100%; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: flex-end; padding: 10px;">
            <t-space>
              <AuthButton theme="primary" variant="outline" shape="circle" :tip="t('添加菜单')" :required-permissions="permission.menu.create.expression" @click="prepareAdd">
                <template #icon><t-icon name="add" /></template>
              </AuthButton>
              <AuthButton theme="danger" variant="outline" shape="circle" :tip="t('删除菜单')" :required-permissions="permission.menu.delete.expression" @click="doDelete">
                <template #icon><t-icon name="delete" /></template>
              </AuthButton>
            </t-space>
          </div>
          
          <div style="flex: 1; overflow: auto; padding: 0 10px;">
            <t-tree
              v-if="refreshTree"
              :data="treeData"
              hover
              activable
              :expanded="expandedKeys"
              :keys="{ label: 'title', value: 'key', children: 'children' }"
              style="text-align: left;"
              :load="onLoadData"
              :line="true"
              lazy
              @active="onSelect"
              @expand="onExpand"
            >
              <template #label="{ node }">
                <span>
                  <i v-if="node.data.icon" :class="['iconfont', node.data.icon]" style="margin-right: 4px;"></i>
                  {{ node.label }}
                </span>
              </template>
            </t-tree>
          </div>
        </div>
      </template>

      <template #right>
        <div style="text-align: left; height: 100%; overflow: auto;">
          <h4 style="margin-top: 12px; margin-bottom: 12px; text-align: center;">{{ title }}</h4>
          
          <div style="background: var(--td-bg-color-container); margin: 10px 0px 10px 10px; padding: 20px 20px; border-radius: var(--td-radius-medium);">
            <t-form
              ref="formRef"
              :data="formData"
              :rules="rules"
              style="max-width: 650px;"
              label-align="left"
              :label-width="90"
              @submit="onFinish"
            >
              <t-form-item :label="t('菜单名')" name="name">
                <t-input v-model="formData.name" clearable></t-input>
              </t-form-item>
              
              <t-form-item :label="t('上级菜单')" name="parentId">
                <t-tree-select
                  v-if="refreshTree"
                  v-model="formData.parentId"
                  :data="selectTreeData"
                  :keys="{ label: 'title', value: 'key', children: 'children' }"
                  :tree-props="{ expandAll: true, load: onLoadSelectData, lazy: true }"
                  :placeholder="t('请选择')"
                  clearable
                />
              </t-form-item>
              
              <t-form-item :label="t('URL')" name="path">
                <t-input v-model="formData.path" clearable></t-input>
              </t-form-item>
              
              <t-form-item :label="t('类型')" name="type">
                <t-radio-group v-model="formData.type">
                  <t-radio v-for="item in menuTypes" :key="item.value" :value="item.value">{{ t(item.label) }}</t-radio>
                </t-radio-group>
              </t-form-item>
              
              <t-form-item :label="t('图标')" name="icon">
                <t-select v-model="formData.icon" clearable>
                  <t-option v-for="item in iconOptions" :key="item.value" :value="item.value" :label="item.label">
                    <div style="display: flex; justify-content: space-between;">
                      <span>{{ item.label }}</span>
                      <i :class="['iconfont', 'icon-' + item.value]"></i>
                    </div>
                  </t-option>
                  <template #valueDisplay="{ value }">
                    <div v-if="value" style="display: flex; align-items: center;">
                      <i :class="['iconfont', 'icon-' + value]"></i>
                      <span style="margin-left: 8px;">{{ value }}</span>
                    </div>
                  </template>
                </t-select>
              </t-form-item>
              
              <t-form-item :label="t('状态')" name="status">
                <t-radio-group v-model="formData.status">
                  <t-radio v-for="item in menuStatus" :key="item.value" :value="item.value">{{ t(item.label) }}</t-radio>
                </t-radio-group>
              </t-form-item>
              
              <t-form-item :label="t('排序')" name="sort">
                <t-input-number v-model="formData.sort" :min="0" theme="normal" />
              </t-form-item>
              
              <t-form-item :label="t('参数')" name="query">
                <t-input v-model="formData.query" clearable></t-input>
              </t-form-item>
              
              <t-divider size="8px" />
              
              <div style="text-align: center;">
                <t-button type="submit" theme="primary">
                  <template #icon><t-icon name="send" /></template>
                  {{ t('确定') }}
                </t-button>
              </div>
            </t-form>
          </div>
        </div>
      </template>
    </DoubleColumnLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayer } from '@/hooks/useLayer';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { useDict } from '@/hooks/useDict';
import { useGlobalStore } from '@/store/modules/global';
import { useThemeStore } from '@/store/modules/theme';
import { permission } from '@/utils/permission';
import { api } from '@/utils/api';

import DoubleColumnLayout from '@/components/DoubleColumnLayout.vue';
import AuthButton from '@/components/AuthButton.vue';
import iconfonts from '@/assets/iconfont/iconfont.json';
import { AdminMenu } from '@/utils/I18NNamespace';

const { t } = useTranslation(AdminMenu);
const request = useRequest();
const { message, confirm } = useLayer();
const showResult = useShowResult(AdminMenu);
const globalStore = useGlobalStore();
const themeStore = useThemeStore();

const menuTypes = useDict('MenuType');
const menuStatus = useDict('MenuStatus');

const containerWidth = ref<number>();
const treeData = ref<any[]>([]);
const selectTreeData = ref<any[]>([]);

const title = ref(t('添加菜单'));
const menu = ref<any>(null);
const selectedMenu = ref<any>(null);
const refreshTree = ref(true);
const expandedKeys = ref<any[]>([1]); // 默认展开 key 为 1 的节点

const onExpand = (value: any[]) => {
  expandedKeys.value = value;
};

const setTreeChildrenByKey = (nodes: any[], key: any, children: any[]) => {
  if (!Array.isArray(nodes) || nodes.length === 0) return false;
  for (const n of nodes) {
    if (n?.key === key || n?.value === key) {
      n.children = children;
      return true;
    }
    if (Array.isArray(n?.children) && n.children.length > 0) {
      const ok = setTreeChildrenByKey(n.children, key, children);
      if (ok) return true;
    }
  }
  return false;
};

const iconOptions = computed(() => {
  return iconfonts.glyphs.map(item => ({
    label: item.font_class,
    value: item.font_class
  }));
});

const formData = reactive({
  id: null as number | null,
  parentId: undefined as number | undefined,
  name: '',
  sort: 0,
  path: '',
  query: '',
  type: 1,
  status: 0,
  icon: ''
});

const rules = {
  name: [{ required: true, message: t('菜单名不能为空') }],
  parentId: [{ required: true, message: t('请选择上级菜单') }],
  path: [{ required: true, message: t('URL不能为空') }],
  icon: [{ required: true, message: t('图标不能为空') }],
  status: [{ required: true, message: t('状态不能为空') }],
  sort: [{ required: true, message: t('排序不能为空') }]
};





const convertToTreeNode = (menus: any[]) => {
  return menus.map(menu => {
    return {
      title: `${menu.name} (${menu.sort})`,
      label: menu.name,
      key: menu.id,
      value: menu.id,
      // 在 TDesign 中，当 `children` 设置为 true 时，被认为是需要异步加载的节点。
      // 因为后端返回的是空数组，我们需要强制将其转为 true 以触发 load 事件。
      children: menu.type === 0 ? true : undefined,
      icon: menu.icon,
      data: menu,
    };
  });
};

const getMenus = async (key: any): Promise<any[]> => {
  const result = await request.get(`${api.menu.list}?id=${key}`);
  if (result.data && result.data.length > 0) {
    const menus = result.data;
    menus.sort((m1: any, m2: any) => m1.sort - m2.sort);
    return convertToTreeNode(menus);
  } else if (key === 0) {
    message.warning(t('无数据'));
    return [];
  } else {
    return [];
  }
};

const onLoadData = (node: any) => {
  return new Promise<any[]>((resolve) => {
    // node in Tree load method is the node object itself, not a context containing node
    // Let's use the node value as the key to fetch children
    const key = node.value;
    
    getMenus(key).then((nodes) => {
      setTreeChildrenByKey(selectTreeData.value, key, nodes);
      resolve(nodes);
    }).catch(() => {
      resolve([]);
    });
  });
};

const onLoadSelectData = (node: any) => {
  return new Promise<any[]>((resolve) => {
    const key = node.value;
    
    getMenus(key).then((nodes) => {
      setTreeChildrenByKey(treeData.value, key, nodes);
      resolve(nodes);
    }).catch(() => {
      resolve([]);
    });
  });
};

const doRefreshTree = () => {
  refreshTree.value = false;
  setTimeout(() => {
    getMenus(0).then((res) => {
      treeData.value = res;
      selectTreeData.value = res;
      expandedKeys.value = [1];
      refreshTree.value = true;
    });
  }, 60);
};

onMounted(() => {
  // Initial load
  getMenus(0).then((res) => {
    treeData.value = res;
    selectTreeData.value = res;
    
    // 获取到根节点（id: 1）后，默认展开它，以触发它的懒加载
    if (res.length > 0) {
      expandedKeys.value = [res[0].key];
    }
  });
});

watch(() => [globalStore.width, themeStore.sideWidth, themeStore.collapsed], () => {
  containerWidth.value = themeStore.collapsed 
    ? globalStore.width - 50 - 50 
    : globalStore.width - themeStore.sideWidth - 50;
}, { immediate: true });

const onSelect = (value: any[], context: any) => {
  if (value.length > 0) {
    const m = context.node.data.data;
    if (m) {
      selectedMenu.value = m;
      const mCopy = { ...m };
      if (mCopy.icon) {
        mCopy.icon = mCopy.icon.replace(/^icon-/, '');
      }
      
      Object.assign(formData, mCopy);
      title.value = `${t('编辑菜单')}:${m.name}`;
      menu.value = m;
    } else {
      // Root node selected
      prepareAdd();
    }
  }
};

const prepareAdd = () => {
  let parentId = selectedMenu.value?.id ?? 1;
  if (selectedMenu.value && selectedMenu.value.type !== 0) {
    parentId = selectedMenu.value.parentId || 1;
  }
  const newMenu = {
    id: null,
    parentId,
    name: '',
    sort: 0,
    path: '',
    query: '',
    type: 1,
    status: 0,
    icon: ''
  };
  title.value = t('添加菜单');
  menu.value = newMenu;
  Object.assign(formData, newMenu);
};

const doDelete = () => {
  if (!menu.value || !menu.value.id) {
    message.warning(t('请选择要删除的菜单'));
    return;
  }

  const deleteMenu = async () => {
    try {
      const result = await request.get(`${api.menu.delete}?id=${menu.value.id}`);
      showResult.show(result);
      if (result.status) {
        prepareAdd();
        doRefreshTree();
      }
    } catch (e: any) {
      message.error(e.message);
    }
  };

  confirm({
    content: `${t('确定要删除菜单：')}${menu.value.name}？`,
    onOk: (onClose) => {
      if (menu.value.type === 0) {
        confirm({
          content: t('该菜单为目录菜单, 确定要删除该菜单及其子菜单吗？'),
          onOk: (close) => {
            deleteMenu();
            close();
          }
        });
      } else {
        deleteMenu();
      }
      onClose();
    }
  });
};

const onFinish = async ({ validateResult }: any) => {
  if (validateResult === true) {
    const values = { ...formData };
    if (values.icon) {
      values.icon = `icon-${values.icon}`;
    }
    
    const result = await request.post(api.menu.saveOrUpdate, values, undefined, false);
    showResult.show(result);
    if (result.status) {
      doRefreshTree();
    }
  }
};
</script>

<style scoped>
.menu-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.menu-form {
  max-width: 650px;
}
</style>
