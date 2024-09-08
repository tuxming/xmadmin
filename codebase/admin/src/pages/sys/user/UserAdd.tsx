import { App, Button, Col, Divider, Form, Input, Radio, Row, Space, Typography } from "antd";
import { AdminUser, DefaultNS } from "../../../common/I18NNamespace";
import { Modal, useLayer, useRequest, useTranslation } from "../../../components";
import { useEffect, useState } from "react";
import { useSelector } from "../../../redux/hooks";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { computePx } from "../../../common/kit";
import { FileUploadFormItem } from "../document";
import { DeptSelector } from "../dept";
import { UserProps } from './index'

export type UserAddType = {
    open: boolean,
    onClose: (refresh: boolean) => void, 
}

/**
 * 新增用户
 */
export const UserAdd: React.FC<UserAddType> = ({
    open, onClose
}) => {
    
    const {t} = useTranslation(AdminUser);
    const request = useRequest();
    const {message} = useLayer();
    const [visible, setVisible] = useState(true);
    const size = useSelector(state => state.themeConfig.componentSize);
    const [modalPos, setModalPos] = useState<any>({width: null, height: null});

    const [form] = Form.useForm();

    const [title] = useState(t("创建用户"));

    const onModalClose = () => {
        setVisible(false);
        setTimeout(()=>{
            onClose(false);
        }, 500)
    }

    const onSubmit = () => {
        form.submit();
    } 

    const onFinish = (values) => {
        console.log(values);
    }

    const onModalChangeSize = (pos) => {
        let npos = {
            width: computePx(pos.width),
            height: computePx(pos.height, true)
        };
        setModalPos(npos);
    }

    // useEffect(()=>{
    //     if(open && user){
    //         form.setFieldsValue({...user, photo: user.photo? [user.photo]: []});
    //     }
    // }, []);

    if(!open){
        return <></>
    }else{
        return (<Modal open={visible} onSizeChange={onModalChangeSize} onClose={onModalClose} title={title} width="75%" showMask={false}>
            <div style={{width:'100%', height: '100%', overflow: 'auto'}}>
                <div style={{padding: "0px 20px 10px 20px", margin: "0px auto"}}>
                    <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{title}</Typography.Title>
                    <Form form = {form} size={size}
                        onFinish={onFinish}
                    >
                        <Form.Item<UserProps> name="id" noStyle hidden={true} >
                            <Input></Input>
                        </Form.Item>
                        <Row gutter={24}>
                            <Col span={modalPos.width> 650 ? 12 : 24}>
                                <Form.Item<UserProps> label={t("用户名")} name="username"  
                                    labelCol={{span: modalPos.width>650?8:4}}
                                >
                                    <Input readOnly></Input>
                                </Form.Item>
                            </Col>
                            <Col span={modalPos.width> 650 ? 12 : 24}>
                                <Form.Item<UserProps> label={t("姓名")} name="fullname" 
                                    labelCol={{span: modalPos.width>650?8:4}}
                                >
                                    <Input></Input>
                                </Form.Item>
                            </Col>
                            <Col span={modalPos.width> 650 ? 12 : 24}>
                                <Form.Item<UserProps> label={t("邮箱地址")} name="email" 
                                    labelCol={{span: modalPos.width>650?8:4}}
                                >
                                    <Input></Input>
                                </Form.Item>
                            </Col>
                            <Col span={modalPos.width> 650 ? 12 : 24}>
                                <Form.Item<UserProps> label={t("手机号码")} name="phone" 
                                    labelCol={{span: modalPos.width>650?8:4}}
                                >
                                    <Input></Input>
                                </Form.Item>
                            </Col>
                            <Col span={modalPos.width> 650 ? 12 : 24}>
                                <Form.Item<UserProps> label={t("密码")} name="password" 
                                    labelCol={{span: modalPos.width>650?8:4}}
                                >
                                    <Input.Password></Input.Password>
                                </Form.Item>
                            </Col>
                            <Col span={modalPos.width> 650 ? 12 : 24}>
                                <Form.Item<UserProps> label={t("确认密码")} name="repassword" 
                                    labelCol={{span: modalPos.width>650?8:4}}
                                >
                                    <Input.Password></Input.Password>
                                </Form.Item>
                            </Col>
                            <Col span={modalPos.width> 650 ? 12 : 24}>
                                <Form.Item<UserProps> label={t("性别")} name="gender" 
                                    labelCol={{span: modalPos.width>650?8:4}}
                                >
                                    <Radio.Group>
                                        <Radio value={0}>{t('男')}</Radio>
                                        <Radio value={1}>{t('女')}</Radio>
                                        <Radio value={2}>{t('保密')}</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item<UserProps> label={t("所在组织")} name="deptId" 
                                    labelCol={{span: 4}}
                                >
                                    <DeptSelector></DeptSelector>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item<UserProps> label={t("照片")} name="photo" 
                            labelCol={{span: 4}} style={{textAlign: 'right'}}
                        >
                            <FileUploadFormItem maxCount={1} listType="picture-card"></FileUploadFormItem>
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
        </Modal>);

    }

}