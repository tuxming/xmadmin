import { useEffect, useState } from "react"
import { Modal, useRequest, useTranslation } from "../../components"
import { Button, Divider, Form, Input, Space, Typography, FormProps, App } from "antd"
import { CloseOutlined, SendOutlined } from "@ant-design/icons"
import { api } from "../../common/api"
import { AdminPermission, DefaultNS } from "../../common/I18NNamespace"

export type PermissionFormType = {
    id?: number | string,
    groupName?: string, 
    name?: string,
    expression? : string
}

export type PermissionEditType = {
    open: boolean,
    onClose: (refresh:boolean) => void,
    permission?: any
}   

/**
 * 添加，编辑角色
 * @returns 
 */
export const PermissionEdit : React.FC<PermissionEditType> = ({
    open,
    onClose, 
    permission
}) => {
    const [defaultValues, setDefaultValues] = useState<PermissionFormType>();


    const {t} = useTranslation(AdminPermission);
    const request = useRequest();
    const {message} = App.useApp();
    // const [visible, setVisible] = useState(open);
    const [form] = Form.useForm();

    const onModalClose = () => {
        // setVisible(false);
        onClose(false);
    }

    const onSubmit = () => {
        form.submit();
    } 

    const onFinish: FormProps<PermissionFormType>['onFinish'] = (values) => {

        let data = values as any;
        data.type = data.type * 1;

        // console.log(values);
        const create = async () => {
            let result = await request.post(
                data.id?api.permission.update:api.permission.create,
                data
            );
            if(result.status){
                message.success(result.msg);
                onClose(true);
            }else{
                message.error(result.msg);
            }
        }
        create();
    };
    
    useEffect(()=>{
        if(permission) {
            let values = {
                groupName: permission.groupName,
                name: permission.name,
                expression: permission.expression,
                id: permission.id,
            };
            setDefaultValues(values)
            form.setFieldsValue(values);
        }else if(open){
            setDefaultValues(null);
            form.resetFields();
        }
    }, [open]);

    if(open) {
        return <Modal open={open} onClose={onModalClose} title={t("添加角色")} width={400}>
            <>
                <div style={{width:'100%'}}>
                    <div style={{padding: "0px 20px 10px 20px", width: 340, margin: "0px auto"}}>
                        <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{t("添加角色")}</Typography.Title>
                        <Form<PermissionFormType> form = {form} layout='horizontal'
                            onFinish={onFinish}
                        >   
                            <Form.Item name="id" hidden={true}>
                                <Input></Input>
                            </Form.Item>
                            <Form.Item<PermissionFormType> label={t("分组名")} name="groupName"
                                rules={[{ required: true, message: t('分组名不能为空') }]}
                            >
                                <Input></Input>
                            </Form.Item>
                            <Form.Item<PermissionFormType> label={t("权限名")} name="name"
                                rules={[{ required: true, message: t('权限名不能为空') }]}
                            >
                                <Input></Input>
                            </Form.Item>
                            <Form.Item<PermissionFormType> label={t("表达式")} name="expression"
                                rules={[{ required: true, message: t('表达式不能为空') }]}
                            >
                                <Input></Input>
                            </Form.Item>
                        </Form>
                        <Divider />
                        <div style={{textAlign: 'right'}}>
                            <Space>
                                <Button onClick={onModalClose} icon={<CloseOutlined />}>{t("取消", DefaultNS)}</Button>
                                <Button onClick={onSubmit} type="primary" icon={<SendOutlined />}>{t("确定", DefaultNS)}</Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </>
        </Modal>
    }else {
        return <></>
    }
}