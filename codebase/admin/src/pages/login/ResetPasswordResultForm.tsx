
import { Result, Button } from 'antd';
import { useTranslation } from '../../components/useTranslation';
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