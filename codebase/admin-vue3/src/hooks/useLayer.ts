import { ref, markRaw, defineAsyncComponent } from 'vue';
import { MessagePlugin, LoadingPlugin } from 'tdesign-vue-next';

const Confirm = defineAsyncComponent(() => import('@/components/Modal/Confirm.vue'));
const Modal = defineAsyncComponent(() => import('@/components/Modal/index.vue'));

export interface LayerConfirmType {
  title?: string;
  content: string | any;
  showOk?: boolean;
  showCancel?: boolean;
  onOk?: (close: () => void, contentRef?: any) => void;
  onCancel?: () => void;
  contentProps?: Record<string, any>;
  width?: number | string;
  height?: number | string;
}

export interface LayerModalType {
  title?: string;
  width?: number | string;
  height?: number | string;
  state?: 'win' | 'min' | 'full';
  showMask?: boolean;
  closeMask?: boolean;
  zIndex?: number;
  theme?: 'dark' | 'light';
  btnColor?: string;
  btnHoverColor?: string;
  showResize?: boolean;
  showMove?: boolean;
  showMaxize?: boolean;
  showMinize?: boolean;
  type?: 'window' | 'modal';
  content?: any;
  contentProps?: Record<string, any>;
  onClose?: () => void;
  onSizeChange?: (pos: any) => void;
}

export interface LayerType {
  message: typeof MessagePlugin;
  confirm: (config: LayerConfirmType) => string;
  modal: (config: LayerModalType) => string;
  loading: () => string;
  destroy: (key: string) => void;
}

// 全局弹窗状态
export const layerState = ref<Record<string, { type: 'confirm' | 'modal' | 'loading', component?: any, props: any }>>({});

export const useLayer = (): LayerType => {
  const destroy = (key: string) => {
    if (layerState.value[key]) {
      if (layerState.value[key].type === 'loading') {
        const loadingInstance = layerState.value[key].props.instance;
        if (loadingInstance) {
          loadingInstance.hide();
        }
      }
      delete layerState.value[key];
    }
  };

  const confirm = (config: LayerConfirmType): string => {
    const key = Math.random().toString();
    // Confirm 的 content 支持传组件对象（例如 AddUserDataForm）。如果把组件对象放进响应式 layerState，
    // Vue 会尝试将组件变成 reactive 并触发警告：Vue received a Component that was made a reactive object。
    // 用 markRaw 明确告诉 Vue 不要对组件对象做响应式代理，这是“根因修复”而不是屏蔽 warn。
    const rawContent = typeof config.content === 'string' ? config.content : markRaw(config.content);
    const props = {
      ...config,
      content: rawContent,
      open: true,
      onClose: () => {
        if (config.onCancel) config.onCancel();
        destroy(key);
      },
      onCancel: () => {
        if (config.onCancel) config.onCancel();
      },
      onOk: (closeFn: () => void, contentRef?: any) => {
        if (config.onOk) {
          config.onOk(() => {
            closeFn();
            destroy(key);
          }, contentRef);
        } else {
          closeFn();
          destroy(key);
        }
      }
    };
    
    layerState.value[key] = {
      type: 'confirm',
      component: markRaw(Confirm),
      props
    };
    return key;
  };

  const modal = (config: LayerModalType): string => {
    const key = Math.random().toString();
    const props = {
      ...config,
      open: true,
      onClose: () => {
        if (config.onClose) config.onClose();
        destroy(key);
      }
    };
    
    layerState.value[key] = {
      type: 'modal',
      component: markRaw(Modal),
      props
    };
    return key;
  };

  const loading = (): string => {
    const key = Math.random().toString();
    const instance = LoadingPlugin({
      fullscreen: true,
      text: '加载中...',
      size: 'large'
    });
    
    layerState.value[key] = {
      type: 'loading',
      props: { instance }
    };
    return key;
  };

  return {
    message: MessagePlugin,
    confirm,
    modal,
    loading,
    destroy
  };
};

// 暴露一个可以在非组件上下文中使用的实例
export const layerRef = useLayer();
