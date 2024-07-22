

import { Confirm, useRequest } from "../../components";
import { api } from "../../common/api";
import { App } from 'antd'

export type HistoryDeleteType = {
    histories: any[],
    successCall: () => void
}

export const HistoryDelete : React.FC<HistoryDeleteType> = ({
    histories,
    successCall
}) => {
    
    if(!histories || histories.length == 0)
    return <></>

    const { message } = App.useApp();
    const requet = useRequest();

    const msg = "确定要删除以下日志记录：" 
                + histories.map(item => item.id+"").join(", ") 
            ; 

    const onOk = (close) => {
        const doDelete = async () => {
            let result = await requet.get(api.history.deletes+"?ids="+histories.map(hist => hist.id+"").join(","));
            if(result.status){
                message.success("删除成功");
                successCall();
                close();
            }else{
                message.error("删除失败");
            }
        }
        doDelete();
    }


    return <Confirm text={msg} onOk={onOk}></Confirm>

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