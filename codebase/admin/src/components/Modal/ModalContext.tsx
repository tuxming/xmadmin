

import React, { useContext, useRef, useState } from 'react';
import { Confirm, ConfirmType } from './Confirm';
import { Modal, ModalType } from './Modal';
import { useTranslation } from '../useTranslation';
import { DefaultNS } from '../../common/I18NNamespace';
import { Spin, message as AntdMessage, App } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';

/**
 * 这是自定义modal的一些与react配合使用的包装配置
 */

/**
 * 这个用来向modal的子节点传递数据的context
 */
export const ModalContext = React.createContext(null);

/**
 * 定义一个layer对象，用来定义所有的弹出成层
 */
export type LayerType = {
    message: MessageInstance,
    confirm: (confirmConfig : ConfirmType) => string,
    modal: (modalConfig : ModalType) => string,
    loading: () => string,
    destory: (key: string) => void
}

/**
 * 定义一个layer的上下文
 */
const LayerContext = React.createContext<LayerType>(null);

/**
 * 定义一个LayerProvider的引用， 方便在react生命周期外面调用，参考useRequest.ts
 */
export let layerRef:  React.MutableRefObject<LayerType> = null;

/**
 * 全局弹窗，加载中，modal
 * LayerProvider
 * @returns 
 */
export const LayerProvider = ({children}) => {
    const [modals, setModals] = useState<any>({});
    const {t} = useTranslation(DefaultNS);

    const [messageApi, contextHolder] = AntdMessage.useMessage();

    layerRef = useRef<LayerType>(null);

    const remove = (key: string) => {

        setModals(prev => {
            let keys = Object.keys(prev);
            let nms = {};
            keys.forEach(k => {
                if(key !== k) nms[k] = prev[k];
            });
            return nms;
        })

    }

    const value: LayerType = {
        message: messageApi,
        /**
         * 显示一个确认弹窗，返回该弹窗的key
         * @param confirmConfig ConfirmType
         * @returns key
         */
        confirm: (confirmConfig: ConfirmType) : string=> {
            let index = Math.random()+"";
            let onClose = () => {
                remove(index);
            }
            let confirm = <Confirm onClose={onClose} key={index} {...confirmConfig}></Confirm>
            
            setModals(prevModals => {
                return {...prevModals, [index]: confirm};
            });
            return index;
        },

        /**
         * 显示一个modal, 返回modal的key
         * @param modalConfig 
         */
        modal: (modalConfig: ModalType) : string=> {
            let index = Math.random()+"";
            let onClose = () => {
                remove(index);
            }
            let modal = <Modal onClose={onClose} key={index} {...modalConfig}></Modal>
            setModals(prevModals => {
                return {...prevModals, [index]: modal}
            });
            return index;
        },
        loading: () => {
            let index = Math.random()+"";;
            let spin = <Spin spinning tip={t("加载中...")} size='large' fullscreen />;
            setModals(prevModals => ({...prevModals, [index]: spin}));
            return index;
        },
        /**
         * @param key 销毁一个弹窗
         */
        destory: remove
    }

    layerRef.current = value;

    // console.log(JSON.stringify(modals));
    return <LayerContext.Provider value={value}>
        <>
        {contextHolder}
        {Object.values(modals)}
        {children}
        </>
    </LayerContext.Provider>
}

/**
 * 创建一个layer的hooks，
 * 在需要调用的layer的地方可以直接使用
 * eg: const layer = useLayer();
 * layer.confirm({text: "确定要删除吗"});
 * @returns 
 */
export const useLayer = () => {
    const context = useContext(LayerContext);
    if (!context) {
        throw new Error('useLayer must be used within a LayerContext');
    }
    return context;
}
