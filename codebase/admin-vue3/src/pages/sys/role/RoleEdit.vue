<template>
  <Modal
    :open="visible"
    :title="t('添加角色')"
    :width="400"
    :show-mask="false"
    @close="onModalClose(false)"
  >
    <div style="width: 100%">
      <div style="padding: 0px 20px 10px 20px; width: 340px; margin: 0px auto">
        <h4 style="margin-top: 20px; margin-bottom: 20px; text-align: center;">{{ t('添加角色') }}</h4>
        
        <t-form ref="formRef" :data="formData" layout="horizontal" :rules="rules" @submit="onFinish">
          <t-form-item name="roleName" :label="t('角色名')">
            <t-input v-model="formData.roleName" clearable></t-input>
          </t-form-item>
          
          <t-form-item name="code" :label="t('角色代码')">
            <t-input v-model="formData.code" clearable></t-input>
          </t-form-item>
          
          <t-form-item name="type" :label="t('角色类型')">
            <RoleTypeSelector v-model="formData.type" />
          </t-form-item>
        </t-form>
        
        <t-divider />
        
        <div style="text-align: right">
          <t-space>
            <t-button variant="outline" @click="onModalClose(false)">
              <template #icon><t-icon name="close" /></template>
              {{ t('取消') }}
            </t-button>
            <t-button theme="primary" @click="onSubmit">
              <template #icon><t-icon name="send" /></template>
              {{ t('确定') }}
            </t-button>
          </t-space>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import Modal from '@/components/Modal/index.vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { api } from '@/utils/api';
import { RoleTypeSelector } from './RoleType';
import type { SubmitContext } from 'tdesign-vue-next';
import { AdminRole } from '@/utils/I18NNamespace';

interface RoleFormType {
  id?: number | string | null;
  roleName?: string;
  code?: string;
  type?: any;
}

const props = defineProps<{
  role?: RoleFormType | null;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close', refresh: boolean): void;
  (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminRole);
const request = useRequest();
const showResult = useShowResult(AdminRole);

const visible = ref(props.open);
const formRef = ref<any>(null);

const formData = reactive<RoleFormType>({
  id: null,
  roleName: '',
  code: '',
  type: undefined
});

const rules = {
  roleName: [{ required: true, message: t('角色名不能为空') }],
  code: [{ required: true, message: t('角色代码不能为空') }],
  type: [{ required: true, message: t('角色类型不能为空') }]
};

onMounted(() => {
  if (props.open && props.role) {
    Object.assign(formData, {
      id: props.role.id,
      roleName: props.role.roleName,
      code: props.role.code,
      type: props.role.type
    });
  } else if (props.open) {
    formData.id = null;
    formData.roleName = '';
    formData.code = '';
    formData.type = undefined;
  }
});

watch(() => props.open, (val) => {
  visible.value = val;
  if (val && props.role) {
    Object.assign(formData, {
      id: props.role.id,
      roleName: props.role.roleName,
      code: props.role.code,
      type: props.role.type
    });
  } else if (val) {
    formData.id = null;
    formData.roleName = '';
    formData.code = '';
    formData.type = undefined;
  }
});

const onModalClose = (refresh: boolean) => {
  visible.value = false;
  emit('update:open', false);
  setTimeout(() => {
    emit('close', refresh);
  }, 500);
};

const onSubmit = () => {
  formRef.value.submit();
};

const onFinish = async ({ validateResult, firstError }: SubmitContext) => {
  if (validateResult === true) {
    const data: any = { ...formData };
    data.type = Number(data.type);
    
    const url = data.id ? api.role.update : api.role.create;
    
    const result = await request.post(url, data);
    showResult.show(result);
    
    if (result.status) {
      onModalClose(true);
    }
  }
};
</script>
