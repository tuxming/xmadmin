<template>
    <div class="login-form-wrap">
        <el-form :model="form" label-width="auto" size="large"
            :rules="rules"
        >
            <el-form-item prop="telephone" :error="phoneErrMsg" :show-message="showPhoneMsg" :validate-status="phoneFieldStatus">
                <template v-slot:label><span class="login-label">{{ t('手机号') }}</span></template>
                <el-input v-model="form.telephone" class="login-item"/>
            </el-form-item>
            <el-form-item prop="captcha" :error="captchaErrMsg" :show-message="showCaptchaMsg" :validate-status="captchaFieldStatus">
                <template v-slot:label><span class="login-label">{{ t('验证码') }}</span></template>
                <CaptchaItem v-model="form.captcha" class="login-item"/>
            </el-form-item>
            <el-form-item prop="code">
                <template v-slot:label><span class="login-label">{{ t('短信验证码') }}</span></template>
                <CodeItem v-model="form.code" class="login-item" :validate="prepareValidate"/>
            </el-form-item>
            <div style="padding: 5px 15px 15px 15px; text-align: center;">
                <el-button style="width: 70%" :color="theme.color" @click="login">{{ t('登录') }}</el-button>
            </div>
        </el-form>
        <div class="login-hr" />
        <login-switch @change-type="(type)=> $emit('change-type', type)" :type="3"></login-switch>
    </div>    
</template>

<script setup lang="ts">
import { reactive, inject } from 'vue'
import type { FormRules } from 'element-plus'
import CaptchaItem from './CaptchaItem.vue'
import CodeItem from './CodeItem.vue'
import LoginSwitch from './LoginSwitch.vue'
import { usePhoneSendCodeValidate } from './usePhoneSendCodeValidate'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

const  {t} = useTranslation(AdminLogin);

    interface MailLoginForm {
        telephone: string,
        captcha: string,
        code: string
    }

    const form = reactive<MailLoginForm>({
        telephone: '',
        captcha: '',
        code: ''
    });

    const rules = reactive<FormRules<MailLoginForm>>({
        telephone: [{
            required: true,
            message: t('电话号码不能为空')
        }],
        code: [{
            required: true,
            message: t('短信验证码不能为空')
        }]
    });

    const theme = inject('theme') as any;
    
    const {
        showPhoneMsg, phoneFieldStatus, phoneErrMsg,
        showCaptchaMsg, captchaFieldStatus, captchaErrMsg,
        validate
    } = usePhoneSendCodeValidate();

    const prepareValidate = ()=>{
        let captcha = form.captcha;
        let phone = form.telephone;
        return validate(phone, captcha);
    }


    const login = () => {
        console.log(form);
    }
    
</script>
