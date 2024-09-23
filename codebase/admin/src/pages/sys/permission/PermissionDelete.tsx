/*
 * MIT License
 *
 * Copyright (c) 2024 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */



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