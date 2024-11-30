<template>
    <el-steps
        :space="200"
        :active="activeIndex"
        simple
    >
        <el-step :title="t('验证')" @click="switchActive(1)" />
        <el-step :title="t('重置')" @click="switchActive(2)" />
        <el-step :title="t('结果')" @click="switchActive(3)" />
    </el-steps>

    <div style="padding: 0px 20px">
        <ForgetPasswordReset v-if="activeIndex === 2"/>
        <ForgetPasswordResult v-else-if="activeIndex === 3"/>
        <ForgetPasswordValidate v-else />
    </div>

    <div class="login-hr" v-if="activeIndex != 3" style="margin-top: 15px;" />
    <div style="text-align:center;" v-if="activeIndex != 3">
        <auth-button plain size="default" class="ghost-btn" :icon="Back">{{ t('去登录') }}</auth-button>
    </div>

</template>

<script setup lang="ts">
import {ref} from 'vue'
import AuthButton from '@/components/AuthButton.vue'
import {Back} from '@element-plus/icons-vue'
import ForgetPasswordValidate from './ForgetPasswordValidate.vue'
import ForgetPasswordReset from './ForgetPasswordReset.vue'
import ForgetPasswordResult from './ForgetPasswordResult.vue'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

const {t} = useTranslation(AdminLogin);
const activeIndex = ref(1);

const switchActive = (index: number) => {
    // console.log(index);
    activeIndex.value = index;
}

</script>

<style>
.el-radio-button--default .el-radio-button__inner{
    background: rgba(255,255,255,0.65);
}
</style>
