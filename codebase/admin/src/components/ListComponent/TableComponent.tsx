
import React, {useEffect, useRef, useState} from 'react';
import { Table, Tooltip, App } from 'antd';
import type { TableProps } from 'antd';
import { useSelector } from "../../redux/hooks"
import { useRequest, useTranslation } from '../../components';
import { DefaultNS } from '../../common/I18NNamespace';

export type TableColumnType = {
    title: string,
    key: string, 
    sort?: boolean,      //是否开启排序
    filter?: boolean,    //是否开启过滤
    render?: (text, record, index) => JSX.Element,
    ellipsis?: boolean,
    width?: number | string,
    align?: 'left' | 'right' | 'center',
    fixed?: boolean | 'left' | 'right',
}

export type TableType = {
    columns: TableColumnType[],
    pageSize: number,
    query: any,  //查询条件
    apiUrl: string, 
    onSelect: (rows: any[]) => void,
    width?: number | string,
    height?: number | string, 
    refresh?: {
        /**
         * 是否刷新到第一页，false: 刷新当前页, true: 刷新至第一页，默认false
         */
        reset: boolean, 
        /**
         *  刷新标识，与上一次刷新的值不一样即可，可以是任意值
         */
        tag: any, 
    }
}


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

/**
 * 表格组件封装，这个表格可以自己传入宽高，如果自己没有传入宽高，则将自适应于页面组件的宽高
 * @returns 
 */
export const TableComponent : React.FC<TableType> = ({
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
    }
}) => {

    const {t} = useTranslation();
    const request = useRequest();
    const { message } = App.useApp();
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
    const [prevQuery, setPrevQuery] = useState<any>(query);
    const themeType = useSelector(state => state.themeConfig.theme);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>();
    
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: pageSize,
        total: 0,
        simple: false,
        pageSizeOptions: [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
    });

    //构建表格列
    const [tableColumns, setTableColumns] = useState<any>(columns.map(col => {

        let item =  {
            title: col.title,
            dataIndex: col.key,
            key: col.key,
            align: col.align || 'center',
            fixed: col.fixed || false,
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

        return item;
    }));

    //获取数据
    const fetchData = () => {
        setLoading(true);

        let post = async () => {
            try{
                let result = await request.post(
                    apiUrl,
                    {...query, 
                        start: (pagination.current-1) * pagination.pageSize,
                        length: pagination.pageSize
                    }
                );
    
                setLoading(false);
                // setData([]);
                if(result.status){
                    message.success(result.msg);
                    setData(result.data.list);
                    setPagination({
                        ...pagination,
                        total: result.data.total || pagination.total
                    });
                }else{
                    message.error(result.msg);
                }
            }catch(err){
                setLoading(false);
                let error = (err as any);
                if(error.code == 'ERR_NETWORK'){
                    message.error(t("网络错误，请检查是否正常能正常访问服务器", DefaultNS));
                }else{
                    message.error(error.message);
                }
            }

        }
       
        post();
    }

    useEffect(()=>{
        // console.log(refresh);
        if(JSON.stringify(query) != JSON.stringify(prevQuery)){
            // console.log("query");
            setPrevQuery(query);
            setPagination({
                ...pagination,
                current: 1
            });
            fetchData();
        }else if((refresh.reset && pagination.current!=1)){
            setPagination({
                ...pagination,
                current: 1
            });
            
        }else{
            fetchData();
        }
        
    }, [
        pagination?.current,
        pagination?.pageSize,
        query,
        refresh.tag
    ]); 

    // useEffect(() => {
    //     doLoadData();
    //     firstRequest.current = false;
    // }, [])

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

    //设置表格宽高, 如果传入了宽高就使用传入的匡高，
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

    const handleTableChange: TableProps['onChange'] = (pagination, filters, sorter) => {
        setPagination(pagination as any);
        // setTableParams({
        //     pagination,
        //     filters,
        //     sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
        //     sortField: Array.isArray(sorter) ? undefined : sorter.field,
        // });
        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== pagination?.pageSize) {
            setData([]);
        }
    };

    const onTableSelectChange =  (selectedRowKeys: React.Key[], selectedRows: any[]) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        onSelect(selectedRows);
    }

    return <div className="xm-table-wrap" ref={tableWrapRef}>
        <Table dataSource={data} columns={tableColumns} 
            rowSelection={{
                type: 'checkbox',
                onChange: onTableSelectChange,
                fixed: true,
                columnWidth: 45,
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
        />
    </div>
}