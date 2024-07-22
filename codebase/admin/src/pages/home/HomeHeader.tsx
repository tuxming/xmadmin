
import React, {useState, useEffect} from 'react';
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
import { useDispatch, useSelector } from '../../redux/hooks';
import { themeConfigSlice } from '../../redux/slice';
import {HeadTabComponent, SkinSettingComponent} from './index';

/**
 * 
 * @returns 主页面的顶部布局
 */
export const HomeHeader : React.FC = () => {

    const user = useSelector(state => state.persistedUser);
    const { token } = theme.useToken();
    
    const [lngLabel, setLngLabel] = useState('简体中文');
    const lng = useSelector(state => state.themeConfig.lng);
    
    const collapsed = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const dispatch = useDispatch();

    const changeCollapsed = (collapsed: boolean) => {
        dispatch(themeConfigSlice.actions.changeSidemenuCollapsed(collapsed));
    }

    const items: MenuProps['items'] = [
        {
          key: "zh_CN",
          label: "简体中文",
        },
        {
          key: "zh_TW",
          label: "繁体中文",
        },
        {
          key: "en",
          label: "English",
          
        }
    ];

    useEffect(()=>{

        let item = items.find(item => item.key == lng);
        if(item) {
            setLngLabel(item['label']);
        }

    }, []);

    const dropdownItemClickHandler : MenuProps['onClick'] = ({ key }) => {
        
        let item = items.find(item => item.key == key);

        dispatch(themeConfigSlice.actions.changeLng(key));
        i18next.changeLanguage(key);
        setLngLabel(item['label']);
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
                    <Dropdown menu={{ items }}>
                        <Space>
                            <Button type='text' icon={ 
                                    user?.photo ? 
                                    <Avatar style={{background: token.colorPrimary}} src={api.doc.img+"?id"+user.photo} size="small" /> 
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
    </>
}