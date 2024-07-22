
import { useEffect, useState } from "react";
import { Form, Input, App  } from 'antd';
import { SendOutlined, NumberOutlined} from '@ant-design/icons';
import { useRequest } from '../../components/index';

export type CodeFormItemType = {
    label: string, 
    rules?: any[],
    name?: string,
    validate: () => string //返回的是请求的url
}

/**
 * 发送验证的input组件
 */
export const CodeFormItem : React.FC<CodeFormItemType> = ({label,name='code', rules, validate}) => {
    const request = useRequest();
    const [resend, setResend] = useState(true);
    const [balanceSeconds, setBalanceSeconds] = useState(60);
    const { message } = App.useApp();

    const sendCode = () => {
        let url = validate();
        if(!url) return;

        const get = async () => {
            let result = await request.get(url);
            if(result.status){
                message.success(result.msg);
                setResend(false);
                setBalanceSeconds(60);
            }else{
                message.warning(result.msg);
            }
        }
        get();
    }

    useEffect(() => {
        let intervalId : any;
    
        if (!resend) {
          // 更新每秒的倒计时
          intervalId = setInterval(() => {
            let balance = balanceSeconds - 1;
            if(balance>0){
                setBalanceSeconds(balance);
            } else {
                setResend(true);
                clearInterval(intervalId);
            }
          }, 1000);
        }
    
        // 组件卸载时清除定时器
        return () => clearInterval(intervalId);
      }, [resend, balanceSeconds]);

    return <>
         <Form.Item label={label}
            name="code"
            rules={rules?rules: []}
        >
            <Input placeholder={label}
                prefix={<NumberOutlined style={{color: '#888888'}}/>} 
                suffix={resend? <SendOutlined onClick={() => sendCode() }/>: balanceSeconds}
            />
        </Form.Item>
    </>
}