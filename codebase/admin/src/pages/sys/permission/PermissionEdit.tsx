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

import { useEffect, useState } from "react"
import { useRequest, useTranslation } from "../../../hooks"
import { Modal } from "../../../components"
import { Button, Divider, Form, Input, Space, Typography, FormProps } from "antd"
import { CloseOutlined, SendOutlined } from "@ant-design/icons"
import { api } from "../../../common/api"
import { AdminPermission, DefaultNS } from "../../../common/I18NNamespace"
import { useShowResult } from "../../../hooks/useShowResult"

export type PermissionFormType = {
    id?: number | string,
    groupName?: string, 
    name?: string,
    expression? : string
}

export type PermissionEditType = {
    open: boolean,
    onClose: (refresh:boolean) => void,
    permission?: any,
    title?: string
}   

/**
 * 添加，编辑角色
 * @returns 
 */
export const PermissionEdit : React.FC<PermissionEditType> = ({
    open,
    onClose, 
    permission,
    title
}) => {
    const [defaultValues, setDefaultValues] = useState<PermissionFormType>();

    const {t} = useTranslation(AdminPermission);
    const showResult = useShowResult(AdminPermission);
    const request = useRequest();
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
            showResult.show(result);
            if(result.status){
                onClose(true);
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
        return <Modal open={open} onClose={onModalClose} title={title} width={400}
            showMask={false}
        > 
            <>
                <div style={{width:'100%'}}>
                    <div style={{padding: "0px 20px 10px 20px", width: 340, margin: "0px auto"}}>
                        <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{title}</Typography.Title>
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