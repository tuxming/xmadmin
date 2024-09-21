

import { useEffect, useState } from 'react';
import { Descriptions, DescriptionsProps, Skeleton, theme as antdTheme } from 'antd';
import { Modal } from '../../../components';
import { useRequest, useTranslation,useSelector } from '../../../hooks';
import { api } from '../../../common/api';
import { AdminHistory, AdminLang, DefaultNS } from '../../../common/I18NNamespace';
import { useShowResult } from '../../../hooks/useShowResult';

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

    const [loading, setLoading] = useState(true);
    const theme = useSelector(state => state.themeConfig.theme);

    const [items, setItems] = useState<DescriptionsProps['items']>();
    const size = useSelector(state => state.themeConfig.componentSize);
    const request = useRequest();
    const {token} = antdTheme.useToken();
    const {t} = useTranslation(AdminHistory);
    const showResult = useShowResult(AdminLang);

    useEffect(()=>{
        if(!historyId) return;
        getDetail();
    }, [open, historyId]);

    const getDetail = async () => {
        let result = await request.get(api.history.get+"?historyId="+historyId);

        showResult.show(result);

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