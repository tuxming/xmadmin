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