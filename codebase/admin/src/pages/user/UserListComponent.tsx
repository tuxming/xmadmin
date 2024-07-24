
import { TableComponent, TableColumnType, ModalContext } from '../../components';
import { api } from '../../common/api';
import { computePx } from '../../common/kit';
import { useContext, useEffect, useState } from 'react';

export type UserListComponentType = {
    query: any,
    onSelect: (rows: any[]) => void
}

export const UserListComponent : React.FC<UserListComponentType> = ({
    query,
    onSelect
}) => {
    const columns : TableColumnType[]= [
        {
            title: '账号',
            key: 'username',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: '姓名',
            key: 'fullname',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: '创建时间',
            key: 'created',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200
        },
        {
            title: '推广码',
            key: 'code',
            sort: true,
            filter: true,
            ellipsis: true
        },
        {
            title: '上级',
            key: 'parentName',
            sort: true,
            filter: true,
            ellipsis: true
        },
        {
            title: '性别',
            key: 'gender',
            sort: true,
            filter: true,
            ellipsis: true
        },
        {
            title: '邮件',
            key: 'email',
            sort: true,
            filter: true,
            ellipsis: true
        },
        {
            title: '电话',
            key: 'phone',
            sort: true,
            filter: true,
            ellipsis: true
        },
        {
            title: '状态',
            key: 'status',
            sort: true,
            filter: true,
            ellipsis: true
        },
        {
            title: '所在组织',
            key: 'deptName',
            sort: true,
            filter: true,
            ellipsis: true
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
    
    return <TableComponent pageSize={20} query={query} apiUrl={api.user.list} 
        width={pos?.width} height={pos?.height}
        onSelect={onSelect}
        columns={columns}
    />
}