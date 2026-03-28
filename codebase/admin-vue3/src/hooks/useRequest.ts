import Axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { DialogPlugin } from 'tdesign-vue-next';
import { api } from '@/utils/api';
import { useLayer } from './useLayer';
import { useUserStore } from '@/store';

export const jsonHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "X-Requested-With": "XMLHttpRequest",
}

export const wwwHeaders = {
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Requested-With": "XMLHttpRequest",
};

export const multipartHeader = {
    "Content-Type": "multipart/form-data",
    "X-Requested-With": "XMLHttpRequest",
}

export type RequestHeader = {
    [key: string]: string
}

export type ResposeDataType = {
    status: boolean,
    code?: string,
    msg?: string,
    format?: boolean,
    args?: string[],
    data?: any
}

export interface RequestInstance extends AxiosInstance {
    get<R = ResposeDataType>(url: string, config?: AxiosRequestConfig): Promise<R>;
    post<R = ResposeDataType>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R>;
}

let isLoginPromptOpen = false;

const clearAuth = () => {
    try {
        const userStore = useUserStore();
        userStore.logout();
    } catch (e) {
        console.warn('Failed to clear pinia store', e);
    }
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    document.cookie = `jwtToken=; path=/; max-age=0`;
    document.cookie = `jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

const goLogin = () => {
    clearAuth();
    if (window.location.pathname.includes(api.loginPage) || window.location.hash.includes(api.loginPage)) {
        return;
    }
    if (isLoginPromptOpen) {
        return;
    }
    isLoginPromptOpen = true;
    DialogPlugin.confirm({
        header: '提示',
        body: '登录过期，请重新登录',
        confirmBtn: '去登录',
        cancelBtn: null,
        onConfirm: () => {
            clearAuth();
            window.location.href = api.loginPage;
            isLoginPromptOpen = false;
        },
        onClose: () => {
            isLoginPromptOpen = false;
        }
    });
}

let lastNetworkErrorTime = 0;

export const useRequest = () => {
    // Vue3 中可以使用 TDesign 的 LoadingPlugin
    // const loading = LoadingPlugin;

    const getInstance = (headers: RequestHeader, backend: boolean) => {
        const instance = Axios.create({
            ...headers,
            timeout: 600 * 1000,
            withCredentials: true,
        }) as RequestInstance;

        let loadingKey: any = null;

        const interceptorErr = (error: any) => {
            if (backend && loadingKey) {
                // hide loading
            }
            const { response } = error;
            if (response) {
                return {
                    code: '500',
                    status: false,
                    msg: response.data?.message || response.statusText,
                    data: null
                };
            } else {
                const now = Date.now();
                if (now - lastNetworkErrorTime > 3000) {
                    useLayer().message.error('网络错误请联系管理员');
                    lastNetworkErrorTime = now;
                }
                return {
                    code: '500',
                    status: false,
                    msg: error.message,
                    data: null
                };
            }
        }

        instance.interceptors.request.use((config) => {
            if (backend) {
                // show loading
            }
            return config;
        }, (error) => {
            return interceptorErr(error);
        });

        instance.interceptors.response.use((response) => {
            if (backend && loadingKey) {
                // hide loading
            }
            const data = response.data as ResposeDataType;
            
            if (!data.status && (data.code === '1' || data.code === '2')) {
                goLogin();
            }

            return data as any;
        }, interceptorErr);
        
        return instance;
    }

    const get = (url: string, backend = false): Promise<ResposeDataType> => {
        return getInstance(wwwHeaders, backend).get(url);
    }

    const post = (url: string, data: any, headers: RequestHeader = jsonHeaders, backend = false): Promise<ResposeDataType> => {
        return getInstance(headers, backend).post(url, data);
    }

    return {
        get,
        post
    };
}
