import { Form, Input } from 'antd';
import { FieldStringOutlined} from '@ant-design/icons';
import { useState } from 'react';
import { api } from '../../common/api'
import { useTranslation } from '../../components/useTranslation';
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