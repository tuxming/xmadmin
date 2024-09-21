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