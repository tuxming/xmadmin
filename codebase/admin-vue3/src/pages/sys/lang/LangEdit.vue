<template>
    <Modal :open="visible" :title="title" :width="400" :show-mask="false" @close="onModalClose(null)">
        <div style="width: 100%">
            <div style="padding: 0px 20px 10px 20px; margin: 0px auto">
                <h4 style="margin-top: 20px; margin-bottom: 20px; text-align: center;">{{ title }}</h4>

                <t-form ref="formRef" :data="formData" layout="horizontal" :rules="rules" @submit="onFinish">
                    <t-form-item name="label" :label="t('显示名')">
                        <t-input v-model="formData.label"></t-input>
                    </t-form-item>

                    <t-form-item name="code" :label="t('语言代码')">
                        <t-input v-model="formData.code"></t-input>
                    </t-form-item>
                </t-form>

                <t-divider />

                <div style="text-align: right">
                    <t-space>
                        <t-button variant="outline" @click="onModalClose(null)">
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
import { AdminLang } from '@/utils/I18NNamespace';
import { api } from '@/utils/api';
import type { SubmitContext } from 'tdesign-vue-next';

interface LangEditFormType {
    id?: number | null;
    label?: string;
    code?: string;
}

const props = defineProps<{
    lang?: LangEditFormType | null;
    title: string;
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'close', lang: LangEditFormType | null): void;
    (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminLang);
const request = useRequest();
const showResult = useShowResult(AdminLang);

const visible = ref(props.open);
const formRef = ref<any>(null);

const formData = reactive<LangEditFormType>({
    id: null,
    label: '',
    code: ''
});

const rules = {
    label: [{ required: true, message: t('语言显示名不能为空') }],
    code: [{ required: true, message: t('语言代码不能为空') }]
};

onMounted(() => {
    if (props.open && props.lang) {
        Object.assign(formData, props.lang);
    } else if (props.open) {
        formData.id = null;
        formData.label = '';
        formData.code = '';
    }
});

watch(() => props.open, (val) => {
    visible.value = val;
    if (val && props.lang) {
        Object.assign(formData, props.lang);
    } else if (val) {
        formData.id = null;
        formData.label = '';
        formData.code = '';
    }
});

const onModalClose = (result: any) => {
    visible.value = false;
    emit('update:open', false);
    emit('close', result);
};

const onSubmit = () => {
    formRef.value.submit();
};

const onFinish = async ({ validateResult }: SubmitContext) => {
    if (validateResult === true) {
        const data: any = { ...formData };

        const url = data.id ? api.lang.updateLang : api.lang.addLang;

        const result = await request.post(url, data);
        showResult.show(result);

        if (result.status) {
            onModalClose({ ...data, id: data.id || result.data });
        }
    }
};
</script>
