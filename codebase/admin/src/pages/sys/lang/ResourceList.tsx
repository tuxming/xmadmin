
import { useTranslation } from '../../../hooks';
import { TableComponent, TableColumnType } from '../../../components';
import { AdminLang } from '../../../common/I18NNamespace';
import { api } from '../../../common/api';

export type ResourceListType = {
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
export const ResourceList : React.FC<ResourceListType> = ({
    query,
    onSelect,
    refresh,
    width,
    usedWidth,
    height,
}) => {
    const {t} = useTranslation(AdminLang);

    const columns : TableColumnType[]= [
        {
            title: t('ID'),
            key: 'id',
            sort: true,
            ellipsis: true,
            width: 100,
            align: 'left'
        },
        {
            title: t('KEY'),
            key: 'resKey',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 250,
            align: 'left'
        },
        {
            title: t('显示值'),
            key: 'resValue',
            sort: true,
            filter: true,
            ellipsis: true,
            width: 250,
            align: 'left'
        }
    ];

    //当组件使用窗口话的时候，获取窗口的位置信息，设置到表格
    // const modalPos = useContext(ModalContext);
    // const [pos, setPos] = useState({
    //     width: null, 
    //     height: null,
    // });

    // useEffect(()=> {
    //     if(modalPos && modalPos.width && modalPos.height){
    //         let npos = {
    //             width: computePx(modalPos.width),
    //             height: computePx(modalPos.height, true) - 250
    //         };
    //         // console.log(modalPos, npos);
    //         setPos(npos)
    //     }

    // }, [modalPos]);

    return (
        <TableComponent pageSize={20} query={query} apiUrl={api.lang.resources} 
            width={width} height={height}
            onSelect={onSelect}
            columns={columns}
            refresh={refresh}
            initLoad={false}
        />
    )
}