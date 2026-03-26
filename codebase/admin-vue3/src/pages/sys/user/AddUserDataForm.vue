<template>
  <div>
    <t-form ref="formRef" :data="formData" :rules="rules" @submit="onFinish" label-align="left" :label-width="60">
      <t-form-item name="type" :label="t('类型')">
        <t-radio-group v-model="formData.type" @change="onRadioChange">
          <t-radio :value="1">{{ t('用户') }}</t-radio>
          <t-radio :value="2">{{ t('组织') }}</t-radio>
        </t-radio-group>
      </t-form-item>
      
      <t-form-item v-if="formData.type === 1" name="refId" :label="t('用户')">
        <UserSelector v-model="formData.refId" mode="single" />
      </t-form-item>
      
      <t-form-item v-if="formData.type === 2" name="refId" :label="t('组织')">
        <DeptSelector v-model="formData.refId" />
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import UserSelector from './UserSelector.vue';
import DeptSelector from '../dept/DeptSelector.vue';
import type { SubmitContext } from 'tdesign-vue-next';
import { AdminUser } from '@/utils/I18NNamespace';

const emit = defineEmits<{
  (e: 'submit', values: any): void;
}>();

const { t } = useTranslation(AdminUser);
const formRef = ref<any>(null);

const formData = reactive({
  type: 1,
  refId: undefined as any
});

const rules = {
  type: [{ required: true, message: t('类型不能为空') }],
  refId: [{ required: true, message: formData.type === 1 ? t('用户不能为空') : t('组织不能为空') }]
};

const onRadioChange = () => {
  formData.refId = undefined;
};

const submitForm = () => {
  if (formRef.value) {
    // TDesign form submit programmatically
    formRef.value.submit();
  }
};

const onFinish = ({ validateResult, firstError }: SubmitContext) => {
  if (validateResult === true) {
    emit('submit', formData);
  }
};

defineExpose({ submitForm });
</script>
