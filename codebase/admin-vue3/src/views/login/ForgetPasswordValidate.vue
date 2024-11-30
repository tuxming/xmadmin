<template>
<div>
    <div style="text-align: center; padding: 20px 0px;">
        <el-radio-group v-model="foundPwdType" >
            <el-radio-button :label="t('通过邮件找回')" :value="1" />
            <el-radio-button :label="t('通过手机号找回')" :value="2" />
        </el-radio-group>
    </div>

    <el-form :model="form" label-width="auto" size="large"
        :rules="foundPwdType == 1 ? emailRules : phoneRules"
    >
        <el-form-item prop="account"
            :error="foundPwdType == 1 ? emailValidator.emailErrMsg.value : phoneValidator.phoneErrMsg.value" 
            :show-message="foundPwdType == 1? emailValidator.showEmailMsg.value : phoneValidator.showPhoneMsg.value" 
            :validate-status="foundPwdType == 1? emailValidator.emailFieldStatus.value : phoneValidator.phoneFieldStatus.value"
        >
            <template v-slot:label>
                <span class="login-label">
                    {{ foundPwdType == 1 ? t('邮箱地址') : t('电话号码') }}
                </span>
            </template>
            <el-input v-model="form.account" class="login-item"/>
        </el-form-item>
        <el-form-item prop="captcha"
            :error="foundPwdType == 1 ? emailValidator.captchaErrMsg.value : phoneValidator.captchaErrMsg.value" 
            :show-message="foundPwdType == 1? emailValidator.showCaptchaMsg.value : phoneValidator.showCaptchaMsg.value" 
            :validate-status="foundPwdType == 1? emailValidator.captchaFieldStatus.value : phoneValidator.captchaFieldStatus.value"
        >
            <template v-slot:label>
                <span class="login-label">{{ t('验证码') }}</span>
            </template>
            <CaptchaItem v-model="form.captcha" class="login-item"/>
        </el-form-item>
        <el-form-item prop="code">
            <template v-slot:label>
                <span class="login-label">
                    {{ foundPwdType == 1 ? t('邮箱验证码') : t('短信验证码') }}
                </span>
            </template>
            <CodeItem v-model="form.code" class="login-item" :validate="prepareValidate"/>
        </el-form-item>
    </el-form>
    <div style="text-align: center; padding-top:10px">
        <auth-button size="default" type="primary">{{ t('下一步') }}</auth-button>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref,reactive } from 'vue'
import type { FormRules } from 'element-plus'
import CaptchaItem from './CaptchaItem.vue'
import CodeItem from './CodeItem.vue'
import AuthButton from '@/components/AuthButton.vue'
import {useEmailSendCodeValidate} from './useEmailSendCodeValidate'
import { usePhoneSendCodeValidate } from './usePhoneSendCodeValidate'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

const {t} = useTranslation(AdminLogin);

const foundPwdType = ref(1);
interface MailLoginForm {
    account: string,
    captcha: string,
    code: string
}

const form = reactive<MailLoginForm>({
    account: '',
    captcha: '',
    code: ''
});

const phoneRules = reactive<FormRules<MailLoginForm>>({
    account: [{
        required: true,
        message: '电话号码不能为空'
    }],
    code: [{
        required: true,
        message: '短信证码不能为空'
    }]
});
const emailRules = reactive<FormRules<MailLoginForm>>({
    account: [{
        required: true,
        message: '邮箱地址不能为空'
    }],
    code: [{
        required: true,
        message: '邮箱验证码不能为空'
    }]
});

const phoneValidator = usePhoneSendCodeValidate();
const emailValidator = useEmailSendCodeValidate();

const prepareValidate = ()=>{
    return foundPwdType.value == 1 ? 
        emailValidator.validate(form.account, form.captcha) 
        : phoneValidator.validate(form.account, form.captcha);
}

</script>