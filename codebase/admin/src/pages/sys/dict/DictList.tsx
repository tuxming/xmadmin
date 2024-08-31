
import { useContext, useEffect, useState } from 'react';
import { TableComponent, TableColumnType, ModalContext, useTranslation } from '../../../components';
import { computePx } from '../../../common/kit';
import { AdminDict } from '../../../common/I18NNamespace';
import { api } from '../../../common/api';
import { DictTypeTag } from './DictType';

export type DictListType = {
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
    },
    width: number,
    usedWidth: number,
    height: number
}


/**
 * 资源列表组件
 * @returns 
 */
export const DictList : React.FC<DictListType> = ({
    query,
    onSelect,
    refresh,
    width,
    usedWidth,
    height,
}) => {
    const {t} = useTranslation(AdminDict);

    const columns : TableColumnType[]= [
        {
            title: t('ID'),
            key: 'id',
            sort: true,
            ellipsis: true,
            width: 80,
            align: 'left'
        },
        {
            title: t('字典名'),
            key: 'groupLabel',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 90,
            align: 'center'
        },
        {
            title: t('字典代码'),
            key: 'groupName',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 120,
            align: 'center'
        },
        {
            title: t('数据名'),
            key: 'dictLabel',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150,
            align: 'center'
        },
        {
            title: t('数据KEY'),
            key: 'dictKey',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150,
            align: 'left'
        },
        {
            title: t('数据值'),
            key: 'dictValue',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150,
            align: 'center'
        },
        {
            title: t('数据类型'),
            key: 'type',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 150,
            align: 'center',
            render(text, record, index) {
                return <DictTypeTag>{text}</DictTypeTag>
            },
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
                height: computePx(modalPos.height, true) - 250
            };
            // console.log(modalPos, npos);
            setPos(npos)
        }

    }, [modalPos]);

    return (
        <TableComponent pageSize={20} query={query} apiUrl={api.dict.dicts} 
            width = {width} height={height}
            onSelect={onSelect}
            columns={columns}
            refresh={refresh}
            initLoad={false}
        />
    )
}