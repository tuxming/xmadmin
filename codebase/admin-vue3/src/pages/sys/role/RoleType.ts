import { h, defineComponent } from 'vue';
import { Select } from 'tdesign-vue-next';
import { useDict } from '@/hooks/useDict';
import TypeTag from '@/components/TypeTag.vue';

export const RoleTypeSelector = defineComponent({
    name: 'RoleTypeSelector',
    setup(props, { attrs }) {
        const roleTypes = useDict('RoleType');
        return () => h(Select, {
            options: roleTypes.value,
            ...attrs
        });
    }
});

export const RoleTypeTag = defineComponent({
    name: 'RoleTypeTag',
    props: ['value'],
    setup(props, { attrs }) {
        const roleTypes = useDict('RoleType');
        return () => h(TypeTag, {
            options: roleTypes.value,
            value: props.value,
            ...attrs
        });
    }
});
