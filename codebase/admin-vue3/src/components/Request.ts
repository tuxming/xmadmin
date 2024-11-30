import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ElMessage, ElMessageBox, ElLoading  } from "element-plus";
import type { Action } from 'element-plus'
import {api} from '@/common/api'

/**
 * axios的封装
 * 使用方法：
 * request.get()
 * request.post();
 */


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
            ElMessage({
                message: '网络请求错误，请检查网络连接',
                type: 'error',
                plain: true,
            })
        }else{
            if(error.response){
                 ElMessage({
                    message: error.response.data,
                    type: 'error',
                    plain: true,
                })
            }else{
                ElMessage({
                    message: "未知错误",
                    type: 'error',
                    plain: true,
                })
            }
        }
        
    }catch(err){
        // message.error(error);
    }
}


const goLogin = () => {
    ElMessageBox.alert('登录过期', '提示', {
        // if you want to disable its autofocus
        // autofocus: false,
        confirmButtonText: '去登录',
        callback: (action: Action) => {
            window.location.href= api.loginPage;
        },
    })
}

const getInstance = (headers: RequestHeader, backend: boolean) => {

    let loading = null

    const instance: AxiosInstance = axios.create({
        ...headers,
        timeout: 600*1000,
        withCredentials: true
    });

    //拦截器错误回调
    const interceptorErr = (error) => {
        if(backend){
            loading = ElLoading.service({
                lock: true,
                text: '加载中...',
                background: 'rgba(0, 0, 0, 0.7)',
              })
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
        if(loading){
            loading.close();
        }
        return config;
    }, (error) => {
        interceptorErr(error);
    });

    //返回拦截器
    instance.interceptors.response.use((response) => {
        // console.log(response);
        if(loading){
            loading.close();
        }
        if(!response.data.status && response.data.code == '1' || response.data.code == '2'){
            goLogin();
        }

        return response.data;
    }, interceptorErr);

    return instance;
}

export const get = (url: string, backend = false) => {
    return getInstance(wwwHeaders, backend).get(url);
}

export const post = (url: string, data: any, headers: RequestHeader = jsonHeaders, backend=false) => {
    return getInstance(headers, backend).post(url, data);
}

export default {
    get: get,
    post: post
};



