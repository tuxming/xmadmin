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

import { Form, Input, Button } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { useTranslation } from '../../hooks/useTranslation';
import { AdminLogin } from '../../common/I18NNamespace';

export type ResetFormType = {
    onPrevStep: () => void,
    onSubmit: (values: any) => void,
}

/**
 * 重设密码表单
 * @returns 
 */
export const ResetPasswordForm : React.FC<ResetFormType> = ({onPrevStep, onSubmit}) => {
    
    const { t } = useTranslation(AdminLogin);
    const [form] = Form.useForm();
    
    const onFinish = (values) => {
        onSubmit(values);
    }; 

    return <>
        <div className="login-form-wrap">
            <Form  size="large"
                colon={true}
                labelCol={{span:7}}
                wrapperCol={{span:15}}
                layout="horizontal"
                form={form}
                onFinish={onFinish}
                initialValues={{ layout: 'horizontal' }}
            >
                <Form.Item label={t("新密码：")}
                    name="password"
                    rules={[{ required: true, message: t("密码不能为空")}]}
                >
                    <Input placeholder={t("请输入密码")} prefix={<KeyOutlined style={{color: '#888888'}} />} />
                </Form.Item>
                <Form.Item label={t("确认密码：")}
                    name="repassword"
                    dependencies={['password']}
                    rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error(t('两次输入密码不一致')));
                            },
                          }),
                    ]}
                >
                    <Input placeholder={t("请再次输入新密码")} prefix={<KeyOutlined style={{color: '#888888'}} />} />
                </Form.Item>
                <div style={{
                    display: 'flex',
                    justifyContent: "space-around",
                    marginBottom: "15px"
                }}>
                    <Button type="primary" style={{width: '140px'}} ghost onClick={()=> onPrevStep()}>{t('上一步')}</Button>
                    <Button type="primary" style={{width: '140px'}} onClick={()=> form.submit()}>{t('提交')}</Button>
                </div>
            </Form>
        </div>
    </>

}