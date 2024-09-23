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