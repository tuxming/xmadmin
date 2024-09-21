import { useEffect, useState } from "react";
import  "./LoginPage.css"
import { Form, Button,Tooltip, FormProps } from 'antd';
import { MailOutlined, PhoneFilled} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import {PasswordLoginForm, PhoneLoginForm, MailLoginForm} from "./index";
import { IconFont, useLayer,  } from '../../components';
import { jwtTokenSlice, login, LoginType, persistedUserSlice } from '../../redux/slice'
import { useSelector, useDispatch, useTranslation } from '../../hooks';
import { api } from "../../common/api";
import { useSearchParams   } from 'react-router-dom';
import { AdminLogin } from "../../common/I18NNamespace";

interface LoginFormProp {
    onClickForget: () => void;
}

//登录表单
export const LoginForm: React.FC<LoginFormProp> = ({onClickForget}) => {

    let [searchParams] = useSearchParams ();

    const { message } = useLayer();

    const [form] = Form.useForm();
    const [type, setType] = useState(searchParams.get("t") || 1);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation(AdminLogin);

    const {user, jwtToken} = useSelector(s => s.loginedUser.data );
    const error = useSelector(s => s.loginedUser.error);
    const loading = useSelector(s => s.loginedUser.loading);

    useEffect(() => {
        if(user){
            dispatch(persistedUserSlice.actions.persist(user));
            dispatch(jwtTokenSlice.actions.persist(jwtToken))
            navigate(api.backendPage);
        }
        // console.log(error);
        if(error){
            message.warning(error)
        }

    }, [user, error])

    const clickForget = () => {
        // 调用父组件传递的事件处理函数
        onClickForget();
    };

    const onFinish: FormProps<LoginType>['onFinish'] = (values) => {
        // console.log('Success:', values);
        let info = {...values, type: type}
        dispatch(login(info as LoginType));
    };
    
    const onFinishFailed: FormProps<LoginType>['onFinishFailed'] = (errorInfo) => {
        // messageApi.warning(errofInfo);
        console.log('Failed:', errorInfo);
    };

    return <>
    <div className="login-container">
        <div className="login-part-title">{t('登录')}</div>
        <div className="login-form-wrap">
            <Form
                size="large"
                colon={true}
                labelCol={{span:type==1?6:7}}
                wrapperCol={{span:15}}
                layout="horizontal"
                form={form} 
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                initialValues={{ layout: 'horizontal' }}
            >
                {type == 1 ? <PasswordLoginForm /> : type==2?<MailLoginForm form={form} /> : <PhoneLoginForm form={form} />}
                <div style={{
                    padding: "5px 15px 15px 15px"
                }}>
                    <Button loading={loading} style={{width: '70%'}} type="primary" onClick={()=>{form.submit()}}>{t('登录')}</Button>
                </div>
            </Form>
            <div className="login-hr"/>
            <div className="other-login">
                <Button ghost onClick={clickForget}>{t('忘记密码')}</Button>
                <Tooltip title={t("账号密码登录")} color={'#87d068'} >
                    <Button shape="circle" onClick={()=>setType(1)}  style={{marginLeft: "15px"}} ghost 
                        // icon={<UserOutlined />}
                        icon = {<IconFont fontClass="icon-user" />} 
                    />
                </Tooltip>
                <Tooltip title={t("邮件登录")}  color={'#87d068'} >
                    <Button shape="circle" ghost onClick={()=>setType(2)} style={{marginLeft: "15px", marginRight: "15px"}}  icon={<MailOutlined />} />
                </Tooltip>
                <Tooltip title={t("电话登录")} color={'#87d068'} >
                    <Button shape="circle" onClick={()=>setType(3)} ghost icon={<PhoneFilled />} />
                </Tooltip>
            </div>
        </div>
    </div>
    </>
}