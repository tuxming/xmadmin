import React, { useEffect, useRef, useState } from 'react';
import type { GetProp, TreeSelectProps } from 'antd';
import { Button, TreeSelect, Typography } from 'antd';
import { useRequest } from '../../../components';
import { api } from '../../../common/api';
import { ArrowsAltOutlined } from '@ant-design/icons';

const fieldNames = {
    label: "name", 
    value: "id", 
    children: "children",
}

/**
 * 组织节点下拉选择框，使用方法参考DeptEdit
 * @param props 
 * @returns 
 */
export const DeptSelector : React.FC<TreeSelectProps> = (props) => {

    const request = useRequest();
    const [treeData, setTreeData] = useState<any[]>();

    const [scale, setScale] = useState(false);
    const [style, setStyle] = useState<{[key: string]: any}>({
        maxHeight: 400, 
        overflow: 'auto'
    });

    const loadKeys = useRef([]);

    const onLoadData = (node) => {
        
        // console.log(JSON.stringify(node));
        if(loadKeys.current.indexOf(node?.id)>-1){
            return new Promise(resolve => resolve(undefined));
        }

        loadKeys.current.push(node?.id);

        return new Promise((resolve) => {
            const fetchTree = async () => {
                let result = await request.post(api.dept.list, {parentId: node?node.id: null});
                if(result.status){
                    result.data.list.forEach(s => s.name = s.id +"-" + s.name)
                    if(!node){
                        setTreeData(result.data.list);
                    }else{
                        setTreeData((origin) =>
                            updateTreeData(origin, node.id, result.data.list),
                        );
                    }

                    resolve(undefined);
                }
            }

            fetchTree();
        });
    }

    //构建菜单的父子关系
    const updateTreeData = (list, key, children) => {
        return  !list || list.length == 0 ? children : list.map((node) => {
            if (node.id === key) {
                // console.log(node.id, key);
                return {
                    ...node,
                    children,
                };
            }
            if (node.children && node.children.length>0) {
                return {
                    ...node,
                    children: updateTreeData(node.children, key, children),
                };
            }
            return node;
        });
    }

    const onScale = () => {
        if(scale){
            setStyle({ maxHeight: 400, overflow: 'auto'});
        }else{
            setStyle({ maxHeight: 600, overflow: 'auto', width: 600});
        }
        setScale(!scale);
    }

    useEffect(()=>{
        onLoadData(null);
    }, [])

    return (
        <TreeSelect
            fieldNames={fieldNames}
            treeLine
            treeNodeLabelProp="pathName"
            style={{ width: '100%' }}
            dropdownStyle={style}
            loadData={onLoadData}
            treeData={treeData}
            dropdownRender = {(originNode) => {
                return <div style={{position: 'relative'}}>
                    <Button size='small' icon={<ArrowsAltOutlined /> }  onClick={onScale}
                        style={{position: 'absolute', right: 15, top: 5, zIndex: 10000}}
                    ></Button>
                    {originNode}
                </div>
            }}
            {...props}
        />
      );
}

/**
 * 作为form Item的子节点必须要能实现onChange接口，还要能提供value的传入接口
 * @returns 
 */
export const DeptSelectorWraper : React.FC<{
    showName?: string,
    wrapStyle?: {[key:string]: any}
    showNamePos?: {
        bottom?: number, 
        left?: number,
        right?: number,
        top?: number,
    }
} & TreeSelectProps>= ({
    showName,
    wrapStyle,
    showNamePos,
    ...props
}) => {

    const [showLabel, setShowLabel] = useState<string>(showName);
    const deptOnSelect = (value, node) => {
        // console.log(value, node);
        if(node){
            setShowLabel(null);
        }
        if(props.onSelect){ 
            props.onSelect(value, node);
        }
    }

    return (
        <span style={{...wrapStyle, position: 'relative'}}>
            <DeptSelector 
                {...props}
                className={'dept-selector '+(showLabel? 'hide-item': "")+(props.className?props.className:"")}
                onSelect={deptOnSelect}
            ></DeptSelector>
            {showLabel && <Typography.Text 
                style={{position: 'absolute', bottom: -1, left: 10, pointerEvents: 'none', ...showNamePos}}
            >{showLabel || ''}</Typography.Text>}
        </span>
    )
}