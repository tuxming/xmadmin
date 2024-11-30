<template>
<el-input v-model="code" class="code-input1">
    <template #append>
        <el-button v-if="!isCounting" :icon="Promotion" @click="sendCode"/>
        <span v-else>{{countdown}}s</span>
    </template>
</el-input>
</template>

<script lang="ts" setup>
import {
    Promotion
} from '@element-plus/icons-vue'
import {ref, onUnmounted} from 'vue'
import {Request} from '../../components/Request'
import { showResult } from '@/components/ShowResult';
import { DefaultNS } from '@/common/I18NNamespace';

const props = defineProps<{validate: ()=>string}>();

const code = defineModel()
const countdown = ref(60);
const isCounting = ref(false);

const sendCode = () => {
    let url = props.validate();
    if(!url) return;

    const get = async () => {
        let result = await Request.get(url);
        showResult(result as any, DefaultNS);
        if(result.status){
            isCounting.value = false;
            startCountdown();
        }
    }
    get();
}

const startCountdown = () => {
    if (isCounting.value) return; // 如果已经在倒计时，阻止再次点击

    isCounting.value = true;
    countdown.value = 60;

    const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
            isCounting.value = false;
        }
    }, 1000);

    // 清理定时器，防止内存泄漏
    onUnmounted(() => {
        clearInterval(timer);
    });
};

</script>

<style>
.code-input1 .el-button{
    background: none;
}
</style>