import { useState } from 'react'
import { Button, Drawer, Typography, Switch, Space, Tabs ,theme} from "antd"
import { 
    SkinOutlined,
    SunOutlined,
    MoonOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { themeConfigSlice } from '../../../redux/CommonSlice';
import { ThemeSettingComponent, BackgroundSettingComponent } from './index';
import { useTranslation } from '../../../components/index';
import { AdminSkinSetting } from '../../../common/I18NNamespace';

/**
 * 
 * @returns 皮肤设置
 */
export const SkinSettingComponent : React.FC = () => {
    
    const { t } = useTranslation(AdminSkinSetting);
    const [open, setOpen] = useState(false);
    const isMinScreen = useSelector(state => state.globalVar.isMinScreen);
    const dispatch = useDispatch();
    const sideThemeType = useSelector(state => state.themeConfig.sideTheme);
   
    const onChangeSideTheme = (checked: boolean, event) => {
        dispatch(themeConfigSlice.actions.changeSideTheme(checked?'light':'dark'))
    }

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const themeSettingItems: TabsProps['items'] = [
        {
            key: '1',
            label: t('主题'),
            children: <ThemeSettingComponent />,
        },
        {
            key: '2',
            label: t('侧边栏'),
            children: <>
                <Typography.Title level={5}>{t('侧边栏')}</Typography.Title>
                <Space align="center">
                    {t('暗色')}
                    <Switch
                        checkedChildren={<SunOutlined />}
                        unCheckedChildren={<MoonOutlined />}
                        defaultChecked = {sideThemeType == 'light'}
                        onChange={onChangeSideTheme}
                    />
                    {t('亮色')}
                </Space>
            </>,
        },
        {
            key: '3',
            label: '背景',
            children: <BackgroundSettingComponent />,
        },
    ];


    return <>
        <Button icon={<SkinOutlined />} type='text' style={{
                paddingLeft: 5,
                paddingRight: 5,
                marginLeft: 5,
                marginRight: 5
            }}
            onClick={showDrawer}
        ></Button>
        <Drawer title={t('设置')} onClose={onClose} open={open} width={isMinScreen?"100%": "378px"} >
            <Tabs defaultActiveKey="1" items={themeSettingItems} 
                tabPosition='left'
                style={{
                    height: "100%"
                }}
            />
        </Drawer>
    </>
}
