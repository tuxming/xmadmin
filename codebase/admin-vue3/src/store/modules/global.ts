import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('global', {
    state: () => ({
        isMinScreen: document.body.clientWidth < 576,
        width: document.body.clientWidth,
        height: document.body.clientHeight,
        windowIndex: 500,
        modalIndex: 2000,
    }),
    actions: {
        changeSize(payload: { width: number; height: number }) {
            this.width = payload.width;
            this.height = payload.height;
            this.isMinScreen = payload.width < 576;
        },
        addWindowZIndex() {
            this.windowIndex += 1;
        },
        addModalZIndex() {
            this.modalIndex += 1;
        }
    }
});
