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


import React, {useEffect, useRef, useState} from 'react';
import { Table, Tooltip} from 'antd';
import type { TableProps } from 'antd';
import { useLayer, TableType } from '../../components';
import {  useRequest, useTranslation, useSelector } from '../../hooks';
import { DefaultNS } from '../../common/I18NNamespace';
import type { ResizeCallbackData } from 'react-resizable';
import { Resizable } from 'react-resizable';
import { useShowResult } from '../../hooks/useShowResult';

const columnSort = (a, b) => {

    if(!a){
        if(b){
            return 1;
        }else{
            return 0;
        }
    }

    if(!b){
        if(a){
            return -1
        }else{
            return 0;
        }
    }
   
    if(typeof a === 'string' || typeof b === 'string'){
        return a.localeCompare(b)
    }else{
        return a-b>0?1:-1;
    }
}

const ResizableTitle = (
    props: React.HTMLAttributes<any> & {
        onResize: (e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => void;
        width: number;
    },
) => {
    const { onResize, width, ...restProps } = props;
    
    if (!width) {
        return <th {...restProps} />;
    }
    
    return (
        <Resizable width={width} height={0}
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
            handle={
                <span className="react-resizable-handle"
                    onClick={(e) => {e.stopPropagation();}}
                />
            }
        >
            <th {...restProps} />
        </Resizable>
    );
  };

  /**
 * 表格组件封装，这个表格可以自己传入宽高，如果自己没有传入宽高，则将自适应于页面组件的宽高
 * @returns 
 */
const InternalTable : React.FC<TableType> = ({
    columns,
    pageSize,
    query,
    apiUrl,
    onSelect,
    width, 
    height,
    refresh= {
        reset: false,
        tag: 1
    },
    onTreeExpand, 
    selectType = 'checkbox',
    updateChildren,
    initLoad = true,
    onDataLoaded,
    ...props
}) => {
    const {t} = useTranslation();
    const request = useRequest();
    const { message } = useLayer();
    const tableWrapRef = useRef(null);
    const tableRef = useRef(null);
    const isSetedThumbColor = useRef(false);

    const [tableHeight, setTableHeight] = useState<number | string>(0);
    const [tableWidth, setTableWidth] = useState<number | string>(0);
    const screenHeight = useSelector(state => state.globalVar.height);
    const screenWidth = useSelector(state => state.globalVar.width);
    const minScreen = useSelector(state => state.globalVar.isMinScreen);
    const sidemenuCollapsed = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const size = useSelector(state => state.themeConfig.componentSize);
    const themeType = useSelector(state => state.themeConfig.theme);
    const showResult = useShowResult(DefaultNS);

    const firstLoad = useRef(initLoad); 

    const [loading, setLoading] = useState(false);

    const [data, setData] = useState<any[]>();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: pageSize,
        total: 0,
        simple: false,
        pageSizeOptions: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>(props.rowSelection?.selectedRowKeys || []);
    
    const [prevQuery, setPrevQuery] = useState<any>(query);
    const [prevSize, setPrevSize] = useState<number>(pagination.pageSize)
    const [prevCurrent, setPrevCurrent] = useState<number>(pagination.current)
    const [prevTag, setPrevTag] = useState<number>(refresh.tag)

    const handleResize = (index: number) => (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
        const newColumns = [...tableColumns];
        newColumns[index] = {
            ...newColumns[index],
            width: size.width,
        };
        setTableColumns(newColumns);
    };

    //构建表格列
    const [tableColumns, setTableColumns] = useState<any>(columns.map((col, index) => {

        let item =  {
            title: col.title,
            dataIndex: col.key,
            key: col.key,
            align: col.align || 'center',
            fixed: col.fixed || false,
            onHeaderCell: (column) => ({
                width: column.width,
                onResize: handleResize(index) as React.ReactEventHandler<any>,
            }),
        };

        if(col.width){
            item["width"] = col.width;
        }

        //filter
        if(col.filter){
            item['filterSearch'] = true;
            item['onFilter'] = (value, record) => record[col.key].indexOf(value as string)>-1;
        }

        //sort
        if(col.sort){
            item['showSorterTooltip'] = { target: 'sorter-icon' };
            item['sortDirections'] = ['ascend', 'descend'];
            item['sorter'] = (a, b) => columnSort(a[col.key], b[col.key]);
        }

        //ellipsis
        if(col.ellipsis){
            item['ellipsis'] = {showTitle: true}
        }

        //render
        if(col.render){
            if(col.ellipsis){
                item['render'] = (text, record, index) => {
                    let Elem =  col.render(text, record, index);
                    return (<Tooltip title={text}>{Elem}</Tooltip>)
                }
            }else{
                item['render'] = (text, record, index) => {
                    return col.render(text, record, index);
                }
            }
        }else if(col.ellipsis){
            item['render'] = (text, record, index) => {
                return (<Tooltip title={text}>{text}</Tooltip>)
            }
        }

        return {...col, ...item};
    }));

    //获取数据
    const fetchData = () => {
        setLoading(true);

        let post = async () => {
            let result = await request.post(
                apiUrl,
                {...query, 
                    start: (pagination.current-1) * pagination.pageSize,
                    length: pagination.pageSize
                }
            );

            setLoading(false);

            showResult.show(result);
            // setData([]);
            if(result.status){
                setSelectedRowKeys([]);
                setData(result.data.list);
                setPagination({
                    ...pagination,
                    total: result.data.total || pagination.total
                });
                if(onDataLoaded){
                    onDataLoaded(result.data.list);
                }
            }
        }
       
        post();
    }

    useEffect(()=>{
        //防止多次加载，
        if(firstLoad.current){
            return;
        }

        //这里判断，判断query对象不一样，
        if(prevQuery == null || query != prevQuery){
            setPrevQuery(query);
            //说明存在新的搜索内容，将current=1,
            if(JSON.stringify(query) != JSON.stringify(prevQuery)){
                if(pagination.current == 1){
                    fetchData();
                }else{
                    // console.log("query");
                    setPagination({
                        ...pagination,
                        current: 1
                    });
                }
            }else{
                //搜索条件不变说明强制刷新当前页
                fetchData();
            }
        }else if(prevTag!==refresh.tag){
            //防止调用端多次不正常刷新导致多次执行，所以这里需要判断每一次的刷新是否真正的改变了tag而需要真正的刷新

            setPrevTag(refresh.tag);
            if(refresh.reset){
                //这里设置为1的时候，会再次触发effect，进入第三个条件判断里面去，
                //所以这里把pervCurrent和current设置一样，使得第三个条件判断不成立
                setPrevCurrent(1); 
                setPagination({
                    ...pagination,
                    current: 1
                });
            }
            fetchData();
        }else if((prevCurrent && prevCurrent != pagination.current) 
            || (prevSize && prevSize != pagination.pageSize)){
                //防止调用端多次不正常刷新导致多次执行，
                //这里需要判断每一次执行是否真正改变了size,current
                fetchData();
        }
      
    }, [
        pagination?.current,
        pagination?.pageSize,
        query,
        refresh.tag
    ]); 

    
    useEffect(() => {

        //防止多次初始化加载，这里只执行一次
        if(firstLoad.current){
            firstLoad.current = false;
            fetchData();
        }
    }, [])

    //构建菜单的父子关系
    const updateChildrenData = (list, key, children) => {
        console.log("do update children data", children);
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
                    children: updateChildrenData(node.children, key, children),
                };
            }
            return node;
        });
    }

    /**
     * 更新指定的节点数据
     */
    useEffect(()=>{
        if(updateChildren && updateChildren.parentId){
            setData((origin) =>
                updateChildrenData(origin, updateChildren.parentId, updateChildren.data),
            );
        }

    }, [updateChildren]);

    //设置过滤列表
    useEffect(() => {
        if(!data || data.length == 0) return;
        
        let items = [...tableColumns];
        for(let i=0; i<columns.length; i++){
            let col = columns[i];
            if(!col.filter) continue;

            let key = col.key;
            let colVals = data.map(row => row[key]);
            let valSet = new Set(colVals);

            let item = items.find(tc => tc.key == key);
            item['filters'] = Array.from(valSet).map(s => {
                return {
                    text: s,
                    value: s
                }
            })
        }

        setTableColumns(items);

    },[data]);

    //设置表格宽高, 如果传入了宽高就使用传入的宽高，
    //如果没有传入宽高，则默认页面级别的table来自动计算宽高
    useEffect(()=>{
        //设置表格高度，但是这个表格高度，不包含表格的表头高度，和下方的分页的高度， 所以需要减去这个高度
        if(!tableWrapRef.current){
            return;
        }
        // console.log(tableWrapRef.current);
        let top = tableWrapRef.current.offsetTop;
        let theight = height || screenHeight 
            - top //距离顶部的位置
            - 64  //表头的高度
            - 64  //分页高度
            - 55; //页脚高度

        // console.log("tableHeight", theight);
        setTableHeight(theight);

        //设置表格宽度
        let twidth = width || screenWidth 
            - (sidemenuCollapsed?50:245)   //侧边栏宽度
            - 50;        //padding
        // console.log(screenWidth, width);
        setTableWidth(twidth);


        // console.log(width, height);
    }, [tableWrapRef, width, height]);

    //监听主题发生变化后，动态改变表格的滚动条颜色，默认是不会改变的
    useEffect(()=> {
        let intervalId = setInterval(() => {
            if(!tableRef.current )
                return
        
            //设置滚动条颜色
            let thumbs = tableRef.current.nativeElement.querySelectorAll(".ant-table-tbody-virtual-scrollbar-thumb");
            // console.log(thumbs);
            if(thumbs && thumbs.length>0){
                if(themeType == 'dark'){
                    thumbs.forEach(thumb => {
                        thumb.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
                    });
                }else{
                    thumbs.forEach(thumb => {
                        thumb.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                    });
                }
                isSetedThumbColor.current = true;
            }

        }, 1000);

        return () => {
            clearInterval(intervalId);
        }

    }, [themeType]);

    //小屏幕显示简单的分页
    useEffect(()=>{
        setPagination({
            ...pagination,
            simple: minScreen
        });
    }, [minScreen]);


    //分页变化事件
    const handleTableChange: TableProps['onChange'] = (page, filters, sorter) => {
        setPrevSize(pagination.pageSize);
        setPrevCurrent(pagination.current);
        setPagination(page as any);
        // setTableParams({
        //     pagination,
        //     filters,
        //     sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
        //     sortField: Array.isArray(sorter) ? undefined : sorter.field,
        // });
        // `dataSource` is useless since `pageSize` changed
        if (page.pageSize !== page?.pageSize) {
            setData([]);
        }
    };

    //选中数据后事件
    const onTableSelectChange =  (selectedRowKeys: React.Key[], selectedRows: any[]) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        onSelect(selectedRows);
        setSelectedRowKeys(selectedRowKeys);
    }

    // const mergedColumns = tableColumns.map((col, index) => ({
    //     ...col,
    //     onHeaderCell: (column) => ({
    //         width: column.width,
    //         onResize: handleResize(index) as React.ReactEventHandler<any>,
    //     }),
    // }));

    return <div className="xm-table-wrap" ref={tableWrapRef}>
        <style>{`
            .react-resizable {
                position: relative;
                background-clip: padding-box;
            }
            .react-resizable-handle {
                position: absolute;
                inset-inline-end: -5px;
                width: 10px;
                height: 100%;
                bottom: 0;
                right: -5px;
                cursor: col-resize;
                z-index: 999;
            }
            `
        }
        </style>
        <Table dataSource={data} columns={tableColumns} 
            {...props}
            rowSelection={{
                type: selectType,
                onChange: onTableSelectChange,
                fixed: true,
                columnWidth: 45,
                checkStrictly: selectType == "radio",
                selectedRowKeys: selectedRowKeys,
                ...props.rowSelection,
            }}
            components={{
                ...props.components, 
                header: {
                    cell: ResizableTitle,
                },
            }} 
            ref = {tableRef}
            bordered
            virtual
            scroll={{ y: tableHeight, x: tableWidth }}
            rowKey={(record) => record.id}
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
            size={size}
            expandable={{...props.expandable, 
                onExpand : (expanded, record) => onTreeExpand(expanded, record,  setData)
            }}
        />
    </div>
}


export const TableComponent = InternalTable;