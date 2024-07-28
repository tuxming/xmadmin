import { useState } from 'react'
import { Button, Drawer, Tabs } from "antd"
import { 
    SkinOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { useSelector } from '../../../redux/hooks';
import { ThemeSettingComponent, BackgroundSettingComponent, SidebarSettingComponent } from './index';
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
            children: <SidebarSettingComponent />
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
