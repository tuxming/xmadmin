
import { TableComponent, TableColumnType, ModalContext, useTranslation } from '../../components';
import { api } from '../../common/api';
import { useContext, useEffect, useState } from 'react';
import { computePx } from '../../common/kit';
import { AdminDocument } from '../../common/I18NNamespace';

export type DocumentListComponentType = {
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
 * 文档列表组件
 * @returns 
 */
export const DocumentListComponent : React.FC<DocumentListComponentType> = ({
    query,
    onSelect,
    refresh
}) => {

    const {t} = useTranslation(AdminDocument);

    const columns : TableColumnType[]= [
        {
            title: t('ID'),
            key: 'id',
            sort: true,
            ellipsis: true,
            width: 100
        },
        {
            title: t('文件名'),
            key: 'fileName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: t('文件路径'),
            key: 'path',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 200
        },
        {
            title: t('类型'),
            key: 'type',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150,
        },
        {
            title: t('创建人'),
            key: 'createrName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: t('创建时间'),
            key: 'created',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150
        },
        {
            title: t('备注'),
            key: 'remark',
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

    return <TableComponent pageSize={20} query={query} apiUrl={api.document.list} 
        width={pos?.width} height={pos?.height}
        onSelect={onSelect}
        columns={columns}
        refresh={refresh}
    />
}