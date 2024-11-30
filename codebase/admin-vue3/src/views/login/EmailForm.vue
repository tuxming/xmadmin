<template>
    <div class="login-form-wrap">
        <el-form :model="form" label-width="auto" size="large"
            :rules="rules"
        >
            <el-form-item prop="email" :error="emailErrMsg" :show-message="showEmailMsg" :validate-status="emailFieldStatus" >
                <template v-slot:label><span class="login-label" >{{t('邮箱地址')}}</span></template>
                <el-input v-model="form.email" class="login-item" />
            </el-form-item>
            <el-form-item prop="captcha" :error="captchaErrMsg" :show-message="showCaptchaMsg" :validate-status="captchaFieldStatus" >
                <template v-slot:label><span class="login-label">验证码</span></template>
                <CaptchaItem v-model="form.captcha" class="login-item"/>
            </el-form-item>
            <el-form-item prop="code">
                <template v-slot:label><span class="login-label">邮箱验证码</span></template>
                <CodeItem v-model="form.code" class="login-item" :validate="prepareValidate"/>
            </el-form-item>
            <div style="padding: 5px 15px 15px 15px; text-align: center;">
                <el-button style="width: 70%" :color="theme.color" @click="login">登录</el-button>
            </div>
        </el-form>
        <div class="login-hr" />
        <login-switch @change-type="(type)=> $emit('change-type', type)" :type="2"></login-switch>
    </div>    
</template>

<script setup lang="ts">
import { reactive, inject } from 'vue'
import type { FormRules } from 'element-plus'
import CaptchaItem from './CaptchaItem.vue'
import LoginSwitch from './LoginSwitch.vue'
import CodeItem from './CodeItem.vue'
import {useEmailSendCodeValidate} from './useEmailSendCodeValidate'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

    const theme = inject('theme') as any;
    const  {t} = useTranslation(AdminLogin);

    interface MailLoginForm {
        email: string,
        captcha: string,
        code: string
    }

    const form = reactive<MailLoginForm>({
        email: '',
        captcha: '',
        code: ''
    });

    const rules = reactive<FormRules<MailLoginForm>>({
        email: [{
            required: true,
            message: '邮箱地址不能为空'
        }],
        code: [{
            required: true,
            message: '邮箱验证码不能为空'
        }]
    });

    const {
        showEmailMsg, emailFieldStatus, emailErrMsg,
        showCaptchaMsg, captchaFieldStatus, captchaErrMsg,
        validate
    } = useEmailSendCodeValidate();
    
    const prepareValidate = ()=>{
        let captcha = form.captcha;
        let email = form.email;
        return validate(email, captcha);
    }

    const login = () => {
        console.log(form);
    }
    
</script>
./useEmailSendCodeValidate