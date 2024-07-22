import { Menu } from 'antd';
import { useSelector, useDispatch } from '../../redux/hooks';
import { ActiveTabSlice, TabItemsSlice, currMenus } from "../../redux/slice";
import { IconFont } from '../../components';
import { useEffect } from 'react';


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
    // const [menus, setMenus] = useState([]);
    const dispatch = useDispatch();
    const activeKey = useSelector(state => state.activeTabKey);
    const menuTheme = useSelector(state => state.themeConfig.sideTheme);

    useEffect(()=>{
        dispatch(currMenus());
    }, []);

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

        dispatch(ActiveTabSlice.actions.activeKey(tabItem.path+""))

    }, [menus])

    //选择菜单事件
    //function({ item, key, keyPath, selectedKeys, domEvent })
    const onMenuSelect = (selectInfo:any) => {
        let item = menus.find(s => s.path == selectInfo.key);
        // console.log(typeof item);
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
        ))
    }

    return <>
        <Menu theme={menuTheme} mode="inline"
            className={collapsed?'collapsed-menu':''}
            // selectedKeys={menuActiveKey}
            // defaultOpenKeys={menuActiveKey}
            selectedKeys={[activeKey.value]}
            onSelect={onMenuSelect}
            items={menus.map(menu => {
                return {
                    key: menu.path+"", 
                    label: menu.name, 
                    icon: <IconFont fontClass={menu.icon} />
                } 
            })}
        >
        </Menu>
    </>
}