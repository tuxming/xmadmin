import { useEffect, useState } from "react"
import { Modal} from "../../../components"
import { useRequest, useTranslation } from "../../../hooks"
import { Button, Divider, Form, Input, Space, Typography, FormProps } from "antd"
import { CloseOutlined, SendOutlined } from "@ant-design/icons"
import { RoleTypeSelector } from "./RoleType"
import { api } from "../../../common/api"
import { AdminRole, DefaultNS } from "../../../common/I18NNamespace"
import { useShowResult } from "../../../hooks/useShowResult"

export type RoleFormType = {
    id?: number | string,
    roleName?: string, 
    code?: string,
    type?: string[]
}

export type RoleAddType = {
    onClose: (refresh:boolean) => void,
    role?: any
}   

/**
 * 添加，编辑角色
 * @returns 
 */
export const RoleEdit : React.FC<RoleAddType> = ({
    onClose, 
    role
}) => {
    const [defaultValues, setDefaultValues] = useState<RoleFormType>();
    const [visible, setVisible] = useState<boolean>(true);

    // if(role && !defaultValues){
    //     setDefaultValues({
    //         roleName: role.roleName,
    //         type: [role.type],
    //         code: role.code,
    //         id: role.id,
    //     })
    // }

    const {t} = useTranslation(AdminRole);
    const request = useRequest();
    const showResult = useShowResult(AdminRole);
    // const [visible, setVisible] = useState(open);
    const [form] = Form.useForm();

    const onModalClose = (refresh) => {
        // setVisible(false);
        setVisible(false);
        setTimeout(() => {
            onClose(refresh); 
        }, 500);
    }

    const onSubmit = () => {
        form.submit();
    } 

    const onFinish: FormProps<RoleFormType>['onFinish'] = (values) => {

        let data = values as any;
        data.type = data.type * 1;

        // console.log(values);
        const create = async () => {
            let result = await request.post(
                data.id?api.role.update:api.role.create,
                data
            );
            showResult.show(result);
            if(result.status){
                onModalClose(true);
            }
        }
        create();
    };
    
    useEffect(()=>{
        if(role) {
            let values = {
                roleName: role.roleName,
                type: [role.type],
                code: role.code,
                id: role.id,
            };
            setDefaultValues(values)
            form.setFieldsValue(values);
        }else if(open){
            setDefaultValues(null);
            form.resetFields();
        }
    }, [open]);


    return <Modal open={visible} onClose={() => onModalClose(false)} title={t("添加角色")} width={400} showMask={false}>
        <>
            <div style={{width:'100%'}}>
                <div style={{padding: "0px 20px 10px 20px", width: 340, margin: "0px auto"}}>
                    <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{t("添加角色")}</Typography.Title>
                    <Form<RoleFormType> form = {form} layout='horizontal'
                        onFinish={onFinish}
                    >
                        <Form.Item name="id" hidden={true}>
                            <Input allowClear></Input>
                        </Form.Item>
                        <Form.Item<RoleFormType> label={t("角色名")} name="roleName"
                            rules={[{ required: true, message: t('角色名不能为空') }]}
                        >
                            <Input allowClear></Input>
                        </Form.Item>
                        <Form.Item<RoleFormType> label={t("角色代码")} name="code"
                            rules={[{ required: true, message: t('角色代码不能为空') }]}
                        >
                            <Input allowClear></Input>
                        </Form.Item>
                        <Form.Item<RoleFormType> label={t("角色类型")} name="type"
                            rules={[{ required: true, message: t('角色类型不能为空') }]}
                        >
                            <RoleTypeSelector/>
                        </Form.Item>
                    </Form>
                    <Divider />
                    <div style={{textAlign: 'right'}}>
                        <Space>
                            <Button onClick={() => onModalClose(false)} icon={<CloseOutlined />}>{t("取消", DefaultNS)}</Button>
                            <Button onClick={onSubmit} type="primary" icon={<SendOutlined />}>{t("确定", DefaultNS)}</Button>
                        </Space>
                    </div>
                </div>
            </div>
        </>
    </Modal>
}