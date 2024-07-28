import { Confirm, useRequest, useTranslation } from "../../components"
import { AdminPermission, DefaultNS } from "../../common/I18NNamespace"
import { api } from "../../common/api"
import { App } from "antd"


type PermissionScanType = {
    open: boolean,
    onClose: (refresh: boolean) => void
}

/**
 * 权限扫描
 */
export const PermissionScan : React.FC<PermissionScanType> = ({
    open, onClose
}) => {

    const {t} = useTranslation(AdminPermission);
    const request = useRequest();
    const {message} = App.useApp();

    const msg = t("确定要扫描整个系统的权限吗?");

    const onOk = (close) => {
        const doDelete = async () => {
            let result = await request.get(api.permission.scan);
            if(result.status){
                message.success(t("删除成功", DefaultNS));
                onClose(true);
                close();
            }else{
                message.error(t("删除失败", DefaultNS));
            }
        }
        doDelete();
    }


    return open? (<Confirm text={msg} onOk={onOk} onCancel={()=>onClose(false)}></Confirm>) : (<></>)
}