

import { useEffect, useState } from 'react';
import { Descriptions, DescriptionsProps, Skeleton, theme as antdTheme, App  } from 'antd';
import { useSelector } from '../../redux/hooks';
import { Modal, useRequest, useTranslation } from '../../components';
import { api } from '../../common/api';
import { AdminHistory, DefaultNS } from '../../common/I18NNamespace';

export type HistoryDetailType = {
    historyId: string,
    open: boolean
    close: () => void
}

export const HistoryDetail : React.FC<HistoryDetailType> = ({
    historyId = 0,
    open = false,
    close,
}) => {

    // if(!(open && historyId)){
    //     return <></>
    // }

    const [loading, setLoading] = useState(true);
    const theme = useSelector(state => state.themeConfig.theme);
    const { message } = App.useApp();

    const [items, setItems] = useState<DescriptionsProps['items']>();
    const size = useSelector(state => state.themeConfig.componentSize);
    const request = useRequest();
    const {token} = antdTheme.useToken();
    const {t} = useTranslation(AdminHistory);

    useEffect(()=>{
        if(!historyId) return;
        getDetail();
    }, [open, historyId]);

    const getDetail = async () => {
        let result = await request.get(api.history.get+"?historyId="+historyId);
        if(result.status){
            let hist = result.data;
            setItems([
                {
                    label: t("操作人"),
                    children: hist.username
                },
                {
                    label: t("IP地址"),
                    children: hist.ipAddr
                },
                {
                    label: t("操作类型"),
                    children: hist.type
                },
                {
                    label: t("操作时间"),
                    children: hist.created
                },
                {
                    label: t("请求参数"),
                    children: hist.remark,
                    span: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 },
                }
            ]);
            setLoading(false);
            message.success(t(result.msg, DefaultNS));
        }else{
            message.error(t(result.msg, DefaultNS));
        }
    }

    return <>
        <Modal title={t("日志详情" )}
            open={open} showMask={false}
            onClose={close}
            width={"500"}
            theme={theme}
            btnColor={token.colorPrimary}
            btnHoverColor={token.colorPrimaryHover}
        >
            {/* <Descriptions 
                    bordered
                        size={size == 'large'?'default':size}
                        column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
                        items={items}
                    /> */}
            {
                loading?(
                    <Skeleton active />
                ):(<Descriptions 
                    bordered
                        size={size == 'large'?'default':size}
                        // size={dsize}
                        column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
                        items={items}
                    />
                )
            }
        </Modal>
        
    </>
    // return <>detail</>
}