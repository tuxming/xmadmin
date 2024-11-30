
import { ref } from 'vue'
import type {Ref} from 'vue'
import {api} from '../../common/api'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

export function usePhoneSendCodeValidate(): {
    showPhoneMsg: Ref<boolean>,
    phoneFieldStatus: Ref<string>,
    phoneErrMsg: Ref<string>,
    showCaptchaMsg: Ref<boolean>, 
    captchaFieldStatus: Ref<string>, 
    captchaErrMsg: Ref<string>,
    validate: (email: string, captcha: string) => string 
} {

    const { t } = useTranslation(AdminLogin);

    const showPhoneMsg = ref(false);
    const phoneFieldStatus = ref("");
    const phoneErrMsg = ref("");
    
    const showCaptchaMsg = ref(false);
    const captchaFieldStatus = ref("");
    const captchaErrMsg = ref("");
    
    const validate = (phone: string, captcha: string)=>{
        // let captcha = form.captcha;
        // let email = form.email;

        if(!phone) {
            phoneFieldStatus.value = 'error';
            phoneErrMsg.value = t("电话号码不能为空");
            showPhoneMsg.value = true;
            // console.log("电话号码不能为空");
            return;
        }else{
            showPhoneMsg.value = false;
        }

        if(!(/^1[3-9]\d{9}$/.test(phone))){
            phoneFieldStatus.value = 'error';
            phoneErrMsg.value = t("电话号码不正确");
            showPhoneMsg.value = true;
            // console.log("电话号码不正确");
            return;
        }else{
            showPhoneMsg.value = false;
        }

        if(!captcha){
            captchaFieldStatus.value = 'error';
            captchaErrMsg.value = t("验证码不能为空");
            showCaptchaMsg.value = true;
            return;
        }else{
            showCaptchaMsg.value = false;
        }
       
        return api.auth.sendPhoneCode+"?code="+captcha+"&phone="+phone;
    }

    return {
        showPhoneMsg,
        phoneFieldStatus,
        phoneErrMsg,
        showCaptchaMsg, 
        captchaFieldStatus, 
        captchaErrMsg,
        validate
    }
}