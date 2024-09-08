import Axios, { AxiosInstance, AxiosRequestConfig} from 'axios';
import { message, Modal } from 'antd';
import {api} from '../common/api'
import { layerRef, useLayer } from './Modal';

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

    const getIntance = (headers: RequestHeader, backend:boolean) => {
        const instance: RequestInstance = Axios.create({
            ...headers,
            timeout: 180 * 1000,
             // `withCredentials` 表示跨域请求时是否需要使用凭证
            withCredentials: true, // default
        });

        let loadingKey = null;

        //拦截器错误回调
        const interceptorErr = (error) => {
            if(backend){
                loadingKey = loading();
            }
            handlerError(error);
            return Promise.reject(error);
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
        return getIntance(wwwHeaders, backend).get(url);
    }

    const post = (url: string, data: any, headers: RequestHeader = jsonHeaders, backend=false) => {
            return getIntance(headers, backend).post(url, data);
    }

    return {
        get: get,
        post: post
    };
}
