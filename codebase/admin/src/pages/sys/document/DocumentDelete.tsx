import { Confirm, useRequest, useTranslation, useLayer } from "../../../components";
import { api } from "../../../common/api";
import { AdminDocument } from "../../../common/I18NNamespace";

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
    const { message } = useLayer();
    const request = useRequest();

    const msg = t("确定要删除以下文件：") 
                + docs.map(item => item.fileName+"").join(", ") 
            ; 

    const onOk = (close) => {
        const doDelete = async () => {
            let result = await request.get(api.document.deletes+"?ids="+docs.map(hist => hist.id+"").join(","));
            if(result.status){
                
                let txt = Object.keys(result.data).map(filename => {
                    let msg = result.data[filename];
                    if(msg.indexOf(":")>-1){
                        let msgs = msg.split(" : ");
                        msg = t(msgs[0])+" : "+msgs[1];
                    } else{
                        msg = t(msg);
                    }
                    return filename+" : "+msg
                }).join("<br/>");

                message.open({
                    content: <div style={{textAlign: "left"}} dangerouslySetInnerHTML={ {__html : txt}}></div>
                });

                successCall();
                close();
            }else{
                message.error(result.msg);
            }
        }
        doDelete();
    }

    return (docs && docs.length>0) ? (<Confirm content={msg} onOk={onOk}></Confirm>)
            : (<></> )
}