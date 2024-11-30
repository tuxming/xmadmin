<template>
    <div style="--el-color-primary: green;">
        <el-config-provider :size="size" :z-index="zIndex" :locale="zhCn">
            <RouterView />
        </el-config-provider>
    </div>
</template>

<script>
import { defineComponent, provide } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { RouterLink, RouterView } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

export default defineComponent({
    components: {
      ElConfigProvider,
    },
    setup() {
        provide('theme', {
            color: 'green'
        });
        return {
            zIndex: 3000,
            size: 'default',
            zhCn: zhCn
        }
    },
})
</script>

