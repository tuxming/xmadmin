<template>
  <Modal
    :open="visible"
    :title="t('分配菜单')"
    :width="400"
    @close="onCloseModal"
  >
    <div style="padding: 0px 20px 10px 40px; min-height: 480px; overflow-y: auto;">
      <h4 style="margin-top: 20px; margin-bottom: 20px; text-align: center;">{{ t('分配菜单') }}</h4>
      
      <t-tree
        v-if="treeData && treeData.length > 0"
        :data="treeData"
        hover
        expand-all
        checkable
        :value="checkedKeys"
        :keys="{ label: 'title', value: 'key', children: 'children' }"
        @change="onCheck"
      >
        <template #icon="{ node }">
          <t-icon v-if="node.data.icon" :name="node.data.icon" />
        </template>
      </t-tree>
      
      <t-divider />
      
      <div style="text-align: center;">
        <t-button variant="outline" @click="onCloseModal">{{ t('取消') }}</t-button>
        <t-button theme="primary" style="margin-left: 20px;" @click="onClickOk">{{ t('确定') }}</t-button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Modal from '@/components/Modal/index.vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { api } from '@/utils/api';
import { AdminRole } from '@/utils/I18NNamespace';

const props = defineProps<{
  roleId: number;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminRole);
const request = useRequest();
const showResult = useShowResult(AdminRole);

const visible = ref(props.open);
const treeData = ref<any[]>([]);
const checkedKeys = ref<any[]>([]);
const halfCheckedKeys = ref<any[]>([]);

watch(() => props.open, (val) => {
  visible.value = val;
});

const sortMenu = (menus: any[]) => {
  menus.sort((m1, m2) => m1.sort - m2.sort);
  menus.forEach(menu => {
    if (menu.children && menu.children.length > 0) {
      sortMenu(menu.children);
    }
  });
};

const getAll = async () => {
  const result = await request.get(api.menu.curr);
  if (result) {
    const menus = result.data.map((p: any) => ({
      title: `${p.name} (${p.sort})`,
      key: p.id,
      value: p.id,
      icon: p.icon,
      data: p,
      ppid: p.parentId,
      sort: p.sort
    }));

    const mapMenu: any = {};
    menus.forEach((menu: any) => mapMenu[menu.key] = menu);
    mapMenu[1] = { name: "root", title: "根菜单", key: 1, ppid: null, children: [] };
    
    menus.forEach((menu: any) => {
      const parentId = menu.ppid;
      if (parentId || parentId === 0) {
        const parent = mapMenu[parentId];
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(menu);
        }
      }
    });

    const currMenus = mapMenu[1].children;
    sortMenu(currMenus);
    treeData.value = currMenus;
  }
};

const getMenuByRole = async () => {
  const result = await request.get(`${api.menu.byRole}?id=${props.roleId}`);
  if (result.status) {
    const checkeds: any[] = [];
    const halfCheckeds: any[] = [];
    result.data.forEach((menu: any) => {
      if (menu.checked === 2) {
        checkeds.push(menu.id);
      } else if (menu.checked === 1) {
        halfCheckeds.push(menu.id);
      }
    });

    checkedKeys.value = checkeds;
    halfCheckedKeys.value = halfCheckeds;
  }
};

onMounted(() => {
  getAll();
  getMenuByRole();
});

const onCheck = (checked: any[], context: any) => {
  checkedKeys.value = checked;
  // TDesign tree provides halfChecked keys in the context
  halfCheckedKeys.value = context.node.tree.getChecked(undefined, { halfChecked: true }) || [];
};

const onCloseModal = () => {
  visible.value = false;
  emit('update:open', false);
  setTimeout(() => {
    emit('close');
  }, 500);
};

const onClickOk = async () => {
  const data: any[] = [];
  checkedKeys.value.forEach(key => data.push({ menuId: key, checked: 2 }));
  
  // TDesign provides full list of checked nodes including half-checked if we query it
  // Or we can manually determine half-checked based on parent-child relationship
  halfCheckedKeys.value.forEach(key => data.push({ menuId: key, checked: 1 }));

  const result = await request.post(`${api.role.grantMenus}?id=${props.roleId}`, data);
  showResult.show(result);
  if (result.status) {
    onCloseModal();
  }
};
</script>
