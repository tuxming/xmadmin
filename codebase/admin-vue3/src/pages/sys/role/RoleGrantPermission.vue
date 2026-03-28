<template>
  <Modal
    :open="visible"
    :title="t('分配权限')"
    :width="900"
    :height="800"
    @close="onCloseModal"
  >
    <div style="padding: 0px 20px 10px 20px;">
      <h4 style="margin-top: 20px; margin-bottom: 20px; text-align: center;">{{ t('分配权限') }}</h4>
      
      <div style="height: 500px;">
        <t-transfer
          v-model="targetKeys"
          :data="permissions"
          :keys="{ label: 'name', value: 'key' }"
          :search="true"
          :title="[t('未分配'), t('已分配')]"
        >
          <template #title="{ type }">
            <template v-if="type === 'source'">
              {{ t('未分配') }}
            </template>
            <template v-else>
              {{ t('已分配') }}
            </template>
          </template>
          <!-- Using standard transfer since table transfer is complex in TDesign Vue -->
          <template #default="{ data }">
            <div style="display: flex; justify-content: space-between; width: 100%;">
              <span>{{ data.name }}</span>
              <t-tag theme="primary" variant="light" size="small">{{ data.groupName }}</t-tag>
            </div>
          </template>
        </t-transfer>
      </div>
      
      <t-divider />
      
      <div style="text-align: right;">
        <t-button variant="outline" @click="onClickCancel">{{ t('取消') }}</t-button>
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
const permissions = ref<any[]>([]);
const targetKeys = ref<any[]>([]);

watch(() => props.open, (val) => {
  visible.value = val;
});

const getAll = async () => {
  const result = await request.get(api.permission.curr);
  if (result && result.data) {
    permissions.value = result.data.map((p: any) => ({
      key: p.id,
      name: p.name,
      groupName: p.groupName,
      expression: p.expression
    }));
  }
};

const getSelectKeys = async () => {
  const result = await request.get(`${api.permission.byRole}?id=${props.roleId}`);
  if (result && result.data) {
    targetKeys.value = result.data.map((p: any) => p.id);
  }
};

onMounted(() => {
  getAll();
  getSelectKeys();
});

const onCloseModal = () => {
  visible.value = false;
  emit('update:open', false);
  emit('close');
};

const onClickCancel = () => {
  onCloseModal();
};

const onClickOk = async () => {
  const result = await request.post(`${api.role.grantPermissions}?id=${props.roleId}`, targetKeys.value);
  showResult.show(result);
  if (result.status) {
    onCloseModal();
  }
};
</script>

<style scoped>
:deep(.t-transfer) {
  height: 100%;
  width: 100%;
}
:deep(.t-transfer__list) {
  height: 100%;
  flex: 1;
}
</style>
