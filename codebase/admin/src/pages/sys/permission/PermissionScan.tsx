import { useRequest, useShowResult, useTranslation } from "../../../hooks"
import { Confirm } from "../../../components"
import { AdminPermission, DefaultNS } from "../../../common/I18NNamespace"
import { api } from "../../../common/api"


type PermissionScanType = {
    onClose: (refresh: boolean) => void
}

/**
 * 权限扫描
 */
export const PermissionScan : React.FC<PermissionScanType> = ({
    onClose
}) => {

    const {t} = useTranslation(AdminPermission);
    const request = useRequest();
    const showResult = useShowResult(AdminPermission);

    const msg = t("确定要扫描整个系统的权限吗?");

    const onOk = (close) => {
        const doScan = async () => {
            let result = await request.get(api.permission.scan);
            showResult.show(result);
            if(result.status){
                onClose(true);
                close();
            }
        }
        doScan();
    }

    return <Confirm content={msg} onOk={onOk} onCancel={()=>onClose(false)}></Confirm>
}