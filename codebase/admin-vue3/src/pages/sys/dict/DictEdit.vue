<template>
  <Modal
    :open="visible"
    :title="title"
    :width="500"
    :show-mask="false"
    @close="onModalClose(false)"
  >
    <div style="width: 100%">
      <div style="padding: 0px 20px 10px 20px; margin: 0px auto">
        <h4 style="margin-top: 20px; margin-bottom: 20px; text-align: center;">{{ title }}</h4>
        
        <t-form ref="formRef" :data="formData" layout="horizontal" :rules="rules" @submit="onFinish" :label-width="80">
          <t-form-item name="groupName" :label="t('字典名')">
            <t-auto-complete
              v-model="formData.groupName"
              :options="groupOptions"
              @change="onSearchGroups"
            />
          </t-form-item>
          
          <t-form-item name="dictLabel" :label="t('显示名')">
            <t-input v-model="formData.dictLabel"></t-input>
          </t-form-item>
          
          <t-form-item name="dictKey" :label="t('KEY')">
            <t-input v-model="formData.dictKey"></t-input>
          </t-form-item>
          
          <t-form-item name="type" :label="t('类型')">
            <DictTypeSelector v-model="formData.type" @change="onTypeChange" />
          </t-form-item>
          
          <t-form-item name="dictValue" :label="t('值')">
            <template v-if="dictType === 1">
              <t-input v-model="formData.dictValue"></t-input>
            </template>
            <template v-else-if="dictType === 3">
              <t-upload
                v-model="formData.dictValue"
                theme="image"
                accept="image/*"
                :action="uploadUrl"
                :max="1"
              />
            </template>
            <template v-else>
              <t-textarea v-model="formData.dictValue" :maxlength="255"></t-textarea>
            </template>
          </t-form-item>
          
          <t-form-item name="remark" :label="t('其他')">
            <t-input v-model="formData.remark"></t-input>
          </t-form-item>
        </t-form>
        
        <t-divider />
        
        <div style="text-align: right">
          <t-space>
            <t-button variant="outline" @click="onModalClose(false)">{{ t('取消') }}</t-button>
            <t-button theme="primary" @click="onSubmit">{{ t('确定') }}</t-button>
          </t-space>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import Modal from '@/components/Modal/index.vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { api } from '@/utils/api';
import { DictTypeSelector } from './DictType';
import type { SubmitContext } from 'tdesign-vue-next';
import { AdminDict } from '@/utils/I18NNamespace';

interface DictEditFormType {
  id?: number | null;
  groupName?: string;
  dictKey?: string;
  dictValue?: any;
  dictLabel?: string;
  type?: number;
  remark?: string;
}

const props = defineProps<{
  dict?: DictEditFormType | null;
  groups?: any[];
  open: boolean;
  title: string;
}>();

const emit = defineEmits<{
  (e: 'close', refresh: boolean): void;
  (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminDict);
const request = useRequest();
const showResult = useShowResult(AdminDict);

const visible = ref(props.open);
const formRef = ref<any>(null);
const dictType = ref<number>(0);

const uploadUrl = api.document?.upload || '/api/upload';

const formData = reactive<DictEditFormType>({
  id: null,
  groupName: '',
  dictKey: '',
  dictValue: '',
  dictLabel: '',
  type: undefined,
  remark: ''
});

const allGroupOptions = computed(() => {
  return (props.groups || []).map(g => ({
    label: `${g.label}-${g.code}`,
    value: g.code
  }));
});

const groupOptions = ref(allGroupOptions.value);

const rules = {
  groupName: [{ required: true, message: t('字典名不能为空') }],
  dictLabel: [{ required: true, message: t('显示名不能为空') }],
  dictKey: [{ required: true, message: t('KEY不能为空') }],
  type: [{ required: true, message: t('类型不能为空') }],
  dictValue: [{ required: true, message: t('值不能为空') }]
};

onMounted(() => {
  if (props.open && props.dict) {
    dictType.value = props.dict.type || 0;
    const initialData = { ...props.dict };
    
    if (initialData.type === 3) {
      initialData.dictValue = initialData.dictValue ? [{ url: initialData.dictValue }] : [];
    }
    
    Object.assign(formData, initialData);
  }
});

watch(() => props.open, (val) => {
  visible.value = val;
});

const onModalClose = (refresh: boolean) => {
  visible.value = false;
  emit('update:open', false);
  setTimeout(() => {
    emit('close', refresh);
  }, 300);
};

const onSubmit = () => {
  formRef.value.submit();
};

const onSearchGroups = (text: string) => {
  if (!text || /\s+/.test(text)) {
    groupOptions.value = allGroupOptions.value;
    return;
  }
  
  groupOptions.value = allGroupOptions.value.filter(g => 
    g.label.toLowerCase().includes(text.toLowerCase()) || 
    g.value.toLowerCase().includes(text.toLowerCase())
  );
};

const onTypeChange = (value: any) => {
  dictType.value = Number(value);
  formData.dictValue = dictType.value === 3 ? [] : '';
};

const onFinish = async ({ validateResult, firstError }: SubmitContext) => {
  if (validateResult === true) {
    let data: any = { ...formData };
    
    if (data.type === 3) {
      data.dictValue = data.dictValue && data.dictValue.length > 0 ? (data.dictValue[0].response?.url || data.dictValue[0].url) : '';
    }
    
    const url = data.id ? api.dict.updateDict : api.dict.addDict;
    
    const result = await request.post(url, data);
    showResult.show(result);
    
    if (result.status) {
      onModalClose(true);
    }
  }
};
</script>
