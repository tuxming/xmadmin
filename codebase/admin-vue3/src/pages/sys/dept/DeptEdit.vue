<template>
  <Modal
    :open="visible"
    :title="title"
    :width="600"
    :show-mask="false"
    @close="onModalClose"
  >
    <div style="width: 100%">
      <div style="padding: 0px 20px 10px 20px; margin: 0px auto">
        <h4 style="margin-top: 20px; margin-bottom: 20px; text-align: center;">{{ title }}</h4>
        
        <t-form ref="formRef" :data="formData" :rules="rules" @submit="onFinish">
          <t-form-item v-if="dept && dept.path && dept.pathName" :label="t('组织信息')">
            <p>{{ dept.path }}<br/>{{ dept.pathName }}</p>
          </t-form-item>
          
          <t-form-item name="name" :label="t('组织名')">
            <t-input v-model="formData.name"></t-input>
          </t-form-item>
          
          <t-form-item name="parentId" :label="t('上级组织')">
            <DeptSelector 
              v-model="formData.parentId" 
              :path="formData.path" 
              :parent-name="formData.parentName"
              :return-object="true"
              @change="(val) => { formData.parentId = val }"
            />
          </t-form-item>
          
          <t-form-item name="type" :label="t('类型')">
            <DeptTypeSelector v-model="formData.type" />
          </t-form-item>
        </t-form>
        
        <t-divider />
        
        <div style="text-align: right">
          <t-space>
            <t-button variant="outline" @click="onModalClose">{{ t('取消') }}</t-button>
            <t-button theme="primary" @click="onSubmit">{{ t('确定') }}</t-button>
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
import DeptSelector from './DeptSelector.vue';
import { DeptTypeSelector } from './DeptType';
import type { SubmitContext } from 'tdesign-vue-next';
import { AdminDept } from '@/utils/I18NNamespace';

interface DeptEditFormType {
  id?: number | null;
  name?: string;
  parentId?: number;
  parentName?: string;
  path?: string;
  pathName?: string;
  type?: number;
}

const props = defineProps<{
  dept?: DeptEditFormType;
  open: boolean;
  title: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', payload: { type: 'create' | 'update'; object: any }): void;
  (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminDept);
const request = useRequest();
const showResult = useShowResult(AdminDept);

const visible = ref(props.open);
const formRef = ref<any>(null);

const formData = reactive<DeptEditFormType>({
  id: null,
  name: '',
  parentId: undefined,
  type: undefined
});

const rules = {
  name: [{ required: true, message: t('组织名不能为空') }],
  parentId: [{ required: true, message: t('上级组织不能为空') }],
  type: [{ required: true, message: t('类型不能为空') }]
};

onMounted(() => {
  if (props.open && props.dept) {
    Object.assign(formData, props.dept);
  }
});

watch(() => props.open, (val) => {
  visible.value = val;
});

const onModalClose = () => {
  emit('close');
  visible.value = false;
  emit('update:open', false);
};

const onSubmit = () => {
  formRef.value.submit();
};

const onFinish = async ({ validateResult, firstError }: SubmitContext) => {
  if (validateResult === true) {
    const data = { ...formData };
    data.type = Number(data.type);
    
    // 如果传进来的是个对象，我们需要在提交前把它还原成普通的 ID 数字
    if (data.parentId && typeof data.parentId === 'object' && (data.parentId as any).id) {
      data.parentId = (data.parentId as any).id;
    }
    
    const isUpdate = !!data.id;
    const url = isUpdate ? api.dept.update : api.dept.create;
    
    const result = await request.post(url, data);
    showResult.show(result);
    
    if (result.status) {
      // 构建要返回给列表的节点数据，方便直接追加或更新
      const nodeData = {
        ...data,
        id: isUpdate ? data.id : result.data,
      };

      if (isUpdate) {
        emit('success', { type: 'update', object: nodeData });
      } else {
        emit('success', { type: 'create', object: nodeData });
      }
      
      visible.value = false;
      emit('update:open', false);
    }
  }
};
</script>
