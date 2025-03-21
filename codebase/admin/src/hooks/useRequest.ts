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

import Axios, { AxiosInstance, AxiosRequestConfig} from 'axios';
import { message, Modal } from 'antd';
import {api} from '../common/api'
import { layerRef, useLayer } from '../components/Modal';

export const jsonHeaders = {
    "Content-Type" : "application/json; charset=utf-8",
    "X-Requested-With": "XMLHttpRequest",
}

export const wwwHeaders = {
    "Content-Type" : "application/x-www-form-urlencoded",
    "X-Requested-With": "XMLHttpRequest",
};

export const multipartHeader = {
    "Content-Type" : "multipart/form-data",
    "X-Requested-With": "XMLHttpRequest",
}    

export type RequestHeader = {
    [key: string] : string
}

export type ResposeDataType = {
    status: boolean,
    code?: string,
    msg? : string,
    format?: boolean,
    args?: string[],
    data?: any
}

// export interface Response<ResposeDataType> extends AxiosResponse<ResposeDataType>{
//     msg?: string,
// }

export interface RequestInstance extends AxiosInstance{
    get<R = ResposeDataType>(url: string, config?: AxiosRequestConfig): Promise<R>;
    post<R = ResposeDataType>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
}

//错误处理
const handlerError = (error) => {
    // loading.end();
    try{
        const { status } = error.response;
        if(status!=200){
            message.error("网络请求错误，请检查网络连接");
        }else{
            if(error.response){
                message.error(error.response.data);
            }else{
                message.error("未知错误");
            }
        }
        
    }catch(err){
        // message.error(error);
    }
}

const goLogin = () => {
    Modal.error({
        content: "登录过期",
        okText: "去登录",
        onOk: ()=>{
            window.location.href= api.loginPage;
        }
    });
}

/**
 * 
 * @param backend 是否后台请求，如果是后台请求，则没有加载中的显示
 * @returns 
 */
export const useRequest = () => {

    let loading = null, destory = null;
    try{
        let layer = useLayer();
        loading = layer.loading;
        destory = layer.destory;
    }catch(err){
        //useLayer是在react的Context中，所以，如果useRequest是在React内部使用，可以正常拿到layer对象，
        //如果不是就会拿不到layer对象，这时候我们可以通过layerRef这个全局引用获取
        // console.error(err);
        loading = layerRef.current.loading;
        destory = layerRef.current.destory;
    }

    const getInstance = (headers: RequestHeader, backend:boolean) => {
        const instance: RequestInstance = Axios.create({
            ...headers,
            timeout: 600 * 1000,
             // `withCredentials` 表示跨域请求时是否需要使用凭证
            withCredentials: true, // default
        });

        let loadingKey = null;

        //拦截器错误回调
        const interceptorErr = (error) => {
            if(backend){
                loadingKey = loading();
            }
            // handlerError(error);

            const { response } = error;
                if (response) {
                    // 服务器返回了错误响应
                    return {
                        code: '500',
                        status: false,
                        msg: response.data.message || response.statusText,
                        data: null
                    };
            } else {
                // 服务器未响应（例如网络错误）
                return {
                    code: '500',
                    status: false,
                    msg: error.message,
                    data: null
                };
            }
        } 

        //请求拦截器
        instance.interceptors.request.use((config)=>{
            if(backend && loadingKey){
                destory(loadingKey);
            }
            return config;
        }, (error) => {
            interceptorErr(error);
        });
        
        //返回拦截器
        instance.interceptors.response.use((response) => {
            // console.log(response);
            if(backend && loadingKey){
                destory(loadingKey);
            }
            if(!response.data.status && response.data.code == '1' || response.data.code == '2'){
                goLogin();
            }

            // if(!response.data.status){
            //     console.log(111);
            //     message.error(response.data.msg);
            // }

            return response.data;
        }, interceptorErr);
        return instance;
    }

    const get = (url: string, backend = false) => {
        return getInstance(wwwHeaders, backend).get(url);
    }

    const post = (url: string, data: any, headers: RequestHeader = jsonHeaders, backend=false) => {
        return getInstance(headers, backend).post(url, data);
    }

    return {
        get: get,
        post: post
    };
}
