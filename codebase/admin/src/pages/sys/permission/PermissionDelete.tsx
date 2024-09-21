

import { useRequest, useShowResult, useTranslation } from "../../../hooks";
import { Confirm } from "../../../components";
import { api } from "../../../common/api";
import { AdminPermission, DefaultNS } from "../../../common/I18NNamespace";

export type PermissionDeleteType = {
    permissions: any[],
    successCall: (refresh: boolean) => void
}

/**
 * 删除角色
 * @returns 
 */
export const PermissionDelete : React.FC<PermissionDeleteType> = ({
    permissions,
    successCall
}) => {
    
    const {t} = useTranslation(AdminPermission);
    const showResult = useShowResult(AdminPermission);
    const request = useRequest();

    const msg = t("确定要删除以下权限：") 
                + permissions.map(item => item.name+"").join(", ") 
            ; 

    const onOk = (close) => {
        const doDelete = async () => {
            let result = await request.get(api.permission.deletes+"?ids="+permissions.map(hist => hist.id+"").join(","));
            showResult.show(result);
            close();
            setTimeout(() => {
                successCall(result.status);
            }, 500);
        }
        doDelete();
    }


    return <Confirm content={msg} onOk={onOk}></Confirm>
}