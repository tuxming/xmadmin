<template>
    <Modal :open="visible" :title="title" :width="400" :show-mask="false" @close="onModalClose">
        <div style="width: 100%">
            <div style="padding: 0px 20px 10px 20px; margin: 0px auto">
                <h4 style="margin-top: 20px; margin-bottom: 20px; text-align: center;">{{ title }}</h4>

                <t-form ref="formRef" :data="formData" layout="horizontal" :rules="rules" @submit="onFinish">
                    <t-form-item name="label" :label="t('显示名')">
                        <t-input v-model="formData.label"></t-input>
                    </t-form-item>

                    <t-form-item name="code" :label="t('字典代码')">
                        <t-input v-model="formData.code"></t-input>
                    </t-form-item>

                    <t-form-item name="remark" :label="t('备注')">
                        <t-textarea v-model="formData.remark" :maxlength="64" />
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
import type { SubmitContext } from 'tdesign-vue-next';
import { AdminDict } from '@/utils/I18NNamespace';

interface DictGroupEditFormType {
    remark?: string;
    label?: string;
    code?: string;
}

const props = defineProps<{
    group?: DictGroupEditFormType | null;
    open: boolean;
    title: string;
}>();

const emit = defineEmits<{
    (e: 'close', dict?: DictGroupEditFormType | null): void;
    (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminDict);
const request = useRequest();
const showResult = useShowResult(AdminDict);

const visible = ref(props.open);
const formRef = ref<any>(null);

const formData = reactive<DictGroupEditFormType>({
    label: '',
    code: '',
    remark: ''
});

const rules = {
    label: [{ required: true, message: t('字典显示名不能为空') }],
    code: [{ required: true, message: t('字典代码不能为空') }]
};

onMounted(() => {
    if (props.open && props.group) {
        Object.assign(formData, props.group);
    }
});

watch(() => props.open, (val) => {
    visible.value = val;
});

const onModalClose = () => {
    visible.value = false;
    emit('update:open', false);
    emit('close', null);
};

const onSubmit = () => {
    formRef.value.submit();
};

const onFinish = async ({ validateResult, firstError }: SubmitContext) => {
    if (validateResult === true) {
        let data: any = { ...formData };
        if (props.group && formData.code !== props.group.code) {
            data = { ...data, oldCode: props.group.code };
        }

        const result = await request.post(api.dict.saveOrUpdateGroup, data);
        showResult.show(result);

        if (result.status) {
            visible.value = false;
            emit('update:open', false);
            emit('close', data);
        }
    }
};
</script>
