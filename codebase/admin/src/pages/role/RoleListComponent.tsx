
import { TableComponent, TableColumnType, ModalContext } from '../../components';
import { api } from '../../common/api';
import { RoleTypeTag } from './RoleType';
import { useContext, useEffect, useState } from 'react';
import { computePx } from '../../common/kit';

export type RoleListComponentType = {
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
export const RoleListComponent : React.FC<RoleListComponentType> = ({
    query,
    onSelect,
    refresh
}) => {
    const columns : TableColumnType[]= [
        {
            title: 'ID',
            key: 'id',
            sort: true,
            ellipsis: true,
            width: 100
        },
        {
            title: '角色名',
            key: 'roleName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: '角色代码',
            key: 'code',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200
        },
        {
            title: '角色类型',
            key: 'type',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150,
            render(text, record, index) {
                return <RoleTypeTag>{text}</RoleTypeTag>
            },
        },
        {
            title: '创建人',
            key: 'createrName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        }
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

    return <TableComponent pageSize={20} query={query} apiUrl={api.role.list} 
        width={pos?.width} height={pos?.height}
        onSelect={onSelect}
        columns={columns}
        refresh={refresh}
    />
}