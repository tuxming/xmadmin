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

import { useContext, useEffect, useState } from "react";
import { AdminDept, DefaultNS } from "../../../common/I18NNamespace";
import { TableColumnType, ModalContext, TableComponent, useLayer } from "../../../components";
import { useTranslation, useRequest } from "../../../hooks";
import { computePx } from "../../../common/kit";
import { api } from "../../../common/api";
import { LoadingOutlined, MinusSquareTwoTone, PlusSquareTwoTone } from "@ant-design/icons";
import { DeptTypeTag } from "./index";


export type DeptListType = {
    query: any,
    onSelect: (rows: any[]) => void,
    needUpdateId?: any,
    onChildUpdated?: (children: any[]) => void
}


/**
 * 角色列表组件
 * @returns 
 */
export const DeptList : React.FC<DeptListType> = ({
    query,
    onSelect,
    needUpdateId,
    onChildUpdated
}) => {
    const {t} = useTranslation(AdminDept);
    const request = useRequest();
    const {message} = useLayer();
    const [updateChildren, setUpdateChildren] = useState({
        data: null,
        parentId: null
    });
    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>();
    
    const columns : TableColumnType[]= [
        {
            title: t('名称'),
            key: 'name',
            sort: true,
            ellipsis: true,
            width: 300,
            align: 'left',
            render(text, record, index) {
                return <>{record.name+ (record.total? ("("+record.total+")") : "")}</>
            },
        },
        {
            title: t('ID'),
            key: 'id',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 100
        },
        {
            title: t('类型'),
            key: 'type',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200,
            render(text, record, index) {
                return <DeptTypeTag>{text}</DeptTypeTag>
            },
        },
        {
            title: t('路径'),
            key: 'path',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200,
            align: 'left'
        },
        {
            title: t('路径名'),
            key: 'pathName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200,
            align: 'left'
        },
    ];

    //当组件使用窗口话的时候，获取窗口的位置信息，设置到表格
    const modalPos = useContext(ModalContext);
    const [pos, setPos] = useState({
        width: null, 
        height: null,
    });

    useEffect(()=> {
        if(modalPos && modalPos.width && modalPos.height){
            let npos = {
                width: computePx(modalPos.width),
                height: computePx(modalPos.height, true) - 350
            };
            // console.log(modalPos, npos);
            setPos(npos)
        }

    }, [modalPos]);
    
    useEffect(()=>{
        let get = async () => {
            let result = await request.post(
                api.dept.list,
                {parentId: needUpdateId}
            );

            if(result.status){
                setUpdateChildren({
                    parentId: needUpdateId,
                    data: result.data.list
                });
                if(onChildUpdated){
                    onChildUpdated(result.data.list);
                }
                setSelectedRowKeys([]);
            }
        }

        if(needUpdateId){
            get();
        }
    }, [needUpdateId])

    //获取数据
    const getChildren = (record, setData) => {
        let post = async () => {
            setLoadingMap((prev) => ({ ...prev, [record.id]: false }));
            let result = await request.post(
                api.dept.list,
                {parentId: record.id}
            );
                
            if(result.status){
                record.children = result.data.list;
                record.hasChildren = false;
                setData((prev) => {

                    return [...prev]
                });
            }
        }
       
        post();
    }

    const onTableSelectChange =  (selectedRows: any[]) => {
        onSelect(selectedRows);
        setSelectedRowKeys(selectedRows.map(row => row.id));
    }

    const [loadingMap, setLoadingMap] = useState({});

    return <TableComponent pageSize={20} query={query} apiUrl={api.dept.list} 
        width={pos?.width} height={pos?.height} 
        onSelect={onTableSelectChange}
        columns={columns}
        rowSelection={{
            selectedRowKeys: selectedRowKeys
        }}
        updateChildren={updateChildren}
        selectType="radio"
        expandable={{
            expandIcon: ({ record, expanded, expandable, onExpand }) => {
                if (loadingMap[record.key]) {
                    return <LoadingOutlined style={{ marginRight: 8 }} />;
                }
                if (!expandable) {
                        return null;
                }
                const Icon = expanded ? MinusSquareTwoTone : PlusSquareTwoTone;
                return (
                    <Icon 
                        onClick={(e) => onExpand(record, e)}
                        style={{ marginRight: 8 }}
                    />
                );
            },
        }}

        onTreeExpand={(expand, record, setData) => {
           
            if (expand) {
                // let index = expandKeys.indexOf(record.id);
                // if(index == -1){
                //     setExpandKeys([...expandKeys, record.id]);
                // }
                // if (record.hasChildren) 也可以
                if (record.hasChildren){
                    setLoadingMap((prev) => ({ ...prev, [record.id]: true }));
                    getChildren(record, setData);
                }
            }
            // else{
            //     let index = expandKeys.indexOf(record.id);
            //     if(index > -1){
            //         setExpandKeys(expandKeys.filter(k => k !==  record.id));
            //     }
            // }
        }}
    />
}

