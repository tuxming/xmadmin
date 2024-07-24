import { useState } from "react";
import { useSelector } from "../../redux/hooks";
import { Divider, Space, Tooltip, Button, App  } from "antd";
import { DeleteIcon, ViewIcon } from "../../components/icon/svg/Icons";
import { HistoryQueryComponent, HistoryListComponent, HistoryDetail } from "./index";
import { HistoryDelete } from "./HistoryDelete";
import { useTranslation } from "../../components";
import { AdminHistory } from "../../common/I18NNamespace";

export const HistoryPage : React.FC = () => {

    const {t} = useTranslation(AdminHistory);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const [query, setQuery] = useState({});
    const size = useSelector(state => state.themeConfig.componentSize);
    const { message } = App.useApp();
    
    const [refresh, setRefresh] = useState({
        reset: false,
        tag: 1
    });
    const [views, setViews] = useState<any>([]);
    const [histories, setHistories] = useState<any>();
    const [deletes, setDeletes] = useState<any>([]);

    let onQuery = (values) => {
        setQuery(values);
    }

    /**
     * 选中行
     */
    const onTableSelectChange =  (rows:any) => {
        if(!rows || rows.length == 0){
            setHistories([]);
        }else{
            setHistories(rows);
        }
    };

    /**
     * 查看详情
     */
    const onViewDetail = () => {
        if(!histories || histories.length==0){
            message.error(t("请选择要查看的日志"));
            return;
        }
        setViews([...histories]);
    }

    /**
     * 关闭查看详情后的回调
     */
    const onViewClose = (item) => {
        let newView = views.filter(v => v!=item);
        setViews(newView);
    } 

    /**
     * 执行删除
     */
    const onDelete = () => {
        if(!histories || histories.length==0){
            message.error(t("请选择要删除的日志"));
            return;
        }
        setDeletes([]);
        setTimeout(() => {
            setDeletes(histories);
        }, 60);
    }

    /**
     * 刷新列表
     */
    const onRefresh = () => {
        setRefresh({reset: false, tag: refresh.tag+1});
    }

    return <>
        <HistoryQueryComponent onQuery={onQuery} />
        
        <Divider />

        <Space wrap>
            <Tooltip title={t("查看日志")}>
                <Button type='primary' size={size} onClick={onViewDetail} icon={<ViewIcon type='primary'/>}>{!onlyIcon && t('查看')}</Button>
            </Tooltip>
            <Tooltip title={t("删除日志")}>
                <Button type='primary' size={size} onClick={onDelete} icon={<DeleteIcon type='ghostPrimary' danger/>} ghost danger>{!onlyIcon && t('删除')}</Button>
            </Tooltip>
        </Space>

        <Divider />

        <HistoryListComponent onSelect={onTableSelectChange} query={query} refresh={refresh}/>
        {views.map((view, index) => {
             return <HistoryDetail historyId={view.historyId}  close={() => onViewClose(view)} open={true} key={index}/>
        })}

        <HistoryDelete histories={deletes} successCall={onRefresh}/>

    </>
}