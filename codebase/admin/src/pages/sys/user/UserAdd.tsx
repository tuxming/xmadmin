/*
 * MIT License
 *
 * Copyright (c) 2024 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { App, Button, Col, Divider, Form, Input, Radio, Row, Space, Typography } from "antd";
import { AdminUser, DefaultNS } from "../../../common/I18NNamespace";
import { Modal } from "../../../components";
import { useRequest, useSelector, useShowResult, useTranslation } from "../../../hooks";
import { useState } from "react";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { computePx } from "../../../common/kit";
import { FileUploadFormItem } from "../document";
import { DeptSelector } from "../dept";
import { UserProps } from './index'
import { RoleSelector } from "../role";
import { api } from "../../../common/api";

/**
 * 新增用户
 */
export const UserAdd: React.FC<{
    onClose: (refresh: boolean) => void
}> = ({
    onClose
}) => {
    
    const {t} = useTranslation(AdminUser);
    const request = useRequest();
    const showResult = useShowResult(AdminUser);
    const [visible, setVisible] = useState(true);
    const size = useSelector(state => state.themeConfig.componentSize);
    const [modalPos, setModalPos] = useState<any>({width: null, height: null});

    const [form] = Form.useForm();

    const [title] = useState(t("创建用户"));

    const onModalClose = (refresh: boolean) => {
        setVisible(false);
        setTimeout(()=>{
            onClose(refresh);
        }, 500)
    }

    const onSubmit = () => {
        form.submit();
    } 

    const onFinish = async (values) => {
        
        let data = {};

        Object.keys(values).forEach(key => {
            let val = values[key];
            if(key == 'roleIds'){
                data[key] = val.map(s => s.key*1);
            }else if(val){
                data[key] = val;
            }
        });

        let result = await request.post(api.user.create, data);
        showResult.show(result);
        if(result.status){
            onModalClose(true);
        }
    }

    const onModalChangeSize = (pos) => {
        let npos = {
            width: computePx(pos.width),
            height: computePx(pos.height, true)
        };
        setModalPos(npos);
    }
   
    return (<Modal open={visible} onSizeChange={onModalChangeSize} onClose={()=>onModalClose(false)} title={title} width="75%" showMask={false}>
        <div style={{width:'100%', height: '100%', overflow: 'auto'}}>
            <div style={{padding: "0px 20px 10px 20px", margin: "0px auto"}}>
                <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{title}</Typography.Title>
                <Form form = {form} size={size}
                    onFinish={onFinish}
                >
                    <Row gutter={24}>
                        <Col span={modalPos.width> 650 ? 12 : 24}>
                            <Form.Item<UserProps> label={t("用户名")} name="username"  
                                labelCol={{span: modalPos.width>650?8:4}}
                                rules={[{ required: true, message: t('用户名不能为空') }]}
                            >
                                <Input></Input>
                            </Form.Item>
                        </Col>
                        <Col span={modalPos.width> 650 ? 12 : 24}>
                            <Form.Item<UserProps> label={t("姓名")} name="fullname" 
                                labelCol={{span: modalPos.width>650?8:4}}
                                rules={[{ required: true, message: t('姓名不能为空') }]}
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
                                rules={[
                                    { required: true, message: t('密码不能为空') },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if(value && value.length<6){
                                                return Promise.reject(new Error(t('密码长度小于6')));
                                            }else{
                                                return Promise.resolve();
                                            }
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password></Input.Password>
                            </Form.Item>
                        </Col>
                        <Col span={modalPos.width> 650 ? 12 : 24}>
                            <Form.Item<UserProps> label={t("确认密码")} name="repassword" 
                                labelCol={{span: modalPos.width>650?8:4}}
                                rules={[
                                    {
                                        required: true,
                                        message: t('确认密码不能为空'),
                                    },
                                    ({ getFieldValue }) => ({
                                    validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                                return Promise.reject(new Error(t('两次输入的密码不一致')));
                                        },
                                    }),
                                ]}
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
                                rules={[{ required: true, message: t('所在组织不能为空') }]}
                            >
                                <DeptSelector></DeptSelector>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item<UserProps> label={t("角色")} name="roleIds" 
                                labelCol={{span: 4}}
                                rules={[{ required: true, message: t('角色不能为空') }]}
                            >
                                <RoleSelector></RoleSelector>
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
                        <Button onClick={(() => onModalClose(false))} icon={<CloseOutlined />}>{t("取消", DefaultNS)}</Button>
                        <Button onClick={onSubmit} type="primary" icon={<SendOutlined />}>{t("确定", DefaultNS)}</Button>
                    </Space>
                </div>
            </div>
        </div>
    </Modal>);
}