

import { Confirm, useRequest, useTranslation } from "../../components";
import { api } from "../../common/api";
import { App } from 'antd'
import { AdminHistory, AdminRole, DefaultNS } from "../../common/I18NNamespace";

export type RoleDeleteType = {
    roles: any[],
    successCall: () => void
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
    const { message } = App.useApp();
    const requet = useRequest();

    const msg = t("确定要删除以下角色：") 
                + roles.map(item => item.roleName+"").join(", ") 
            ; 

    const onOk = (close) => {
        const doDelete = async () => {
            let result = await requet.get(api.role.deletes+"?ids="+roles.map(hist => hist.id+"").join(","));
            if(result.status){
                message.success(t("删除成功", DefaultNS));
                successCall();
                close();
            }else{
                message.error(t("删除失败"));
            }
        }
        doDelete();
    }


    return (roles && roles.length>0) ? (<Confirm text={msg} onOk={onOk}></Confirm>)
            : (<></> )
}