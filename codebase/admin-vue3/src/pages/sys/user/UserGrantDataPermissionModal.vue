<template>
    <Modal :open="visible" :width="1000" :height="800" @close="onModalClose">
        <div style="height: 100%; overflow: auto;">
            <UserGrantDataPermission :user-id="userId" :title-level="4"
                :title-style="{ textAlign: 'center', margin: '25px 0 15px 0' }"
                :wrapper-style="{ paddingLeft: '20px', paddingRight: '20px' }" />
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '@/components/Modal/index.vue';
import UserGrantDataPermission from './UserGrantDataPermission.vue';

const props = defineProps<{
    open: boolean;
    userId: number;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'update:open', val: boolean): void;
}>();

const visible = ref(props.open);

watch(() => props.open, (val) => {
    visible.value = val;
});

const onModalClose = () => {
    visible.value = false;
    emit('update:open', false);
    setTimeout(() => {
        emit('close');
    }, 500);
};
</script>
