import { Button, Steps } from 'antd';
import { useRef, useState } from 'react';
import { ArrowLeftOutlined} from '@ant-design/icons';
import './LoginPage.css';
import './ForgetForm.css';
import { useRequest } from '../../components/index';
import { api } from '../../common/api'

import {
    ValidateInfoForm,
    ResetPasswordForm,
    ResetPasswordResultForm,
    ResetResultType,
    ResetFormType,
} from './index'
import { useTranslation } from '../../components/useTranslation';
import { AdminLogin } from '../../common/I18NNamespace';

interface ForgetFormProp {
    onClickLogin: () => void;
}

//忘记密码页面
export const ForgetForm : React.FC<ForgetFormProp> = ({onClickLogin}) => {

    const [stepIndex, setStepIndex] = useState(0);
    const {t} =useTranslation(AdminLogin);

    const values = useRef({});
    const [resultInfo, setResultInfo] = useState<ResetResultType>({
        status: 'success',
        msg: null,
        onPrevStep: ()=>{
            onUpdateStep(0);
        }
    })

    const request = useRequest();

    const [resetForm, setResetForm] = useState<ResetFormType>({
        onPrevStep: ()=>{
            onUpdateStep(0);
        },
        onSubmit: (vs)=>{
            // console.log(vs, values);
            let merged = {...values.current, ...vs};

            //提交到后台
            let get = async () => {
                let result = await request.post(api.auth.resetPassword, merged);
                if(result.status){
                    setResultInfo({...resultInfo,
                        status: 'success',
                        msg: null, 
                    });
                }else{
                    setResultInfo({...resultInfo,
                        status: 'warning',
                        msg: result.msg
                    });
                }
                setStepIndex(2);
            }
            get();
        }
    });

    const onUpdateStep = (index) => {
        setStepIndex(index);
    }

    const onValidateInfo = (vs) => {
        values.current = vs;
        onUpdateStep(1);
    }

    return (
    <div className='login-container'>
        <div className="login-part-title">{t('忘记密码')}</div>
        
        <Steps current={stepIndex} className='forget-step'
            items={[{title: t('验证') },{title: t('重置')}, {title: t('结果')}]}
            style={{
                padding: "0px 15px 15px 15px",
                flexDirection: "row"
            }}
        />
        <div className='login-form-wrap'>

            {
                stepIndex == 2 ? <ResetPasswordResultForm {...resultInfo} /> 
                : stepIndex == 1 ? <ResetPasswordForm {...resetForm} /> 
                : <ValidateInfoForm onSubmit={onValidateInfo}/>
            }

            <div className="login-hr"/>
            <div style={{textAlign: "center"}}>
                <Button onClick={onClickLogin} icon={<ArrowLeftOutlined />}  ghost>去登录</Button>
            </div>
        </div>
    </div> 
    )
}