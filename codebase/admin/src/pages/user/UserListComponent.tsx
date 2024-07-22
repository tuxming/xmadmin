
import { TableComponent, TableColumnType } from '../../components';
import { api } from '../../common/api';

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
    
    return <TableComponent pageSize={20} query={query} apiUrl={api.user.list} 
        onSelect={onSelect}
        columns={columns}
    />
}