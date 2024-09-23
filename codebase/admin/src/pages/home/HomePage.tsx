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


import React, { useEffect, useState, useMemo } from 'react';
import { Layout,  Typography,  theme, } from 'antd';
import KeepAlive from 'keepalive-for-react';
import { useOutlet,useLocation, useNavigate } from "react-router-dom";
import { Footer } from 'antd/es/layout/layout';
import { useTranslation, useSelector,useDispatch } from '../../hooks';
import { Logo, Modal} from '../../components';
import "./HomePage.css";
import { SideMenuComponent, HomeHeader } from "./index";
import { ActiveTabSlice, TabItemsSlice, openItemSlice, themeConfigSlice } from "../../redux/slice";
import { AdminHome } from "../../common/I18NNamespace";

const { Header, Sider, Content } = Layout;

//主页面
export const HomePage : React.FC = () => {
    const { t } = useTranslation(AdminHome);
    const collapsed = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const dispatch = useDispatch();
    const { token } = theme.useToken();
    const configedSideWidth = useSelector(state => state.themeConfig.sideWidth); 
    const [sideWidth, setSideWidth] = useState<number>(configedSideWidth);
    const sideTheme = useSelector(state => state.themeConfig.sideTheme);
    const wallpaperUrl = useSelector(state => state.themeConfig.wallpaperUrl);
    const bgBlur = useSelector(state => state.themeConfig.bgBlur);
    const activeKey = useSelector(state => state.activeTabKey.value);
    //带打开的弹窗
    const openItem = useSelector(state => state.openItem.value);
    const items = useSelector(state => state.tabItems.items);
    
    const [pageModals, setPageModals] = useState<any>([]);

    const navigate = useNavigate();
    const location = useLocation();
    const outlet = useOutlet();
    const cacheKey = useMemo(() => {
        return location.pathname + location.search;
    }, [location]);


    useEffect(() => {
        // console.log(openItem);
        //添加打开modal
        let item = openItem as any;
        if(item && item.key === activeKey){
            setPageModals([...pageModals, {...item, outlet: outlet}]);
            //清除掉item
            //移除掉tab
            setTimeout(() => {
                let index = items.findIndex(i => i.key == activeKey); 
                let newItems = items.filter((s, idx) => idx != index);
                dispatch(TabItemsSlice.actions.setItems(newItems));

                let newIndex = index;
                if(newIndex == items.length - 1){
                    newIndex = index - 1;
                }
                dispatch(ActiveTabSlice.actions.activeKey(newItems[newIndex].path));
            }, 300);
        }

    }, [openItem]);


    //监听activeKey变化，跳转到指定页面
    useEffect(()=>{
        // console.log(activeKey);
        if(!activeKey){
            return;
        }

        if(activeKey == location.pathname)
            return;
       
        navigate(activeKey);

        //跳转到指定的路由
    }, [activeKey])

    const changeCollapsed = (collapsed: boolean) => {
        dispatch(themeConfigSlice.actions.changeSidemenuCollapsed(collapsed));
    }

    const onPageModelClose = (item) => {
        const pms = pageModals.filter(m => m.key != item.key);
        // console.log(pms);
        setPageModals(pms);
    }

    useEffect(()=>{
        setSideWidth(collapsed?50:configedSideWidth);
    }, [collapsed]);

    useEffect(() => {
        if(!collapsed){
            setSideWidth(configedSideWidth);
        }
    }, [configedSideWidth]);

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
            {pageModals.map(item => {
                return <Modal showMask={false} open key={item.key} 
                    onClose={()=>onPageModelClose(item)} height={600}  width={800}
                    title={<Typography.Text>{item.label}</Typography.Text>}
                >
                        <div style={{margin: "0px 20px 0px 20px"}}>
                            <Typography.Title level={5} style={{marginTop: 10}}>{item.label}</Typography.Title>
                            {item.outlet}
                        </div>
                </Modal>
            })}
        </div>
    );
}