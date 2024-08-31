

import { Confirm, useRequest, useTranslation } from "../../../components";
import { api } from "../../../common/api";
import { App } from 'antd'
import { AdminPermission, DefaultNS } from "../../../common/I18NNamespace";

export type PermissionDeleteType = {
    permissions: any[],
    successCall: () => void
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
    const { message } = App.useApp();
    const request = useRequest();

    const msg = t("确定要删除以下权限：") 
                + permissions.map(item => item.name+"").join(", ") 
            ; 

    const onOk = (close) => {
        const doDelete = async () => {
            let result = await request.get(api.permission.deletes+"?ids="+permissions.map(hist => hist.id+"").join(","));
            if(result.status){
                message.success(t("删除成功", DefaultNS));
                successCall();
                close();
            }else{
                message.error(t("删除失败", DefaultNS));
            }
        }
        doDelete();
    }


    return (permissions && permissions.length>0) ? (<Confirm text={msg} onOk={onOk}></Confirm>)
            : (<></> )
}