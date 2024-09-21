import { useState } from "react";
import { Form, Input  } from 'antd';
import { UserOutlined} from '@ant-design/icons';
import { api } from '../../common/api';
import { PhoneLoginType } from '../../redux/slice';
import { CaptchaFormItem, CaptchaFormItemType, CodeFormItem, CodeFormItemType } from "./index";
import { useTranslation } from "../../hooks/useTranslation";
import { AdminLogin } from "../../common/I18NNamespace";


type PhoneLoginFormType = {
    form: any,
}
//手机验证码登录
export const PhoneLoginForm : React.FC<PhoneLoginFormType> = ({form}) => {

    const { t } = useTranslation(AdminLogin);
    const [phoneStatus, setPhoneStatus] = useState<any>("");
    const [phoneHelp, setPhoneHelp] = useState<any>("");

    const [captchaInfo, setCaptchaInfo] = useState<CaptchaFormItemType>({
        captchaStatus: "",
        help: "",
        updateStateAndHelp: () => {
            setCaptchaInfo({...captchaInfo, captchaStatus: '', help: ""})
        }
    });

    const prepareSendCode = () => {
        let captcha = form.getFieldValue('captcha');
        let telephone = form.getFieldValue('telephone');
        if(!telephone){
            setPhoneStatus('error');
            setPhoneHelp(t("电话号码不能为空"));
            return null;
        }
        if(!captcha){
            setCaptchaInfo({...captchaInfo, captchaStatus: 'error', help: t("验证码不能为空")})
            return null;
        }
        return api.auth.sendPhoneCode+"?code="+captcha+"&phone="+telephone;
    }

    const [codeInfo] = useState<CodeFormItemType>({
        label: t("短信验证码"), 
        rules: [{ required: true, message: t('短信验证码不能为空') }],
        validate: prepareSendCode
    });

    return (
        <>
            <Form.Item<PhoneLoginType> label={t("手机号")}
                name="telephone"
                validateStatus={phoneStatus}
                rules={[{ required: true, message: t('邮箱地址不能为空') }]}
                help={phoneHelp}
            >
                <Input placeholder={t("请输入手机号")}  prefix={<UserOutlined style={{color: '#888888'}} />}/>
            </Form.Item>
            <CaptchaFormItem {...captchaInfo}/>
            <CodeFormItem {...codeInfo} />
        </>
    )

}