import { Form, Button,Radio, Input } from 'antd';
import {  useRef, useState } from "react";
import { UserOutlined } from '@ant-design/icons';
import { useSearchParams   } from 'react-router-dom';
import { api } from '../../common/api';
import { CaptchaFormItem, CaptchaFormItemType, CodeFormItem, CodeFormItemType } from "./index";
import { useTranslation } from '../../components/useTranslation';
import { AdminLogin } from '../../common/I18NNamespace';

type ValidateInfoFormType = {
    onSubmit: (values: any) => void
}

/**
 * 验证重设密码信息的表单
 */
export const ValidateInfoForm : React.FC<ValidateInfoFormType> = ({onSubmit}) => {
    
    const { t } = useTranslation(AdminLogin);
    const [form] = Form.useForm();

    let [searchParams] = useSearchParams ();
    //找回方式：1-通过手机号找回， 2-通过邮件找回
    let p = searchParams.get("t") as any;
    const type = useRef( p*1 || 1);

    const [captchaInfo, setCaptchaInfo] = useState<CaptchaFormItemType>({
        captchaStatus: "",
        help: "",
        updateStateAndHelp: () => {
            setCaptchaInfo({...captchaInfo, captchaStatus: '', help: ""})
        }
    });

    const telephoneMsg = {
        accountLabel: t("电话号码"),
        accountPlaceHolder: t("请输入电话"),
        accountRuleMsg: t("电话号码不能为空"),
        codeLabel: t("短信验证码"),
        codeRuleMsg: t("短信验证码不能为空"),
    }

    const emailMsg = {
        accountLabel: t("邮箱地址"),
        accountPlaceHolder: t("请输入邮箱地址"),
        accountRuleMsg: t("邮箱地址不能为空"),
        codeLabel: t("邮箱验证码"),
        codeRuleMsg: t("邮箱验证码不能为空"),
    }
    const [msgs, setMsgs] = useState(type.current == 1?telephoneMsg: emailMsg);
    
    const [accountStatus, setAccountStatus] = useState<any>("");
    const [accountHelp, setAccountHelp] = useState<any>("");

    const prepareSendCode = () => {
        let captcha = form.getFieldValue('captcha');
        let account = form.getFieldValue('account');
        if(!account){
            setAccountStatus('error');
            setAccountHelp(msgs.accountRuleMsg);
            return null;
        }
        if(!captcha){
            setCaptchaInfo({...captchaInfo, captchaStatus: 'error', help: t("验证码不能为空")})
            return null;
        }
        console.log(type.current);
        if(type.current == 1){
            return api.auth.sendPhoneCode+"?code="+captcha+"&phone="+account;;
        }else{
            return api.auth.sendMailCode+"?code="+captcha +"&email="+account;
        }

    }

    const [codeInfo, setCodeInfo] = useState<CodeFormItemType>({
        label: msgs.codeLabel, 
        rules: [{ required: true, message: msgs.codeRuleMsg }],
        validate: prepareSendCode
    });

    const tabChange = (e) =>  {
        let value = e.target.value; 
        // setType(value);
        type.current = value;
        setMsgs(value == 1 ? telephoneMsg: emailMsg);
        setCodeInfo({...codeInfo, label: value == 1 ? telephoneMsg.codeLabel: emailMsg.codeLabel});
        form.resetFields();
    }

    const onFinish = (values) => {
        // console.log('Success:', values);
        // let info = {...values, type: type}
        // dispatch(login(info));
        onSubmit({...values, type: type.current});
    };

    return <>
        <Radio.Group value={type.current} className='login-radio-group' buttonStyle="outline" onChange={tabChange}>
            <Radio.Button style={{background: 'rgba(255,255,255,0.4)'}} value={1}>{t('通过手机号找回')}</Radio.Button>
            <Radio.Button style={{background: 'rgba(255,255,255,0.4)'}} value={2}>{t('通过邮件找回')}</Radio.Button>
        </Radio.Group>
        <div className="login-form-wrap">
            <Form
                size="large"
                colon={true}
                labelCol={{span:7}}
                wrapperCol={{span:15}}
                layout="horizontal"
                form={form}
                onFinish={onFinish}
                initialValues={{ layout: 'horizontal' }}
            >
                <Form.Item label={msgs.accountLabel}
                    name="account"
                    validateStatus={accountStatus}
                    rules={[{ required: true, message: msgs.accountRuleMsg }]}
                    help={accountHelp}
                >
                    <Input placeholder={msgs.accountPlaceHolder} prefix={<UserOutlined style={{color: '#888888'}} />}
                        onChange={(value) => {
                            if(value){
                                setAccountStatus("");
                                setAccountHelp("");
                            }
                        }}
                    />
                </Form.Item>
                <CaptchaFormItem {...captchaInfo}/>
                <CodeFormItem {...codeInfo} />
                <div style={{
                    padding: "5px 15px 15px 15px"
                }}>
                    <Button style={{width: '75%'}}  type="primary" onClick={() => form.submit()}>{t('下一步')}</Button>
                </div>
            </Form>
        </div>
    </>
}