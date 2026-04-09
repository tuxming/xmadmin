<template>
    <Modal :open="visible" :title="title" :width="750" :show-mask="false" @close="onModalClose(false)">
        <div class="user-add">
            <div class="user-add__content">
                <h4 class="user-add__title">{{ title }}</h4>

                <t-form ref="formRef" class="user-add__form" :data="formData" layout="horizontal" :rules="rules"
                    @submit="onFinish" label-width="100px">
                    <t-row :gutter="24" class="user-add__grid">
                        <t-col :span="isWide ? 6 : 12">
                            <t-form-item name="username" :label="t('用户名')">
                                <t-input v-model="formData.username"></t-input>
                            </t-form-item>
                        </t-col>
                        <t-col :span="isWide ? 6 : 12">
                            <t-form-item name="fullname" :label="t('姓名')">
                                <t-input v-model="formData.fullname"></t-input>
                            </t-form-item>
                        </t-col>
                        <t-col :span="isWide ? 6 : 12">
                            <t-form-item name="email" :label="t('邮箱地址')">
                                <t-input v-model="formData.email"></t-input>
                            </t-form-item>
                        </t-col>
                        <t-col :span="isWide ? 6 : 12">
                            <t-form-item name="phone" :label="t('手机号码')">
                                <t-input v-model="formData.phone"></t-input>
                            </t-form-item>
                        </t-col>
                        <t-col :span="isWide ? 6 : 12">
                            <t-form-item name="password" :label="t('密码')">
                                <t-input v-model="formData.password" type="password"></t-input>
                            </t-form-item>
                        </t-col>
                        <t-col :span="isWide ? 6 : 12">
                            <t-form-item name="repassword" :label="t('确认密码')">
                                <t-input v-model="formData.repassword" type="password"></t-input>
                            </t-form-item>
                        </t-col>
                        <t-col :span="isWide ? 6 : 12">
                            <t-form-item name="gender" :label="t('性别')">
                                <t-radio-group v-model="formData.gender">
                                    <t-radio :value="0">{{ t('男') }}</t-radio>
                                    <t-radio :value="1">{{ t('女') }}</t-radio>
                                    <t-radio :value="2">{{ t('保密') }}</t-radio>
                                </t-radio-group>
                            </t-form-item>
                        </t-col>
                        <t-col :span="12">
                            <t-form-item name="deptId" :label="t('所在组织')">
                                <DeptSelector v-model="formData.deptId" :return-object="true" />
                            </t-form-item>
                        </t-col>
                        <t-col :span="12">
                            <t-form-item name="roleIds" :label="t('角色')">
                                <RoleSelector v-model="formData.roleIds" mode="multiple" />
                            </t-form-item>
                        </t-col>
                        <t-col :span="12">
                            <t-form-item name="photo" :label="t('照片')">
                                <t-upload v-model="formData.photo" theme="image" accept="image/*" :action="uploadAction"
                                    :with-credentials="true" :format-response="formatUploadResponse"
                                    @success="onUploadSuccess" :max="1" />
                            </t-form-item>
                        </t-col>
                    </t-row>
                </t-form>

                <t-divider class="user-add__divider" />

                <div class="user-add__actions">
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
import { ref, reactive, watch, inject, computed } from 'vue';
import Modal from '@/components/Modal/index.vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { api } from '@/utils/api';
import DeptSelector from '../dept/DeptSelector.vue';
import RoleSelector from '../role/RoleSelector.vue';
import type { SubmitContext } from 'tdesign-vue-next';
import { computePx } from '@/utils/kit';
import { AdminUser } from '@/utils/I18NNamespace';

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'close', refresh: boolean): void;
    (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminUser);
const request = useRequest();
const showResult = useShowResult(AdminUser);

const visible = ref(props.open);
const title = ref(t('创建用户'));
const formRef = ref<any>(null);

const uploadUrl = api.document.upload;
const uploadType = 'photo';
const uploadPress = 1;
const uploadAction = computed(() => `${uploadUrl}?type=${encodeURIComponent(uploadType)}&press=${uploadPress}`);

const formData = reactive({
    username: '',
    fullname: '',
    email: '',
    phone: '',
    password: '',
    repassword: '',
    gender: 0,
    deptId: undefined,
    roleIds: [],
    photo: [] as any[]
});

const validatePassword = (val: string) => {
    if (val && val.length < 6) {
        return { result: false, message: t('密码长度小于6'), type: 'error' };
    }
    return { result: true };
};

const validateRePassword = (val: string) => {
    if (val !== formData.password) {
        return { result: false, message: t('两次输入的密码不一致'), type: 'error' };
    }
    return { result: true };
};

const rules = {
    username: [{ required: true, message: t('用户名不能为空') }],
    fullname: [{ required: true, message: t('姓名不能为空') }],
    password: [
        { required: true, message: t('密码不能为空') },
        { validator: validatePassword }
    ],
    repassword: [
        { required: true, message: t('确认密码不能为空') },
        { validator: validateRePassword }
    ],
    deptId: [{ required: true, message: t('所在组织不能为空') }],
    roleIds: [{ required: true, message: t('角色不能为空') }]
};

const modalPos = inject<any>('modalContext', null);

const isWide = computed(() => {
    if (modalPos?.value?.width) {
        return computePx(modalPos.value.width) > 650;
    }
    return true;
});

watch(() => props.open, (val) => {
    visible.value = val;
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
        let data: any = { ...formData };
        if (data.deptId && typeof data.deptId === 'object' && data.deptId.id !== undefined) {
            data.deptId = data.deptId.id;
        }
        if (data.photo && data.photo.length > 0) {
            const file = data.photo[0];
            const resp = file?.response;
            const pid = resp?.data ?? resp?.id ?? resp?.result?.data;
            if (pid !== undefined && pid !== null && pid !== '') {
                const s = String(pid);
                data.photo = /^\d+$/.test(s) ? Number(s) : pid;
            } else {
                data.photo = file?.url || '';
            }
        } else {
            data.photo = '';
        }

        const result = await request.post(api.user.create, data);
        showResult.show(result);

        if (result.status) {
            onModalClose(true);
        }
    }
};

const formatUploadResponse = (response: any) => {
    if (response?.error) {
        return { error: String(response.error), status: 'fail' };
    }
    const pid = response?.data ?? response?.id;
    const previewUrl = pid !== undefined && pid !== null && pid !== ''
        ? `${api.document.img}?id=${pid}`
        : response?.url;
    return { status: 'success', url: previewUrl, id: pid };
};

const onUploadSuccess = () => {
};
</script>

<style scoped>
.user-add {
    width: 100%;
    height: 100%;
    overflow: auto;
}

.user-add__content {
    padding: 16px 24px 18px;
    max-width: 920px;
    margin: 0 auto;
}

.user-add__title {
    margin: 12px 0 18px;
    text-align: center;
}

.user-add__grid {
    row-gap: 12px;
}

.user-add__divider {
    margin: 12px 0 14px;
}

.user-add__actions {
    display: flex;
    justify-content: flex-end;
}
</style>
