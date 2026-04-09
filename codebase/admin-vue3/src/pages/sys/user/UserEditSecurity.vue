<template>
    <t-descriptions :title="t('账户与安全')" bordered :column="columnCount" class="user-basic-info" style="margin-top: 5px;">
        <t-descriptions-item :label="t('邮箱地址')">
            <EditableTextItem :value="user.email" copyable @change="(val) => onHandleChange('email', val)" />
        </t-descriptions-item>

        <t-descriptions-item :label="t('电话号码')">
            <EditableTextItem :value="user.phone" copyable @change="(val) => onHandleChange('phone', val)" />
        </t-descriptions-item>

        <t-descriptions-item :label="t('App Secret')" :span="columnCount === 1 ? 1 : 2">
            <TokenItem :value="user.token" copyable @refresh="onRefreshToken" />
        </t-descriptions-item>

        <t-descriptions-item :label="t('密码')" :span="columnCount === 1 ? 1 : 2">
            <t-button variant="text" theme="primary" @click="onChangePassword">
                <template #icon><t-icon name="edit" /></template>
            </t-button>
        </t-descriptions-item>
    </t-descriptions>
</template>

<script setup lang="ts">
import { h, computed } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayer } from '@/hooks/useLayer';
import { computePx } from '@/utils/kit';
import EditableTextItem from '@/components/EditableTextItem.vue';
import TokenItem from './TokenItem.vue';
import ChangePasswordForm from './ChangePasswordForm.vue';
import { AdminUser } from '@/utils/I18NNamespace';

const props = defineProps<{
    user: any;
    modalPos: any;
    vertical?: boolean;
}>();

const emit = defineEmits<{
    (e: 'handleChange', key: string, value: any): void;
}>();

const { t } = useTranslation(AdminUser);
const Layer = useLayer();

const columnCount = computed(() => {
    if (props.vertical) return 1;
    if (!props.modalPos?.width) return 2;
    const w = computePx(props.modalPos.width);
    if (w > 500) return 2;
    return 1;
});

const onHandleChange = (key: string, value: any) => {
    emit('handleChange', key, value);
};

const onRefreshToken = () => {
    Layer.confirm({
        title: t('刷新Token'),
        content: t('确定要刷新Token吗？'),
        onOk: (onClose) => {
            onHandleChange('token', true);
            onClose();
        }
    });
};

const onChangePassword = () => {
    let formRef: any = null;
    let layerCloseFn: (() => void) | null = null;

    Layer.confirm({
        title: t('修改密码：'),
        width: 450,
        content: h(ChangePasswordForm, {
            // 传递一个自定义的回调方法，让子组件可以直接调用
            onRegisterSubmit: (submitFn: () => void) => {
                formRef = { submitForm: submitFn };
            },
            onSubmit: (values: any) => {
                onHandleChange('password', values);
                if (layerCloseFn) {
                    layerCloseFn();
                }
            }
        }),
        onOk: (onClose) => {
            layerCloseFn = onClose;
            if (formRef && typeof formRef.submitForm === 'function') {
                formRef.submitForm();
            } else {
                onClose();
            }
        }
    });
};
</script>
