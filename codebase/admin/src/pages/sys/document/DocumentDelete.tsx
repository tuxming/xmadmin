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

import { Confirm } from "../../../components";
import { useRequest, useTranslation } from "../../../hooks";
import { api } from "../../../common/api";
import { AdminDocument } from "../../../common/I18NNamespace";
import { useShowResult } from "../../../hooks/useShowResult";

export type DocumentDeleteType = {
    docs: any[],
    successCall: () => void
}

/**
 * 删除角色
 * @returns 
 */
export const DocumentDelete : React.FC<DocumentDeleteType> = ({
    docs,
    successCall
}) => {
    
    const {t} = useTranslation(AdminDocument);
    const request = useRequest();
    const showResult = useShowResult(AdminDocument);

    const msg = t("确定要删除以下文件：") 
                + docs.map(item => item.fileName+"").join(", ") 
            ; 

    const onOk = (close) => {
        const doDelete = async () => {
            let result = await request.get(api.document.deletes+"?ids="+docs.map(hist => hist.id+"").join(","));
            showResult.show(result);
            if(result.status){
                successCall();
                close();
            }
        }
        doDelete();
    }

    return (docs && docs.length>0) ? (<Confirm content={msg} onOk={onOk}></Confirm>)
            : (<></> )
}