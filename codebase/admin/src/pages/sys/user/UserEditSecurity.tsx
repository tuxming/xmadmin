import { Alert, Descriptions,DescriptionsProps, Form, Input, Space } from "antd"
import { UserProps } from "./UserType"
import { useTranslation } from "../../../hooks"
import { EditableTextItem, useLayer } from "../../../components"
import { AdminUser } from "../../../common/I18NNamespace"
import { TokenItem } from "./TokenItem"
import { EditIcon } from "../../../components/icon/svg/Icons"
import { useState } from "react"

/**
 * 编辑用户的账户安全信息
 */
export const UserEditSecurity : React.FC<{
    onHandleChange: (key: string, value: any) => void,
    user: UserProps,
    modalPos: any
}> = ({
    onHandleChange,
    user,
    modalPos
}) => {


    const {t} = useTranslation(AdminUser);
    const Layer = useLayer();

    const [statuses] = useState<any[]>([
        t("低"),
        t("中"),
        t("高"),
    ]);

    //修改密码
    const [form] = Form.useForm();
    const onFinish = (values) => {
        onHandleChange("password", values);
    };

    let ChangePasswordForm = () => {
        const [statusLabel, setStatusLabel] = useState<string>(t("强度"));
        const [showIcon, setShowIcon] = useState<boolean>(false);
        const [status, setStatus]  = useState<any>("info")

        const passwordChange = (event) => {
            // console.log("password",event)
            let value = event.currentTarget.value;
            setShowIcon(true);
            if(value){
                if(value.length<6){
                    setStatusLabel(statuses[0]);
                    setStatus("error");
                }else{
                    let isNum = /\d+/.test(value);
                    let isUpper = /[A-Z]+/.test(value);
                    let isLower = /[a-z]+/.test(value);
                    let isSymbol = /[`~!@#\$\%\^\&\*\(\)\_\+\-\=\<\>,\.\?\/\:;\"\'\\\|]+/.test(value);
    
                    let count = 0; 
                    count += isNum ? 1 : 0;
                    count += isUpper ? 1 : 0;
                    count += isLower ? 1 : 0;
                    count += isSymbol ? 1 : 0;
    
                    if(count < 2){
                        setStatusLabel(statuses[0]);
                        setStatus("error");
                    }else if(count<3){
                        setStatusLabel(statuses[1]);
                        setStatus("warning");
                    }else {
                        setStatusLabel(statuses[2]);
                        setStatus("success");
                    }
                }
    
    
            }else{
                setStatusLabel(statuses[0]);
                setStatus("error");
            }
    
        }

        return <>
            <Form form={form} onFinish={onFinish} style={{textAlign: 'left'}}>
                <Form.Item label={t("原 密 码")} name="password"
                    rules={[{ required: true, message: t('原密码不能为空') }]}
                >
                    <Input.Password></Input.Password>
                </Form.Item>
                <Form.Item label={t("新 密 码")} name="newPassword"
                    rules={[
                        { required: true, message: t('新密码不能为空') },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if(value && value.length<6){
                                    return Promise.reject(new Error(t('新密码长度小于6')));
                                }else{
                                    return Promise.resolve();
                                }
                            },
                        }),
                    ]}
                >
                    <Space.Compact block>
                        <Form.Item noStyle><Input.Password onChange={passwordChange}></Input.Password></Form.Item>
                        <Alert style={{whiteSpace: 'nowrap'}} message={statusLabel} type={status} showIcon={showIcon} />
                    </Space.Compact>
                </Form.Item>
                <Form.Item label={t("确认密码")} name="rePassword"
                    dependencies={['newPassword']} hasFeedback
                    rules={[
                        {
                            required: true,
                            message: t('确认密码不能为空'),
                        },
                        ({ getFieldValue }) => ({
                        validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                    return Promise.reject(new Error(t('两次输入的密码不一致')));
                            },
                        }),
                    ]}
                >
                    <Input.Password></Input.Password>
                </Form.Item>
            </Form>
        </>
    }

    const onChangePassword = () => {
        Layer.confirm({
            title: t("修改密码："),
            content: <ChangePasswordForm />,
            onOk: ()=> {
                form.submit();
            }
        });

    }

    //账号与安全的信息构建
    const safeItems: DescriptionsProps['items'] = [
        {
            key: "email",
            label: t('邮箱地址'),
            children:  <EditableTextItem value={user.email} copyable
                onChange={(value)=>onHandleChange("email",value)} 
            ></EditableTextItem>
        },
        {
            key: "phone",
            label: t('电话号码'),
            children:  <EditableTextItem value={user.phone} copyable
                onChange={(value)=>onHandleChange("phone",value)} 
            ></EditableTextItem>
        },
        {
            key: "token",
            label: t('App Secret'),
            span: modalPos.width>500?2: 1 ,
            children:  <TokenItem value={user.token} copyable 
                        onRefresh={(value)=>onHandleChange("token",true)} 
                    />
        },
        {
            key: "password",
            label: t('密码'),
            span: modalPos.width>500?2: 1,
            children:  <EditIcon type="primary" ghost onClick={onChangePassword}></EditIcon>
        },
    ];

    return <Descriptions style={{marginTop: 5}} className="user-basic-info" bordered items={safeItems} title={t("账户与安全")}
                column={modalPos.width>500?2: 1} />
}
