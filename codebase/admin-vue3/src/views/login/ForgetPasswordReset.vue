<template>
<div style="padding: 20px 0px">
    <el-form :model="resetPwdForm" label-width="auto" size="large"
        :rules="restPwdRules"
    >
        <el-form-item prop="password">
            <template v-slot:label><span class="login-label">{{ t('新密码') }}</span></template>
            <el-input v-model="resetPwdForm.password" class="login-item"/>
        </el-form-item>
        <el-form-item prop="repassword">
            <template v-slot:label><span class="login-label">{{ t('确认密码') }}</span></template>
            <el-input v-model="resetPwdForm.repassword" class="login-item"/>
        </el-form-item>
    </el-form>
    <div style="text-align: center; padding-top:10px">
        <auth-button size="default" type="primary" plain>{{ t('上一步') }}</auth-button>
        <auth-button size="default" type="primary">{{ t('下一步') }}</auth-button>
    </div>
</div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { FormRules } from 'element-plus'
import AuthButton from '@/components/AuthButton.vue'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

const { t } = useTranslation(AdminLogin);

interface ResetPwdnForm {
    password: string,
    repassword: string,
}

const resetPwdForm = reactive<ResetPwdnForm>({
    password: '',
    repassword: '',
});

const restPwdRules = reactive<FormRules<ResetPwdnForm>>({
    password: [{
        required: true,
        message: t('密码不能为空')
    }],
    repassword: [{
        required: true,
        message: t('确认密码不能为空')
    }]
});

</script>