
import { TableComponent, TableColumnType, ModalContext } from '../../../components';
import { useTranslation } from '../../../hooks';
import { api } from '../../../common/api';
import { computePx } from '../../../common/kit';
import { useContext, useEffect, useState } from 'react';

export type UserListType = {
    query: any,
    refresh: {
        reset: boolean,
        tag: any,
    }
    onSelect: (rows: any[]) => void
}

export const UserList : React.FC<UserListType> = ({
    query,
    refresh,
    onSelect
}) => {
    const {t} = useTranslation();

    const columns : TableColumnType[]= [
        {
            title: t('ID'),
            key: 'id',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 80
        },
        {
            title: t('账号'),
            key: 'username',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: t('姓名'),
            key: 'fullname',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: t('邮件'),
            key: 'email',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 180
        },
        {
            title: t('电话'),
            key: 'phone',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 180
        },
        {
            title: t('状态'),
            key: 'status',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 120,
        },
        {
            title: t('创建时间'),
            key: 'created',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200
        },
        {
            title: t('推广码'),
            key: 'code',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 120,
        },
        {
            title: t('上级'),
            key: 'parentName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150,
        },
        {
            title: t('性别'),
            key: 'gender',
            sort: true,
            filter: true,
            ellipsis: true,
            width:80
        },
        {
            title: t('所在组织'),
            key: 'deptName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200
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
        refresh={refresh}
    />
}