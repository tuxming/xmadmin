import { useEffect, useState } from "react";
import { DoubleColumnLayout, IconFont, useRequest } from "../../components";
import { useSelector } from "../../redux/hooks";
import { Tree, App } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';
import { api } from "../../common/api";

/**
 * 菜单管理
 * @returns 
 */
export const MenuPage : React.FC = () => {

    const screenWidth = useSelector(state => state.globalVar.width);
    const sidemenuCollapsed = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const sideWidth = useSelector(state => state.themeConfig.sideWidth);
    const request = useRequest();
    const {message} = App.useApp();

    const [containerWidth, setContainerWidth] = useState<number>();
    const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

    const getMenus = (key) => {
        let get = async () => {
            try{
                let result = await request.get(api.menu.list+"?id="+key);
                if(result.data && result.data.length > 0){
                    setTreeData((origin) =>
                        updateTreeData(origin, key, convertToTreeNode(result.data)),
                    );
                }else{
                    message.warning("无数据");
                }
            }catch(e){
                let err = e as any;
                message.error(err.message);
           }

        }
        get();
    }

    const onLoadData = ({ key, children }: any) =>{
        return new Promise<void>((resolve) => {
            if (children) {
                resolve();
                return;
            }
            getMenus(key);
            resolve();
        });
    }
       


    const convertToTreeNode = (menus) => {
        return menus.map(menu => {

            return {
                title: menu.name,
                key: menu.id,
                isLeaf: menu.type === 1,
                icon: <IconFont fontClass={menu.icon} />
            }
        });
    }

    const updateTreeData = (list: TreeDataNode[], key: React.Key, children: TreeDataNode[]): TreeDataNode[] => {
        return  !list || list.length == 0 ? children : list.map((node) => {
            if (node.key === key) {
                return {
                    ...node,
                    children,
                };
            }
            if (node.children) {
                return {
                    ...node,
                    children: updateTreeData(node.children, key, children),
                };
            }
            return node;
        });
    }

    useEffect(()=>{
        getMenus(0);
    }, [])

    useEffect(() => {

        setContainerWidth(
            sidemenuCollapsed ? screenWidth - 50 -50 : screenWidth - sideWidth - 50
        );

    }, [screenWidth, sideWidth, sidemenuCollapsed]);
    

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    const leftDom = <>
        <Tree style={{textAlign: 'left'}} loadData={onLoadData} treeData={treeData}  onSelect={onSelect}
            blockNode showLine showIcon 
        />
    </>
    const rightDom = <>22</>

    return <DoubleColumnLayout width={containerWidth} leftWidth={200} left={leftDom} right={rightDom} />
}