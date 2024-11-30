
<template>
<div class='login-bg-img'
    :style="{background: 'url('+bgUrl+') no-repeat center center / cover'}"
>
    <div class='login-bg-color'>
        <div class="login-wrap">
            <div class="login-head">
                <Logo :width="80"/> 
                <span class="login-title">{{ t('XmAdmin后台管理') }}</span>
            </div>
            <div class="login-container">
                <div class="login-part-title">{{loginType == 5? t('找回密码'): t('登录')}}</div>
                <email-form v-if="loginType == 2" @change-type="changeLoginType"></email-form>
                <phone-form v-else-if="loginType == 3" @change-type="changeLoginType"></phone-form>
                <forget-password v-else-if="loginType == 5"></forget-password>
                <password-form v-else="loginType == 1" @change-type="changeLoginType"></password-form>
            </div>
        </div>
    </div>
</div> 
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import bg from '@/assets/bg.jpg'
import PasswordForm from './PasswordForm.vue'
import EmailForm from './EmailForm.vue'
import PhoneForm from './PhoneForm.vue'
import Logo from '../logo/Logo.vue'
import ForgetPassword from './ForgetPassword.vue'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

const  {t} = useTranslation(AdminLogin);

    const bgUrl = ref(bg);

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
    
    const login = () => {
        console.log(form);
    }

    const loginType = ref(1);
    const changeLoginType = (type: number) => {
        loginType.value = type;
        // console.log("change-login-type", type);
    }
    
</script>

<style>
.login-bg-img{
    /* background: url('../../assets/bg.jpg') no-repeat center center / cover; */
    width: 100vw;
    height:100vh;
}

.login-bg-color{
    background: rgba(150,150,150,0.1);
    width:100%;
    height:100%; 
    backdrop-filter: blur(5px);
    display:flex;
    align-items: center;
    justify-content: center;
}
.login-head{
    display:flex;
    align-items: center;
    margin-bottom:20px;
    justify-content: center;
}
.login-title{
    margin-left: 15px;
    font-size:30px; 
    color: rgba(255,255,255,0.75);
}
.login-container{
    background: rgba(255,255,255, 0.3);
    width:400px;
    padding-bottom:10px;
    box-shadow:
        0px 0px 3.6px rgba(0, 0, 0, 0.028),
        0px 0px 10px rgba(0, 0, 0, 0.04),
        0px 0px 24.1px rgba(0, 0, 0, 0.052),
        0px 0px 80px rgba(0, 0, 0, 0.08)
        ;
    border-radius: 4px;
}

.login-part-title{
    font-size:28px;
    padding: 20px 0px;
    color:#6b5353;
    text-align:center;
}

@media screen and (max-width: 575px) {
    .login-container{
        box-sizing: border-box;
        padding-left:20px;
        padding-right:20px;
    }     
}

.login-form-wrap{
    padding: 0 30px;
    box-sizing: border-box;
}

.login-label{
    color: rgba(0, 0, 0, 0.88);
}

.login-hr{
    width:100%;
    border-top:1px solid white;
    height:10px;
    padding-bottom:10px;
}


</style>