<template>
<div>
    <el-result
        icon="success"
        :title="t('成功')"
        :sub-title="t('新密码设置成功')"
    >
        <template #extra>
            <auth-button type="primary">{{ t('去登录') }}</auth-button>
        </template>
    </el-result>
</div>
</template>

<script setup lang="ts">
import AuthButton from '@/components/AuthButton.vue'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

const { t } = useTranslation(AdminLogin);
</script>