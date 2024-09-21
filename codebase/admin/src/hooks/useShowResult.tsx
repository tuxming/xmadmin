

import {ResposeDataType} from './useRequest'
import { DefaultNS } from '../common/I18NNamespace';
import { useLayer } from '../components/Modal';
import { useTranslation } from './useTranslation';

/**
 * 显示提示消息，之所以包装是用来能支持多种显示方式，更好的支持国际化，更好的个性化显示返回消息
 */
export const useShowResult =  (i18namespace: string) => {

    const {t, f} = useTranslation(i18namespace);
    const {message} = useLayer();

    const show = (result: ResposeDataType) => {

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
            message.open({
                content: <div style={{textAlign: "left", maxHeight: 400, overflowY: 'auto'}} dangerouslySetInnerHTML={ {__html : txt}}></div>
            });
        }else{
            if(result.status){  //成功的消息，使用默认国际化的命名空间
                if(result.args && result.args.length>0){  //format的消息
                    message.warning(f(result.msg, result.args));
                }else{
                    message.success(t(result.msg, DefaultNS));
                }
            }else{
                if(result.args && result.args.length>0){  //format的消息
                    message.warning(f(result.msg, result.args));
                }else if(result.code == '500'){ //表示系统错误， 不需要国际化
                    message.error(result.msg);
                }else{
                    if(result.code == '10'){ //表示业务错误消息
                        message.warning(t(result.msg, i18namespace));
                    }else{ //表示固定的错误消息，
                        message.warning(t(result.msg, DefaultNS));
                    }
                }
            }
        }
    }

    return {
        show
    };
}