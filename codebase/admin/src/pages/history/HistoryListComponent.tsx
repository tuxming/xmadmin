
import { TableComponent, TableColumnType } from '../../components';
import { api } from '../../common/api';

export type HistoryListComponentType = {
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

export const HistoryListComponent : React.FC<HistoryListComponentType> = ({
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
            width: 80,
            fixed: 'left'
        },
        {
            title: '账号',
            key: 'username',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: 'IP',
            key: 'ipAddr',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: '操作类型',
            key: 'type',
            sort: true,
            filter: true,
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
            title: '参数',
            key: 'remark',
            ellipsis: true,
            align: 'left'
        },
    ];
    
    return <TableComponent pageSize={20} query={query} apiUrl={api.history.list} refresh={refresh}
        onSelect={onSelect}
        columns={columns}
    />
}