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


import React, {useState, useEffect, useMemo} from 'react';
import { 
    UserOutlined,
    TranslationOutlined, 
    MenuUnfoldOutlined,
    MenuFoldOutlined
} from '@ant-design/icons';
import i18next from 'i18next';
import { Avatar, Space, Dropdown, Button, theme } from 'antd';
import type { MenuProps } from 'antd';
import { api } from '../../common/api'
import { useDispatch, useRequest, useSelector } from '../../hooks';
import { jwtTokenSlice, persistedUserSlice, themeConfigSlice } from '../../redux/slice';
import {HeadTabComponent, SkinSettingComponent} from './index';
import { UserEdit } from '../sys/user';
import { useNavigate } from 'react-router-dom';


/**
 * 
 * @returns 主页面的顶部布局
 */
export const HomeHeader : React.FC = () => {

    const request = useRequest();
    const navigate = useNavigate();
    const user = useSelector(state => state.persistedUser);
    const { token } = theme.useToken();
    
    const [lngLabel, setLngLabel] = useState('简体中文');
    const lng = useSelector(state => state.themeConfig.lng);
    
    const collapsed = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const dispatch = useDispatch();

    const changeCollapsed = (collapsed: boolean) => {
        dispatch(themeConfigSlice.actions.changeSidemenuCollapsed(collapsed));
    }

    const [items, setItems] = useState<MenuProps['items']>();
    // useMemo(()=>{
    //     return [
    //         {
    //           key: "zh_CN",
    //           label: "简体中文",
    //         },
    //         {
    //           key: "zh_TW",
    //           label: "繁体中文",
    //         },
    //         {
    //           key: "en",
    //           label: "English",
              
    //         }
    //     ];
    // }, []);

    const ctrls: MenuProps['items'] = useMemo(()=>{
        return [
            {
              key: "1",
              label: "个人信息",
            },
            {
              key: "2",
              label: "退出登录",
            }
        ];
    }, []);

    const getLangs = async () => {
        try{
            let result =await request.get(api.lang.langs);
            if(result){
                let langs = result.data.map(lang => ({key: lang.code, label: lang.label}));
                setItems(langs);
                let item = langs.find(item => item.key == lng);
                if(item) {
                    setLngLabel(item['label']);
                }
            }
        }catch(err){
            console.error((err as any).message);
        }
    }

    const [openUserProfile, setOpenUserProfile] = useState<boolean>(false);
    const onEditClose = () => {
        setOpenUserProfile(false)
    }
    const [userProfile, setUserProfile] = useState<any>();

    const getUserProfile = async (userId) => {
        let result = await request.get(api.user.get+"?id="+userId);
        if(result.status){
            setUserProfile(result.data)
            setOpenUserProfile(true);
        }
    }

    useEffect(()=>{
        getLangs();
    }, []);

    const dropdownItemClickHandler : MenuProps['onClick'] = ({ key }) => {
        
        let item = items.find(item => item.key == key);

        dispatch(themeConfigSlice.actions.changeLng(key));
        i18next.changeLanguage(key);
        setLngLabel(item['label']);
    }

    const ctrlItemClickHandler : MenuProps['onClick'] = ({ key }) => {
        if( key == '1'){
            getUserProfile(user.id);
        }else if(key == '2'){
            dispatch(persistedUserSlice.actions.persist({}));
            dispatch(jwtTokenSlice.actions.persist(""));
            //因为本客户端采用的jwttoken，所以jwttoken不可能过期，只能丢弃
            //httpOnly=true无法删除，所以后台setCookie的时候，不需要设置httpOnly,
            document.cookie = "jwtToken" + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            navigate(api.loginPage);
        }
    }

    return <>
        <div className="xm-header-wrap">
            <div className="xm-top">
                <div className="home-header-left">
                    <Button type="text" className='collapsed-btn' 
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => changeCollapsed(!collapsed)}
                        style={{marginLeft: 10}}
                    />
                </div>    
                <div className="home-header-right">
                    <Dropdown menu={{ items, onClick: dropdownItemClickHandler }} >
                        <Space>
                            <Button type='text' icon={<TranslationOutlined />} 
                            style={{
                                paddingLeft: 5,
                                paddingRight: 5,
                                marginLeft: 5,
                                marginRight: 5
                            }}    
                        >{lngLabel}</Button>
                        </Space>
                    </Dropdown>
                    <SkinSettingComponent />
                    <Dropdown menu={{ items: ctrls, onClick: ctrlItemClickHandler }}>
                        <Space>
                            <Button type='text' icon={ 
                                    user?.photo ? 
                                    <Avatar style={{background: token.colorPrimary}} src={api.document.img+"?id"+user.photo} size="small" /> 
                                    : <Avatar style={{background: token.colorPrimary}} size="small" icon={<UserOutlined />}/>
                                }
                                style={{
                                    paddingLeft: 5,
                                    paddingRight: 5,
                                    marginLeft: 5,
                                    marginRight: 5,
                                    color: token.colorPrimary
                                }}
                            >
                                    {user?.fullname}
                            </Button>
                        </Space>
                       
                    </Dropdown>
                    
                </div>
            </div>
            <div className="xm-tab" >
                <HeadTabComponent />
            </div>
        </div>
        {openUserProfile && <UserEdit open={openUserProfile} onClose={onEditClose} user={userProfile} />}
    </>
}