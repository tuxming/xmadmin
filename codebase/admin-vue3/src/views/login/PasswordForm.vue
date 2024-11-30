<template>
<div class="login-form-wrap">
    <el-form :model="form" label-width="auto" size="large"
        :rules="rules"
    >
        <el-form-item prop="username">
            <template v-slot:label><span class="login-label">{{ t('用户名') }}</span></template>
            <el-input v-model="form.username" class="login-item"/>
        </el-form-item>
        <el-form-item prop="password">
            <template v-slot:label><span class="login-label">{{ t('密 码') }}</span></template>
            <el-input type="password" v-model="form.password" show-password class="login-item"/>
        </el-form-item>
        <el-form-item prop="code">
            <template v-slot:label><span class="login-label">{{ t('验证码') }}</span></template>
            <CaptchaItem v-model="form.code" class="login-item"/>
        </el-form-item>
        <div style="padding: 5px 15px 15px 15px; text-align: center;">
            <el-button style="width: 70%" :color="theme.color" @click="login">{{ t('登录') }}</el-button>
        </div>
    </el-form>
    <div class="login-hr" />
    <login-switch @change-type="(type)=> $emit('change-type', type)" :type="1"></login-switch>
</div>    

</template>

<script setup lang="ts">
import { reactive, inject } from 'vue'
import type { FormRules } from 'element-plus'
import CaptchaItem from './CaptchaItem.vue'
import LoginSwitch from './LoginSwitch.vue'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

const  {t} = useTranslation(AdminLogin);

    interface LoginForm {
        username: string,
        password: string,
        code: string
    }

    const form = reactive<LoginForm>({
        username: '',
        password: '',
        code: ''
    });

    const rules = reactive<FormRules<LoginForm>>({
        username: [{
            required: true,
            message: '用户名不能为空'
        }],
        password: [{
            required: true,
            message: '密码不能为空'
        }],
        code: [{
            required: true,
            message: '验证码不能为空'
        }]
    });

    const theme = inject('theme') as any;
    
    const login = () => {
        console.log(form);
    }
    
</script>
