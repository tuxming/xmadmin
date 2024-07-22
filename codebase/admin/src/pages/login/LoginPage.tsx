
import { useState } from "react";
import  "./LoginPage.css"
import {LoginForm, ForgetForm} from "./index";
import {Logo} from "../../components/Logo";
import { useSearchParams   } from 'react-router-dom';
import { useSelector } from "../../redux/hooks";
import { useTranslation } from "../../components/useTranslation";
import { AdminLogin } from "../../common/I18NNamespace";
import bg from '../../assets/bg.jpg'

/**
 * /login?f=1&t=2
 * f: 1-登录，2-忘记密码，默认1
 * t: 默认1
 * f=1: t: 1-账号密码登录，2-邮件登录，3-电话号码登录
 * f=2: t: 1-通过电话号码找回， 2-通过邮件找回
 * @returns 登录页面
 * 
 */
export const LoginPage : React.FC = () => {
    const { t } = useTranslation(AdminLogin);

    let [searchParams] = useSearchParams();
    const [type, setType] = useState(searchParams.get("f") || 1);
    const bgUrl = useSelector(state => state.themeConfig.wallpaperUrl);

    return (
    <div className='login-bg-img'
        style={{background: `url(${bgUrl?bgUrl: bg}) no-repeat center center / cover`}}
    >
        <div className='login-bg-color'>
            <div className="login-wrap">
                <div className="login-head">
                    <Logo width={80}/>
                    <span className="login-title">{t('XmAdmin后台管理')}</span>
                </div>
                {
                    type == 1 ? <LoginForm onClickForget={ ()=>setType(2) }/> : <ForgetForm onClickLogin={ ()=>setType(1)} />
                }
            </div>
        </div>
    </div> 
    )
}