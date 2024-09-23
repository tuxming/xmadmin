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