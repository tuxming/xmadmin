/*
 * MIT License
 *
 * Copyright (c) 2024 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

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