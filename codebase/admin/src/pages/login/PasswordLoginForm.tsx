import { useState } from "react";
import { Form, Input  } from 'antd';
import { UserOutlined, KeyOutlined } from '@ant-design/icons';
import { PasswordLoginType } from '../../redux/slice'
import { CaptchaFormItem, CaptchaFormItemType } from "./CaptchaFormItem";
import { useTranslation } from "../../components/useTranslation";
import { AdminLogin } from "../../common/I18NNamespace";

//账号密码登录
export const PasswordLoginForm : React.FC = () => {

    const { t } = useTranslation(AdminLogin);

    const [captchaInfo, setCaptchaInfo] = useState<CaptchaFormItemType>({
        captchaStatus: "",
        help: "",
        name: "code",
        rules: [{ required: true, message: t('验证码不能空') }],
        updateStateAndHelp: () => {
            setCaptchaInfo({...captchaInfo, captchaStatus: '', help: ""})
        }
    });

    return (
        <>
            <Form.Item<PasswordLoginType> 
                label={t("用户名")}
                name="username"
                rules={[{ required: true, message: t('用户名不能为空') }]}
            >
                <Input placeholder={t("请输入账号")} autoComplete="username"  prefix={<UserOutlined style={{color: '#888888'}} />}/>
            </Form.Item>
            <Form.Item<PasswordLoginType>
                label={t("密 码")}
                name="password"
                rules={[{ required: true, message: t('密码不能为空') }]}
            >
                <Input.Password placeholder={t("请输入密码")} autoComplete="current-password" prefix={<KeyOutlined style={{color: '#888888'}}/>}/>
            </Form.Item>
            <CaptchaFormItem {...captchaInfo}/>
        </>
    )

}