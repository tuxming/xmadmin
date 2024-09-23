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



import { api } from "../../../common/api";
import { useRequest, useTranslation} from "../../../hooks";
import { Confirm,useLayer } from "../../../components";
import { AdminHistory, DefaultNS } from "../../../common/I18NNamespace";

export type HistoryDeleteType = {
    histories: any[],
    successCall: () => void
}

export const HistoryDelete : React.FC<HistoryDeleteType> = ({
    histories,
    successCall
}) => {
    
    const {t} = useTranslation(AdminHistory);
    const { message } = useLayer();
    const request = useRequest();

    const msg = t("确定要删除以下日志记录：") 
                + histories.map(item => item.id+"").join(", ") 
            ; 

    const onOk = (close) => {
        const doDelete = async () => {
            let result = await request.get(api.history.deletes+"?ids="+histories.map(hist => hist.id+"").join(","));
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


    return (histories && histories.length>0)?(<Confirm content={msg} onOk={onOk}></Confirm>):(<></>)

    // const [rows, setRows] = useState<any[]>([]);

    // useEffect(()=> {
    //     if(histories && histories.length>0){
    //         console.log("selected change");
    //         let msg = "确定要删除以下日志记录：" 
    //             + histories.map(item => item.id+"").join("") 
    //         ; 
    //         setRows([{
    //             message: msg,
    //             onOk: (row, close) => {
    //                 setRows([]);
    //                 close();
    //             }, 
    //             onCancel: () => {
    //                 setRows([]);
    //             }
    //         }]);
    //     }

    // }, [histories])

    // return <>
    //     {rows.map((row, index) => {
    //         return <Confirm key={index} text={row.message} onCancel={row.onCancel} onOk={(close) => row.onOk(row, close)}></Confirm>
    //     })}
    // </>
}