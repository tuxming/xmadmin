<template>
<div class="login-switch">
    <auth-button plain size="default" class="ghost-btn"
        @click="changeType(5)"
    >忘记密码</auth-button>
    <auth-button plain size="default" circle :icon="User" :type="type == 1?'primary':null"
        style="marginLeft: 15px; " class="ghost-btn" 
        :tip="t('密码登录')"
        @click="changeType(1)"
    ></auth-button>
    <auth-button plain size="default" circle  :icon="Message" :type="type == 2?'primary':null"
        style="marginLeft: 15px; ;" class="ghost-btn"
        :tip="t('邮箱登录')"
        @click="changeType(2)"
    ></auth-button>
    <auth-button plain size="default" circle  :icon="Phone" :type="type == 3?'primary':null"
        style="marginLeft: 15px; " class="ghost-btn" 
        :tip="t('手机号登录')"
        @click="changeType(3)"
    ></auth-button>
</div>
</template>

<script setup lang="ts">
import {defineEmits, defineProps} from 'vue'
import AuthButton from '@/components/AuthButton.vue'
import {
    User,
    Message,
    Phone
} from '@element-plus/icons-vue'
import useTranslation from '../../components/useTranslation'
import { AdminLogin } from '@/common/I18NNamespace'

const  {t} = useTranslation(AdminLogin);
    
const props = withDefaults(defineProps<{type: number}>(), {
    type: 1,
});

const emit = defineEmits<{
  (e: 'change-type', type: number): void
}>();

const changeType = (type: number) => {
    emit('change-type', type)
}

</script>
<style>
.login-switch{
    text-align:center;
    padding-bottom:10px;
}

.el-button.ghost-btn{ 
    background:none;
}
 
.el-button.ghost-btn *{ 
    color: rgba(255,255,255,0.8);
}
.ghost-btn:hover * {
    color: var(--el-color-primary);
}
.login-item .el-input__wrapper{
    background: rgba(255,255,255,0.65);
}
</style>