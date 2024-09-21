
import { TableComponent, TableColumnType,ModalContext } from '../../../components';
import { useTranslation } from '../../../hooks';
import { api } from '../../../common/api';
import { AdminHistory } from '../../../common/I18NNamespace';
import { useContext, useEffect, useState } from 'react';
import { computePx } from '../../../common/kit';

export type HistoryListType = {
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

export const HistoryList : React.FC<HistoryListType> = ({
    query,
    onSelect,
    refresh
}) => {
    const {t} = useTranslation(AdminHistory);
    const columns : TableColumnType[]= [
        {
            title: t("ID"),
            key: 'id',
            sort: true,
            ellipsis: true,
            width: 80,
            fixed: 'left'
        },
        {
            title: t("操作人"),
            key: 'username',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: t("IP地址"),
            key: 'ipAddr',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: t('操作类型'),
            key: 'type',
            sort: true,
            filter: true,
            width: 150
        },
        {
            title: t('操作时间'),
            key: 'created',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200
        },
        {
            title: t("请求参数"),
            key: 'remark',
            ellipsis: true,
            align: 'left',
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

    return <TableComponent pageSize={20} query={query} apiUrl={api.history.list} refresh={refresh}
        width={pos?.width} height={pos?.height}
        onSelect={onSelect}
        columns={columns}
    />
}