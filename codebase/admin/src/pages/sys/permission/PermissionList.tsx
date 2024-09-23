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


import { useTranslation } from '../../../hooks';
import { TableComponent, TableColumnType, ModalContext } from '../../../components';
import { api } from '../../../common/api';
import { useContext, useEffect, useState } from 'react';
import { computePx } from '../../../common/kit';
import { AdminPermission } from '../../../common/I18NNamespace';

export type PermissionListType = {
    query: any,
    onSelect: (rows: any[]) => void,
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

/**
 * 角色列表组件
 * @returns 
 */
export const PermissionList : React.FC<PermissionListType> = ({
    query,
    onSelect,
    refresh
}) => {

    const {t} = useTranslation(AdminPermission);

    const columns : TableColumnType[]= [
        {
            title: t('ID'),
            key: 'id',
            sort: true,
            ellipsis: true,
            width: 100
        },
        {
            title: t('分组名'),
            key: 'groupName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: t('权限名'),
            key: 'name',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200
        },
        {
            title: t('表达式'),
            key: 'expression',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200,
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

    return <TableComponent pageSize={20} query={query} apiUrl={api.permission.list} 
        width={pos?.width} height={pos?.height}
        onSelect={onSelect}
        columns={columns}
        refresh={refresh}
    />
}