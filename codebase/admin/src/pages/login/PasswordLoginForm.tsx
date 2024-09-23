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
import { UserOutlined, KeyOutlined } from '@ant-design/icons';
import { PasswordLoginType } from '../../redux/slice'
import { CaptchaFormItem, CaptchaFormItemType } from "./CaptchaFormItem";
import { useTranslation } from "../../hooks/useTranslation";
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