import { h, defineComponent } from 'vue';
import { Select } from 'tdesign-vue-next';
import { useDict } from '@/hooks/useDict';
import TypeTag from '@/components/TypeTag.vue';

export const DeptTypeSelector = defineComponent({
    name: 'DeptTypeSelector',
    setup(props, { attrs }) {
        const deptTypes = useDict('DeptType');
        return () => h(Select, {
            options: deptTypes.value,
            ...attrs
        });
    }
});

export const DeptTypeTag = defineComponent({
    name: 'DeptTypeTag',
    props: ['value'],
    setup(props, { attrs }) {
        const deptTypes = useDict('DeptType');
        return () => h(TypeTag, {
            options: deptTypes.value,
            value: props.value,
            ...attrs
        });
    }
});
