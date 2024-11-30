
import { ref } from 'vue'
import type {Ref} from 'vue'
import {api} from '../../common/api'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

export function useEmailSendCodeValidate() : {
    showEmailMsg: Ref<boolean>,
    emailFieldStatus: Ref<string>,
    emailErrMsg: Ref<string>,
    showCaptchaMsg: Ref<boolean>, 
    captchaFieldStatus: Ref<string>, 
    captchaErrMsg: Ref<string>,
    validate: (email: string, captcha: string) => string 
} {

    const { t } = useTranslation(AdminLogin);
    const showEmailMsg = ref(false);
    const emailFieldStatus = ref("");
    const emailErrMsg = ref("");
    
    const showCaptchaMsg = ref(false);
    const captchaFieldStatus = ref("");
    const captchaErrMsg = ref("");
    
    const validate = (email: string, captcha: string)=>{
        // let captcha = form.captcha;
        // let email = form.email;

        if(!email) {
            emailFieldStatus.value = 'error';
            emailErrMsg.value = t("邮箱地址不能为空");
            showEmailMsg.value = true;
            // console.log("邮箱地址不能为空");
            return;
        }else{
            showEmailMsg.value = false;
        }

        if(!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))){
            emailFieldStatus.value = 'error';
            emailErrMsg.value = t("邮箱地址不正确");
            showEmailMsg.value = true;
            // console.log("邮箱地址不正确");
            return;
        }else{
            showEmailMsg.value = false;
        }

        if(!captcha){
            captchaFieldStatus.value = 'error';
            captchaErrMsg.value = t("验证码不能为空");
            showCaptchaMsg.value = true;
            return;
        }else{
            showCaptchaMsg.value = false;
        }
       
        return api.auth.sendMailCode+"?code="+captcha +"&email="+email;
    }


    return {
        showEmailMsg,
        emailFieldStatus,
        emailErrMsg,
        showCaptchaMsg, 
        captchaFieldStatus, 
        captchaErrMsg,
        validate
    }
}