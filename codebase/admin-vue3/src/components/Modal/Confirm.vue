<template>
    <Modal :open="visible" :theme="themeStore.theme" type="modal" :show-move="true" :show-resize="false"
        :show-maxize="false" :show-minize="false" :width="width" :height="height" @close="onModalClose">
        <div style="padding: 15px; text-align: center;">
            <div v-if="title" style="font-weight: bold; margin-bottom: 15px; display: block;">
                <slot name="title">{{ title }}</slot>
            </div>
            <div :style="{ maxHeight: globalStore.height / 3 + 'px', overflowY: 'auto' }">
                <p v-if="typeof content === 'string'" style="margin: 30px 15px 15px 15px;">{{ content }}</p>
                <component v-else :is="content" v-bind="contentProps" ref="contentRef" />
            </div>
            <t-divider />
            <div style="text-align: right;">
                <t-button v-if="showCancel" theme="default" @click="onClickCancel">{{ t('取消') }}</t-button>
                <t-button v-if="showOk" theme="primary" style="margin-left: 20px;" @click="onClickOk">{{ t('确定')
                    }}</t-button>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeStore } from '@/store/modules/theme';
import { useGlobalStore } from '@/store/modules/global';
import Modal from './index.vue';

interface Props {
    title?: string;
    content: string | any;
    showOk?: boolean;
    showCancel?: boolean;
    open?: boolean;
    contentProps?: Record<string, any>;
    width?: number | string;
    height?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
    showOk: true,
    showCancel: true,
    open: true,
});

const emit = defineEmits<{
    (e: 'ok', close: () => void, contentRef?: any): void;
    (e: 'cancel'): void;
    (e: 'close'): void;
    (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation();
const themeStore = useThemeStore();
const globalStore = useGlobalStore();

const visible = ref(props.open);
const contentRef = ref<any>(null);

watch(() => props.open, (val) => {
    visible.value = val;
});

const onModalClose = () => {
    visible.value = false;
    emit('update:open', false);
    setTimeout(() => {
        emit('close');
    }, 300);
};

const onClickCancel = () => {
    onModalClose();
    setTimeout(() => {
        emit('cancel');
    }, 300);
};

const onClickOk = () => {
    emit('ok', () => {
        onModalClose();
    }, contentRef.value);
};
</script>
