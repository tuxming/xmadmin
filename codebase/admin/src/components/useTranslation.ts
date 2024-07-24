
import { useTranslation as useI18nTranslation } from 'react-i18next';


export const useTranslation = (namespace: string = 'translation') =>{

    const { t } = useI18nTranslation(namespace);

    /**
     * 翻译
     * @param key 
     * @param ns 
     * @returns 
     */
    const ti = (key: string, ns?: string) => {
        if(ns){
            return t(key, {ns: ns})
        }
        return t(key);
    }

    /**
     * 格式化
     * eg:  info: my name is: %s, age is: %s //msg
     *  => f("info", ['tom', 18])           //调用
     *  => my name is: tom, age is 18       //调用
     * 
     * @param key key
     * @param values 格式话的值
     * @param ns 命名空间
     * @returns 
     */
    const f = (key: string, values: any[], ns?: string) => {
        let msg = ns?t(key, {ns: ns}) : t(key);
        if(values && values.length>0) {
            for(let i = 0; i<values.length; i++){
                msg = msg.replace("%s", values[i]);
            }
        }
        return msg;
    }

    return {
        t: ti,  //直接翻译
        f: f    //格式化
    }
}