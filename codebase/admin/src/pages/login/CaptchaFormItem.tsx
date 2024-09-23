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

import { Form, Input } from 'antd';
import { FieldStringOutlined} from '@ant-design/icons';
import { useState } from 'react';
import { api } from '../../common/api'
import { useTranslation } from '../../hooks/useTranslation';
import { AdminLogin } from '../../common/I18NNamespace';

type captchaStatusType =  "" | "success" | "warning" | "error" | "validating";
export type CaptchaFormItemType = {
    captchaStatus: captchaStatusType,
    help: string,
    name?: string,
    rules?: any[],
    updateStateAndHelp: () => void
}

/**
 * 验证码输入框组件
 * @returns 
 */
export const CaptchaFormItem: React.FC<CaptchaFormItemType> = ({captchaStatus, help, name="captcha", rules, updateStateAndHelp}) => {
    const [codeUrl, setCodeUrl] = useState(api.auth.code);

    const { t } = useTranslation(AdminLogin);
    
    return <>
        <Form.Item label={t("验证码")} name={name}
            validateStatus={captchaStatus}
            help={help}
            rules={rules?rules: []}
        > 
            <div style={{display: "flex", alignItems: "center"}}>
                <Input placeholder={t("验证码")}  
                    style={{borderTopRightRadius: "0px", borderEndEndRadius: "0px"}}
                    prefix={<FieldStringOutlined style={{color: '#888888'}} />}
                    onChange={(value) => {
                        if(value){
                            updateStateAndHelp();
                        }
                    }}
                />
                <img src={codeUrl} style={{height:"39px"}} onClick={()=>setCodeUrl(api.auth.code+"?"+new Date().getTime())}/>
            </div>
        </Form.Item>
    </>
}