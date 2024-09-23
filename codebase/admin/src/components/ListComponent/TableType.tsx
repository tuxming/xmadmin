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

import type { TableColumnProps, TableProps } from 'antd';

export type TableColumnType = {
    /**
     * 显示名
     */
    title: string,
    /**
     * 字段名
     */
    key: string, 
    /**
     * 是否启用排序
     */
    sort?: boolean,   
    /**
     * 是否启用filter:
     * boolean: false, 不启用， true = 列表筛选
     * search: 关键字搜多筛选，未实现
     * dateRange: 日期范围，未实现
     * dateTimeRange: 日期时间范围，未实现
     * options: [{key,value}]形式的列表筛选，未实现
     */
    filter?: boolean | "search" | 'dateRange' | 'dateTimeRange' | 'options',    //是否开启过滤
    /**
     * 当filter类型为options的时候，需要指定filterOptions
     */
    filterOptions?: {key: string, value: any}[]
    /**
     * 自定义渲染单元格
     * @param text 
     * @param record 
     * @param index 
     * @returns 
     */
    render?: (text, record, index) => JSX.Element,
    /**
     * 是否省略溢出
     */
    ellipsis?: boolean,
    /**
     * 单元格宽度
     */
    width?: number | string,
    /**
     * 显示位置
     */
    align?: 'left' | 'right' | 'center',
    /**
     * 是否固定
     */
    fixed?: boolean | 'left' | 'right',
} & TableColumnProps<any>


export type TableType = {
    columns: TableColumnType[],
    /**
     * 每页显示的数量
     */
    pageSize: number,
    /**
     * 查询条件，post请求body中的参数，
     */
    query: any,  //查询条件
    /**
     * 请求的url
     */
    apiUrl: string, 
    /**
     * 选中的后的回调函数
     * @param rows 选中的数据
     * @returns 
     */
    onSelect: (rows: any[]) => void,
    /**
     * 表格的宽度，设置这个宽度会自动启动虚拟滚动
     */
    width?: number | string,
     /**
     * 表格的高度，设置这个高度会自动启动虚拟滚动
     */
    height?: number | string, 
    /**
     * 刷新标记，更新tag值会触发表格重新获取数据
     */
    refresh?: {
        /**
         * 是否刷新到第一页，false: 刷新当前页, true: 刷新至第一页，默认false
         */
        reset: boolean, 
        /**
         *  刷新标识，与上一次刷新的值不一样即可，可以是任意值
         */
        tag: any, 
    },
    /**
     * 当时树形结构的时候，点击展开关闭的回调
     * @param expand boolean
     * @param record 点击的数据
     * @param setData 更新表个数据的回调函数
     * @returns 
     */
    onTreeExpand?: (expand, record, setData) => void,
    /**
     * 选中类型
     */
    selectType?: 'checkbox' | 'radio',
    /**
     * 更新子节点，在是树形结构的情况下，更新子节点
     * 这里约定，节点的key是id, 懒得做那么活，
     * parentId,为上级节点
     */
    updateChildren?: {
        data?: TableColumnType[],
        parentId?: any
    },
    /**
     * 是否在初始的时候加载，为false的时候不加载
     */
    initLoad?: boolean
    //加载成功后，返回数组
    onDataLoaded?: (data: any[]) => void,
} & TableProps;
