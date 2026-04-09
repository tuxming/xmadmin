<template>
    <div>
        <t-form ref="formRef" :data="formData" :rules="rules" @submit="onFinish" label-align="left" :label-width="80">
            <t-form-item name="password" :label="t('原 密 码')">
                <t-input v-model="formData.password" type="password"></t-input>
            </t-form-item>

            <t-form-item name="newPassword" :label="t('新 密 码')">
                <t-space style="width: 100%;">
                    <t-input v-model="formData.newPassword" type="password" @change="passwordChange"
                        style="flex: 1;"></t-input>
                    <t-alert v-if="showIcon" :theme="status" :message="statusLabel"
                        style="white-space: nowrap; padding: 4px 12px;" />
                </t-space>
            </t-form-item>

            <t-form-item name="rePassword" :label="t('确认密码')">
                <t-input v-model="formData.rePassword" type="password"></t-input>
            </t-form-item>
        </t-form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import type { SubmitContext } from 'tdesign-vue-next';
import { AdminUser } from '@/utils/I18NNamespace';

const emit = defineEmits<{
    (e: 'submit', values: any): void;
    (e: 'registerSubmit', fn: () => void): void;
}>();

const { t } = useTranslation(AdminUser);
const formRef = ref<any>(null);

const formData = reactive({
    password: '',
    newPassword: '',
    rePassword: ''
});

const statuses = computed(() => [t('低'), t('中'), t('高')]);
const statusLabel = ref<string>(t('强度'));
const showIcon = ref<boolean>(false);
const status = ref<any>('info');

const passwordChange = (value: string) => {
    showIcon.value = true;
    if (value) {
        if (value.length < 6) {
            statusLabel.value = statuses.value[0];
            status.value = 'error';
        } else {
            let isNum = /\d+/.test(value);
            let isUpper = /[A-Z]+/.test(value);
            let isLower = /[a-z]+/.test(value);
            let isSymbol = /[`~!@#\$\%\^\&\*\(\)\_\+\-\=\<\>,\.\?\/\:;\"\'\\\|]+/.test(value);

            let count = 0;
            count += isNum ? 1 : 0;
            count += isUpper ? 1 : 0;
            count += isLower ? 1 : 0;
            count += isSymbol ? 1 : 0;

            if (count < 2) {
                statusLabel.value = statuses.value[0];
                status.value = 'error';
            } else if (count < 3) {
                statusLabel.value = statuses.value[1];
                status.value = 'warning';
            } else {
                statusLabel.value = statuses.value[2];
                status.value = 'success';
            }
        }
    } else {
        statusLabel.value = statuses.value[0];
        status.value = 'error';
    }
};

const validatePassword = (val: string) => {
    if (val && val.length < 6) {
        return { result: false, message: t('新密码长度小于6'), type: 'error' };
    }
    return { result: true };
};

const validateRePassword = (val: string) => {
    if (val !== formData.newPassword) {
        return { result: false, message: t('两次输入的密码不一致'), type: 'error' };
    }
    return { result: true };
};

const rules = {
    password: [{ required: true, message: t('原密码不能为空') }],
    newPassword: [
        { required: true, message: t('新密码不能为空') },
        { validator: validatePassword }
    ],
    rePassword: [
        { required: true, message: t('确认密码不能为空') },
        { validator: validateRePassword }
    ]
};

const submitForm = () => {
    if (formRef.value) {
        formRef.value.submit();
    }
};

onMounted(() => {
    emit('registerSubmit', submitForm);
});

const onFinish = ({ validateResult, firstError }: SubmitContext) => {
    if (validateResult === true) {
        emit('submit', formData);
    }
};

defineExpose({ submitForm, formRef });
</script>
