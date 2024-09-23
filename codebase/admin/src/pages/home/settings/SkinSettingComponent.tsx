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

import { useState } from 'react'
import { Button, Drawer, Tabs } from "antd"
import { 
    SkinOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { ThemeSettingComponent, BackgroundSettingComponent, SidebarSettingComponent } from './index';
import { useTranslation, useSelector } from '../../../hooks';
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
