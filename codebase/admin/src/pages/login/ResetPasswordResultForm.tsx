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


import { Result, Button } from 'antd';
import { useTranslation } from '../../hooks/useTranslation';
import { AdminLogin } from '../../common/I18NNamespace';

export type ResetResultType = {
    status: 'warning' | 'success',
    msg?: string,
    onPrevStep: ()=>void
}

/**
 * 重设密码结果页面
 * @returns 
 */
export const ResetPasswordResultForm : React.FC<ResetResultType> = ({status, msg, onPrevStep}) => {

    const { t } = useTranslation(AdminLogin);

    return <>
         <Result
            status={status}
            title={status == 'success'? t('成功') : t('失败')}
            subTitle={status == 'success'? t("新密码设置成功，请使用新密码登录"): t("新密码设置失败：")+msg}
            extra={[
                status == 'success'? <Button type="primary" onClick={onPrevStep} ghost key="console">{t('上一步')}</Button> : ""
            ]}
        />
    </>

}