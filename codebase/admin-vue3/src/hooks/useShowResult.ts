import { useLayer } from './useLayer';
import type { ResposeDataType } from './useRequest';
import { useTranslation } from './useTranslation';
import { h } from 'vue';

// 全局记录已显示的消息及其最后显示时间，用于防抖相同消息
const displayedMessages = new Map<string, number>();
const MESSAGE_THROTTLE_MS = 3000;

export const useShowResult = (i18namespace: string) => {
    const { message } = useLayer();
    const { t } = useTranslation(i18namespace);
    
    // a simple format function for arguments
    const f = (msg: string | undefined, args: string[]) => {
        if (!msg) return '';
        let result = t(msg);
        args.forEach((arg, index) => {
            result = result.replace(`{${index}}`, arg);
        });
        return result;
    };

    const showMsg = (type: 'success' | 'warning' | 'error' | 'info', content: string) => {
        const now = Date.now();
        const lastTime = displayedMessages.get(content) || 0;
        
        if (now - lastTime > MESSAGE_THROTTLE_MS) {
            displayedMessages.set(content, now);
            message[type](content);
            
            // 清理过期的记录防止内存泄漏
            setTimeout(() => {
                if (displayedMessages.get(content) === now) {
                    displayedMessages.delete(content);
                }
            }, MESSAGE_THROTTLE_MS);
        }
    };

    const show = (result: ResposeDataType) => {
        if (result.code === '600') {
            const nodes = Object.keys(result.data).map(key => {
                const rawMsg = String(result.data[key] ?? '');
                const ks = key.split(',');
                const title = ks.length > 1 ? `${t(ks[0])}（${ks[1]}）` : t(key);
                const idx = rawMsg.indexOf(' : ');
                const msg = idx > -1 ? `${t(rawMsg.slice(0, idx))} : ${rawMsg.slice(idx + 3)}` : rawMsg;
                return h('div', [h('strong', `${title}：`), msg]);
            });
            message.info({
                content: () => h('div', { style: { maxHeight: '280px', overflowY: 'auto', paddingRight: '8px' } }, nodes),
            });
        } else {
            if (result.status) {
                if (result.args && result.args.length > 0) {
                    showMsg('warning', f(result.msg, result.args));
                } else {
                    showMsg('success', t(result.msg || '操作成功'));
                }
            } else {
                if (result.args && result.args.length > 0) {
                    showMsg('warning', f(result.msg, result.args));
                } else if (result.code === '500') {
                    showMsg('error', result.msg || '系统错误');
                } else {
                    if (result.code === '10') {
                        showMsg('warning', t(result.msg || '操作失败'));
                    } else {
                        showMsg('warning', t(result.msg || '操作失败'));
                    }
                }
            }
        }
    }

    return {
        show
    };
}
