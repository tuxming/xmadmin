import { Form, Input, Typography, Divider, Space, Button } from "antd"
import { Modal, useRequest, useTranslation, useLayer } from "../../../components"
import { AdminDept, DefaultNS } from "../../../common/I18NNamespace"
import { api } from "../../../common/api"
import { CloseOutlined, SendOutlined } from "@ant-design/icons"
import { DeptTypeSelector, DeptSelectorWraper } from "./index"
import { useEffect, useState } from "react"
import { useSelector } from "../../../redux/hooks"

export type DeptEditFormType = {
    id?: number,
    name?: string,
    parentId?: number,
    parentName?: string,
    path?: string,
    pathName?: string,
    type?: number
}

export type DeptEditType = {
    dept?: DeptEditFormType,
    open: boolean,
    onClose: (updateIds: number[]) => void,
    title: string
}

export const DeptEdit: React.FC<DeptEditType> = ({
    dept,
    open,
    onClose,
    title
}) => {
    const {t} = useTranslation(AdminDept);
    const request = useRequest();
    const {message} = useLayer();
    const [visible, setVisible] = useState(true);
    const size = useSelector(state => state.themeConfig.componentSize);

    const [form] = Form.useForm();

    const onModalClose = () => {
        setVisible(false);
        setTimeout(()=>{
            onClose(null);
        }, 500)
    }

    const onSubmit = () => {
        form.submit();
    } 

    // const onFinish: FormProps<PermissionFormType>['onFinish'] = (values) => {
    const onFinish = (values) => {
        // console.log(values);
        let data = values as any;
        data.type = data.type * 1;
        data.id = dept?.id || null;

        let isUpdate = data.id ? true: false;

        // console.log(values);
        const create = async () => {
            let result = await request.post(
                data.id?api.dept.update:api.dept.create,
                data
            );
            if(result.status){
                message.success(result.msg);
                setVisible(false);
                setTimeout(() => {
                    if(isUpdate){
                        if(dept.parentId !== values.parentId){
                            onClose([dept.parentId, values.parentId]);
                        }else{
                            onClose([dept.parentId]);
                        }
                    }else{
                        onClose([data.parentId]);
                    }
                }, 500);
            }else{
                message.error(result.msg);
            }
        }
        create();
    };

    useEffect(()=>{
        if(open && dept){
            form.setFieldsValue(dept);
        }
    }, []);

    if(open)

        return <Modal open={visible} onClose={onModalClose} title={title} width={600}
                showMask={false}
            > 
                <div style={{width:'100%'}}>
                    <div style={{padding: "0px 20px 10px 20px", margin: "0px auto"}}>
                        <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{title}</Typography.Title>
                        <Form form = {form} layout='horizontal'
                            onFinish={onFinish}
                            size={size}
                        >   
                            {dept && dept.path && dept.pathName && <Form.Item<DeptEditFormType> label={t("组织信息")} >
                                <Typography.Paragraph>{dept.path}<br/>{dept.pathName}</Typography.Paragraph>
                            </Form.Item>
                            }
                            <Form.Item<DeptEditFormType> name="id" hidden={true}>
                                <Input></Input>
                            </Form.Item>
                            <Form.Item<DeptEditFormType> label={t("组织名")} name="name"
                                rules={[{ required: true, message: t('组织名不能为空') }]}
                            >
                                <Input></Input>
                            </Form.Item>
                            <Form.Item<DeptEditFormType> label={t("上级组织")} name="parentId"
                                rules={[{ required: true, message: t('上级组织不能为空') }]}
                            >
                                <DeptSelectorWraper  showName={dept?.parentName}></DeptSelectorWraper>
                            </Form.Item>
                            <Form.Item<DeptEditFormType> label={t("类型")} name="type"
                                rules={[{ required: true, message: t('类型不能为空') }]}
                            >
                                <DeptTypeSelector></DeptTypeSelector>
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
            </Modal>
    else {
        return <></>
    }
}