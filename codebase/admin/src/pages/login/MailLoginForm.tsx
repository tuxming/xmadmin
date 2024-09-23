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

import { useEffect, useState } from "react";
import { Form, Input  } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { api } from '../../common/api'
import { EmailLoginType } from '../../redux/slice';
import { CaptchaFormItem, CaptchaFormItemType, CodeFormItem, CodeFormItemType } from "./index";
import { useTranslation } from "../../hooks/useTranslation";
import { AdminLogin } from "../../common/I18NNamespace";

type MailLoginFormType = {
    form: any,
}

//邮件验证码登录
export const MailLoginForm : React.FC<MailLoginFormType> = ({form}) => {

    const [emailStatus, setEmailStatus] = useState<any>("");
    const [emailHelp, setEmailHelp] = useState<any>("");
    const { t } = useTranslation(AdminLogin);

    const [captchaInfo, setCaptchaInfo] = useState<CaptchaFormItemType>({
        captchaStatus: "",
        help: "",
        updateStateAndHelp: () => {
            setCaptchaInfo({...captchaInfo, captchaStatus: '', help: ""})
        }
    });

    const prepareSendCode = () => {
        let captcha = form.getFieldValue('captcha');
        let email = form.getFieldValue('email');
        if(!email){
            setEmailStatus('error');
            setEmailHelp(t("邮箱地址不能为空"));
            return null;
        }
        if(!captcha){
            setCaptchaInfo({...captchaInfo, captchaStatus: 'error', help: t("验证码不能为空")})
            return null;
        }
        return api.auth.sendMailCode+"?code="+captcha +"&email="+email;
    }

    const [codeInfo] = useState<CodeFormItemType>({
        label: t("邮件验证码"), 
        rules: [{ required: true, message: t('邮箱验证码不能为空') }],
        validate: prepareSendCode
    });

    return (
        <>
        <Form.Item<EmailLoginType> label={t("邮件地址")}
            name="email"
            validateStatus={emailStatus}
            rules={[{ required: true, message: t('邮箱地址不能为空') }]}
            help={emailHelp}
        >
            <Input placeholder={t("请输入邮件地址")} prefix={<UserOutlined style={{color: '#888888'}}  />}
                onChange={(value) => {
                    if(value){
                        setEmailStatus(""); 
                        setEmailHelp("");
                    }
                }} 
            />
        </Form.Item>
        <CaptchaFormItem {...captchaInfo} />
        <CodeFormItem {...codeInfo} />
        </>
    )

}