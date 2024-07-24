

import { Tabs, TabsProps, GetProp  } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSelector, useDispatch } from '../../redux/hooks';
import { TabItemsSlice, ActiveTabSlice, openItemSlice } from "../../redux/slice";
import { IconFont } from '../../components';
import { TabIcon } from './TabIcon';


type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
    'data-node-key': string;
}

export type TabItemType = GetProp<TabsProps,  'items'>[number];
export type TabKeyType = GetProp<TabItemType,  'key'>;

/**
 * 主页菜单顶部tab
 * @returns 
 */
export const HeadTabComponent : React.FC = () => {
    const dispatch = useDispatch();
    const currActiveKey = useSelector(sate => sate.activeTabKey.value);
  
    const items = useSelector(state => state.tabItems.items)
    const [tabItems, setTabItems] = useState<TabItemType[]>([]);

    // const menus = useSelector(state => state.myMenus.menus);
    // const [menus, setMenus] = useState([]);

    //items变化，更新tab显示
    useEffect(()=>{
        // console.log("items change", items);
        let newTabItems = [];  //
        items.forEach((item, index) => {
            let existTab = tabItems.find(i => i.key == item.key);
            if(existTab){
                newTabItems.push(existTab);
            }else{
                newTabItems.push({
                    key: item.key,
                    icon: <TabIcon tabKey={item.key} icon={item.icon}></TabIcon>,
                    label: item.label
                });
            }
        });
        setTabItems(newTabItems);
    }, [items])

    //tab拖拽结束
    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            const activeIndex = items?.findIndex((i) => i.key === active.id);
            const overIndex = items?.findIndex((i) => i.key === over?.id);
            let newItems = arrayMove(tabItems, activeIndex, overIndex);
            setTabItems(newItems);
        }
    };

     //tab关闭，删除tab，改变激活的tab, 同时激活tab对应的面板
    const onTabEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
        // console.log("on tab edit");
        if(action === 'add') return;
        if(items.length == 1) return;

        let item = items.find(i => i.key == targetKey);
        removeTabItem(item);
    }

    //删除tab
    const removeTabItem = (item) => {
        
        if(!item) return;

        let index = items.indexOf(item);

        // console.log(items, tabItems); 

        // let index = tabItems.findIndex(item => item.key == targetKey);
        if(index == -1) return;

        let newIndex = index;
        if(newIndex == tabItems.length - 1){
            newIndex = index - 1;
        }

        // console.log(index, newIndex, item); 
 
        // let item = tabItems[index];
        let newTabItems = tabItems.filter(s => s.key !== item.key);
        setTabItems(newTabItems);

        let newItems = items.filter(s => s.key !== item.key);

        console.log(newTabItems, newItems, item);

        // setItems(newItems);
        dispatch(TabItemsSlice.actions.setItems(newItems));
        dispatch(ActiveTabSlice.actions.activeKey(items[newIndex].path));
    }


    //tab激活改变
    const onTabClick = (activeKey: string, event) => {

        let item = items.find(s => s.key == activeKey);
        if(!item) return ;

       
        if(activeKey == currActiveKey &&  event.target.closest(".tab-icon")){
            dispatch(openItemSlice.actions.open(item)); 
        }else{
            dispatch(ActiveTabSlice.actions.activeKey(activeKey))
        }
       
    }

    //启用tab拖拽
    const DraggableTabNode = ({ className, ...props }: DraggableTabPaneProps) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
            id: props['data-node-key'],
        });
      
        const style: React.CSSProperties = {
            ...props.style,
            transform: CSS.Translate.toString(transform),
            transition,
            // cursor: 'move',
        };
      
        return React.cloneElement(props.children as React.ReactElement, {
            ref: setNodeRef,
            style,
            ...attributes,
            ...listeners,
        });
    };
    const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } });

    return  <Tabs type="editable-card" hideAdd
            defaultActiveKey={currActiveKey} activeKey={currActiveKey} 
            items={tabItems} 
            onTabClick={onTabClick} 
            onEdit={onTabEdit}
            renderTabBar={(tabBarProps, DefaultTabBar) => (
                <DndContext sensors={[sensor]} onDragEnd={onDragEnd} >
                    <SortableContext items={tabItems.map((i) => i.key)} strategy={horizontalListSortingStrategy}>
                        <DefaultTabBar {...tabBarProps}>
                        {(node) => (
                            <DraggableTabNode {...node.props} key={node.key}>
                            {node}
                            </DraggableTabNode>
                        )}
                        </DefaultTabBar>
                    </SortableContext>
                </DndContext>
            )}
        />
}
