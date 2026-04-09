<template>
    <Modal :open="visible" :title="title" :width="400" :show-mask="false" @close="onModalClose(false)">
        <div style="width: 100%">
            <div style="padding: 0px 20px 10px 20px; width: 340px; margin: 0px auto">
                <h4 style="margin-top: 20px; margin-bottom: 20px; text-align: center;">{{ title }}</h4>

                <t-form ref="formRef" :data="formData" layout="horizontal" :rules="rules" @submit="onFinish">
                    <t-form-item name="groupName" :label="t('分组名')">
                        <t-input v-model="formData.groupName" clearable></t-input>
                    </t-form-item>

                    <t-form-item name="name" :label="t('权限名')">
                        <t-input v-model="formData.name" clearable></t-input>
                    </t-form-item>

                    <t-form-item name="expression" :label="t('表达式')">
                        <t-input v-model="formData.expression" clearable></t-input>
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
import type { SubmitContext } from 'tdesign-vue-next';
import { AdminPermission } from '@/utils/I18NNamespace';

interface PermissionFormType {
    id?: number | string | null;
    groupName?: string;
    name?: string;
    expression?: string;
}

const props = defineProps<{
    permission?: PermissionFormType | null;
    title: string;
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'close', refresh: boolean): void;
    (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminPermission);
const request = useRequest();
const showResult = useShowResult(AdminPermission);

const visible = ref(props.open);
const formRef = ref<any>(null);

const formData = reactive<PermissionFormType>({
    id: null,
    groupName: '',
    name: '',
    expression: ''
});

const rules = {
    groupName: [{ required: true, message: t('分组名不能为空') }],
    name: [{ required: true, message: t('权限名不能为空') }],
    expression: [{ required: true, message: t('表达式不能为空') }]
};

onMounted(() => {
    if (props.open && props.permission) {
        Object.assign(formData, {
            id: props.permission.id,
            groupName: props.permission.groupName,
            name: props.permission.name,
            expression: props.permission.expression
        });
    } else if (props.open) {
        formData.id = null;
        formData.groupName = '';
        formData.name = '';
        formData.expression = '';
    }
});

watch(() => props.open, (val) => {
    visible.value = val;
    if (val && props.permission) {
        Object.assign(formData, {
            id: props.permission.id,
            groupName: props.permission.groupName,
            name: props.permission.name,
            expression: props.permission.expression
        });
    } else if (val) {
        formData.id = null;
        formData.groupName = '';
        formData.name = '';
        formData.expression = '';
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

        const url = data.id ? api.permission.update : api.permission.create;

        const result = await request.post(url, data);
        showResult.show(result);

        if (result.status) {
            onModalClose(true);
        }
    }
};
</script>
