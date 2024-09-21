

import { Confirm } from "../../../components";
import { useRequest, useShowResult, useTranslation } from "../../../hooks";
import { api } from "../../../common/api";
import { AdminRole } from "../../../common/I18NNamespace";

export type RoleDeleteType = {
    roles: any[],
    successCall: (refresh: boolean) => void
}

/**
 * 删除角色
 * @returns 
 */
export const RoleDelete : React.FC<RoleDeleteType> = ({
    roles,
    successCall
}) => {
    
    const {t} = useTranslation(AdminRole);
    const showResult = useShowResult(AdminRole);
    const request = useRequest();

    const msg = t("确定要删除以下角色：") 
                + roles.map(item => item.roleName+"").join(", ") 
            ; 

    const onOk = (close) => {
        const doDelete = async () => {
            let result = await request.get(api.role.deletes+"?ids="+roles.map(hist => hist.id+"").join(","));
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