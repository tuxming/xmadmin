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

import { Button, Divider, Form, Input, Space, Typography } from "antd";
import { AdminLang, DefaultNS } from "../../../common/I18NNamespace";
import { useRequest, useSelector, useTranslation } from "../../../hooks";
import { Modal } from "../../../components";
import { useEffect, useState } from "react";
import { api } from "../../../common/api";
import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { useShowResult } from "../../../hooks/useShowResult";


export type LangEditFormType = {
    id?: number,
    label?: string,
    code?: string,
}

export type LangEditType = {
    lang: LangEditFormType,
    open: boolean,
    onClose: (lang?: LangEditFormType) => void,
    title
}

/**
 * 语言新增，编辑页面
 */
export const LangEdit: React.FC<LangEditType> = ({
    lang,
    open,
    onClose,
    title
}) => {
    const {t} = useTranslation(AdminLang);
    const request = useRequest();
    const [visible, setVisible] = useState(true);
    const size = useSelector(state => state.themeConfig.componentSize);
    const showResult = useShowResult(AdminLang);

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
        data.id = lang?.id || null;

        // console.log(values);
        const create = async () => {
            let result = await request.post(
                data.id?api.lang.updateLang:api.lang.addLang,
                data
            );
            showResult.show(result);
            if(result.status){
                onClose({...data, id:data.id || result.data});
            }
        }
        create();
    };

    useEffect(()=>{
        if(open && lang){
            form.setFieldsValue(lang);
        }
    }, []);


    if(open)

        return <Modal open={visible} onClose={onModalClose} title={title} width={400}
                showMask={false}
            > 
                <div style={{width:'100%'}}>
                    <div style={{padding: "0px 20px 10px 20px", margin: "0px auto"}}>
                        <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{title}</Typography.Title>
                        <Form form = {form} layout='horizontal'
                            onFinish={onFinish}
                            size={size}
                        >   
                            <Form.Item<LangEditFormType> label={t("显示名")} name="label"
                                rules={[{ required: true, message: t('语言显示名不能为空') }]}
                            >
                                <Input></Input>
                            </Form.Item>
                            <Form.Item<LangEditFormType> label={t("语言代码")} name="code"
                                rules={[{ required: true, message: t('语言代码不能为空') }]}
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
            </Modal>
    else {
        return <></>
    }
}
