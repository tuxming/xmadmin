
import React, { useEffect, useState, useMemo } from 'react';
import { Layout,  theme, } from 'antd';
import KeepAlive from 'keepalive-for-react';
import { useOutlet,useLocation, useNavigate } from "react-router-dom";
import { Footer } from 'antd/es/layout/layout';
import { Logo, useTranslation } from '../../components';
import "./HomePage.css";
import { SideMenuComponent, HomeHeader } from "./index";
import { basePath, api } from "../../common/api";
import { useDispatch, useSelector } from "../../redux/hooks";
import { ActiveTabSlice, themeConfigSlice } from "../../redux/slice";
import { AdminHome } from "../../common/I18NNamespace";

const { Header, Sider, Content } = Layout;

//主页面
export const HomePage : React.FC = () => {
    const { t } = useTranslation(AdminHome);
    const collapsed = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const dispatch = useDispatch();
    const { token } = theme.useToken();
    const [sideWidth, setSideWidth] = useState<number>(250);
    const sideTheme = useSelector(state => state.themeConfig.sideTheme);
    const wallpaperUrl = useSelector(state => state.themeConfig.wallpaperUrl);
    const bgBlur = useSelector(state => state.themeConfig.bgBlur);
    const activeKey = useSelector(sate => sate.activeTabKey.value);

    const navigate = useNavigate();
    const location = useLocation();
    const outlet = useOutlet();
    const cacheKey = useMemo(() => {
        return location.pathname + location.search;
    }, [location]);

    useEffect(()=> {
        console.log("location change", location);
    }, [location]);
    
    // console.log("defaultActiveKey", activeKey);
    // console.log(location.pathname)
    useEffect(()=>{
        if(!activeKey){
            return;
        }
        // console.log("activeKey", activeKey);

        if(activeKey == location.pathname)
            return;
       
        navigate(activeKey);

        //跳转到指定的路由
    }, [activeKey])

    const changeCollapsed = (collapsed: boolean) => {
        dispatch(themeConfigSlice.actions.changeSidemenuCollapsed(collapsed));
    }

    useEffect(()=>{
        setSideWidth(collapsed?50:250);
    }, [collapsed])

    return (
        <div style={{
            background: wallpaperUrl?`url('${wallpaperUrl}') no-repeat center center / cover` : 'none',
        }}>
            <Layout style={{
                height: '100vh',
                backdropFilter: `blur(${bgBlur}px)`
            }}>
                <Sider trigger={null} collapsible collapsed={collapsed} width={sideWidth} collapsedWidth="50"
                    breakpoint='sm' className='xm-sider' theme={sideTheme}
                    onBreakpoint={(broken)=>changeCollapsed(broken)}
                    style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0,
                        borderRight: '1px solid '+token.colorBorderSecondary,
                    }}
                >
                    <div className="home-user">
                        <Logo width={40} color={token.colorPrimary} />
                        <div className='home-title' style={{color: token.colorPrimary, display: collapsed?'none':'block'}}>
                            {t('Xm-Admin')}
                        </div>
                    </div>
                    <SideMenuComponent collapsed={collapsed}/>
                </Sider>
                <Layout style={{
                    position: 'relative',
                    left: sideWidth,
                    top: 0,
                    maxWidth: `calc(100vw - ${sideWidth}px)`,
                    height: '100vh'
                }}>
                    <Header
                        style={{
                            padding: 0,
                            background: token.colorBgContainer,
                            height: '90px' ,
                            overflow: 'hidden',
                            width: '100%',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            lineHeight: '100%',
                            marginBottom: 10,
                            boxShadow: "0 6px 6px rgba(0, 0, 0, 0.08)"
                        }}
                    >
                        <HomeHeader />
                    </Header>
                    <Content className='xm-container' style={{
                            background: token.colorBgContainer,
                            borderRadius: token.borderRadiusLG,
                            marginTop: 100,
                            maxHeight: 'calc(100vh - 150px)',
                            overflowY: 'auto',
                            boxShadow: token.boxShadowTertiary
                        }}
                    > 
                        <KeepAlive activeName={cacheKey} max={10} strategy={'LRU'}>
                            {outlet}
                        </KeepAlive>
                        {/* <Outlet /> */}
                    </Content>
                    <Footer className='xm-footer' >
                        <Logo width={40} color={token.colorPrimary}/>
                        <span style={{paddingLeft: 10}}>{t('Xm-Admin 后台管理系统')}</span>                
                    </Footer>
                </Layout>
            </Layout>
        </div>
    );
}