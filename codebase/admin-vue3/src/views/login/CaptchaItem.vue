

<template>
<el-input v-model="code" class="code-input">
    <template v-slot:append>
        <img :src="codeUrl" @click="refresh" style="width:100px; height:98%"/>
    </template>
</el-input>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {api} from '@/common/api.js'

// 这是3.4之前的用法
// const props = defineProps({
//   modelValue: String // 使用 modelValue 作为 v-model 的默认 prop
// })
// const emit = defineEmits(['update:modelValue'])
// const inputValue = computed({
//   get: () => props.modelValue,
//   set: (value) => emit('update:modelValue', value)
// })

//3.4之后，将上面的用法包装成defineMode()
const code = defineModel()

const codeUrl = ref(api.auth.code);
const refresh = () => {
    codeUrl.value = api.auth.code + "?" + new Date().getTime();
}
</script>

<style>
.code-input .el-input-group__append{
    padding: 0px;
}
</style>