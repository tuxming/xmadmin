
import { DefaultNS } from '@/common/I18NNamespace';
import type {ResposeDataType} from './Request'
import useTranslation from './useTranslation'
import { ElMessage } from "element-plus";

export const showResult = (result: ResposeDataType, i18namespace: string) => {

    const {t, f} = useTranslation(i18namespace);

    if(result.code == '600'){  //code == 600, data{key=msg}针对这种返回消息,
        let txt = Object.keys(result.data).map(key => {
            let msg = result.data[key];
            if(msg.indexOf(" : ")>-1){
                let msgs = msg.split(" : ");
                msg = t(msgs[0])+" : "+msgs[1];
            } else{
                msg = t(msg);
            }
            return key+" : "+msg
        }).join("<br/>");
        ElMessage({
            showClose: true,
            type: 'info',
            dangerouslyUseHTMLString: true,
            message: "<div style='textAlign: \"left\", maxHeight: 400, overflowY: 'auto'>"+txt+"</div>",
        })
        
    }else{
        if(result.status){  //成功的消息，使用默认国际化的命名空间
            if(result.args && result.args.length>0){  //format的消息
                ElMessage({
                    showClose: true,
                    message: f(result.msg, result.args),
                    type: 'warning',
                })
            }else{
                ElMessage({
                    showClose: true,
                    message: t(result.msg, DefaultNS),
                    type: 'success',
                })
            }
        }else{
            if(result.args && result.args.length>0){  //format的消息
                ElMessage({
                    showClose: true,
                    message: f(result.msg, result.args),
                    type: 'warning',
                })
            }else if(result.code == '500'){ //表示系统错误， 不需要国际化
                ElMessage({
                    showClose: true,
                    message: result.msg,
                    type: 'error',
                })
            }else{
                if(result.code == '10'){ //表示业务错误消息
                    ElMessage({
                        showClose: true,
                        message: t(result.msg, i18namespace),
                        type: 'warning',
                    })
                }else{ //表示固定的错误消息，
                    ElMessage({
                        showClose: true,
                        message: t(result.msg, DefaultNS),
                        type: 'warning',
                    })
                }
            }
        }
    }
}