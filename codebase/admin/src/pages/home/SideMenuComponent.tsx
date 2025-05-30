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

import { Menu } from 'antd';
import { ActiveTabSlice, TabItemsSlice, currMenus } from "../../redux/slice";
import { IconFont} from '../../components';
import { useDispatch, useSelector } from '../../hooks';
import { useEffect, useState } from 'react';


export type SideMenuComponentType = {
    collapsed: boolean
}

/**
 * 
 * @returns 左侧菜单
 */
export const SideMenuComponent : React.FC<SideMenuComponentType> = ({collapsed}) => {

    const tabItems = useSelector(state => state.tabItems.items)
    const menus = useSelector(state => state.myMenus.menus);
    const treeMenu = useSelector(state => state.myMenus.treeMenu);
    // const [menus, setMenus] = useState([]);
    const dispatch = useDispatch();
    const activeKey = useSelector(state => state.activeTabKey);
    const menuTheme = useSelector(state => state.themeConfig.sideTheme);
    const [openKeys, setOpenKeys] = useState<string[]>([]);

    //加载菜单
    useEffect(()=>{
        dispatch(currMenus());
    }, []);

    const getOpenKeys = (menu, keys: string[]) => {
        let parentId = menu.parentId;
        if(parentId && parentId>1){
            keys.push(parentId+"");
            let parentMenu = menus.find(m => m.id == parentId);
            if(parentMenu){
                getOpenKeys(parentMenu, keys);
            }
        }
    }

    //将菜单和tab, router关联起来
    useEffect(()=>{
        let pathname = location.pathname;
        let menu = menus.find(s => s.path == pathname);
        if(!menu){
            return;
        }

        let tabItem = tabItems.find(s => s.key == menu.path);
        if(!tabItem){
            tabItem = {
                key: menu.path+"", 
                icon: menu.icon, 
                label: menu.name,
                path: menu.path
            };
            dispatch(TabItemsSlice.actions.addItem(tabItem));
        }

        dispatch(ActiveTabSlice.actions.activeKey(tabItem.path+""));

        let keys = [];
        getOpenKeys(menu, keys);
        // console.log(keys);
        setOpenKeys(keys);

    }, [menus])

    //选择菜单事件
    //function({ item, key, keyPath, selectedKeys, domEvent })
    const onMenuSelect = (selectInfo:any) => {
        let item = menus.find(s => s.path == selectInfo.key);
        // console.log(item);
        let menu = item as any;
        if(!item) return;

        //跳转到指定的路由
        // navigate(menu.path);
        dispatch(ActiveTabSlice.actions.activeKey(menu.path))
        if(tabItems.findIndex(s => s.key == menu.path ) > -1){
            return;
        }

        //设置到tab
        dispatch(TabItemsSlice.actions.addItem({
                key: item.path+"", 
                icon: menu.icon, 
                label: menu.name,
                path: menu.path
            }
        ));
    }

    const buildItem = (menus) => {
        // console.log(treeMenu);
        if(!menus){
            return [];
        }
        return menus.map((menu)=> ({
            key: menu.children && menu.children.length>0 ? menu.id+"": menu.path+"", 
            label: menu.name, 
            icon: <IconFont fontClass={menu.icon} />,
            children: menu.children && menu.children.length>0? buildItem(menu.children): null
        }));
    };

    const onOpen = (keys) => {
        // console.log(keys);
        setOpenKeys(keys);
    }

    return <>
        <Menu theme={menuTheme} mode="inline"
            // inlineCollapsed={collapsed}
            // className={collapsed?'collapsed-menu':''}
            // selectedKeys={menuActiveKey}
            onOpenChange={onOpen}
            openKeys={openKeys}
            selectedKeys={[activeKey.value]}
            onSelect={onMenuSelect}
            items={buildItem(treeMenu)}
        >
        </Menu>
    </>
}