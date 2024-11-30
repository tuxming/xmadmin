<template>

<template v-if="tip">
    <el-tooltip v-if="!permission || isPermission()" effect="dark" :content="tip" :placement="tipPlacement">
        <el-button v-bind="myAttrs">
            <template #default v-if="slots.default">
                <slot name="default"></slot>
            </template>
            <template #loading v-if="slots.loading">
                <slot name="loading"></slot>
            </template>
            <template #icon v-if="slots.icon">
                <slot name="icon"></slot>
            </template>
        </el-button>
    </el-tooltip>
</template>
<template v-else>
    <el-button v-bind="myAttrs">
        <template #default v-if="slots.default">
            <slot name="default"></slot>
        </template>
        <template #loading v-if="slots.loading">
            <slot name="loading"></slot>
        </template>
        <template #icon v-if="slots.icon">
            <slot name="icon"></slot>
        </template>
    </el-button>
</template>

</template>

<script setup lang="ts">
import { defineProps, withDefaults, useSlots, useAttrs,
    computed, inject
} from 'vue';

interface AuthButtonProps {
    permission?: string | null,
    tip?: string | null
    tipPlacement?: string | null,
}

const props = withDefaults(defineProps<AuthButtonProps>(), {
    permission: null,
    tip: null,
    tipPlacement: 'bottom',
});

const attrs = useAttrs();
defineOptions({
  inheritAttrs: false
})

const theme = inject('theme') as any;
const myAttrs = computed(()=>{
    const myAttrs = {...attrs}
    if(myAttrs.type && myAttrs.type == 'primary'){
        myAttrs['color'] = theme.color;
        // if(!myAttrs['class']){
        //     myAttrs['class'] = 'el-button-my';
        // }else{
        //     myAttrs.class = myAttrs.class+' el-button-my';
        // }
        delete myAttrs.type;
    }
    return myAttrs;
});

const slots = useSlots()

//判断是否具备权限
const isPermission = ():boolean => {

    if(!props.permission){
        return true;
    }

    return true;
}

</script>
<style>
.el-button-my * {
    color: var(--el-color-primary);
    fill: var(--el-color-primary);
}
</style>