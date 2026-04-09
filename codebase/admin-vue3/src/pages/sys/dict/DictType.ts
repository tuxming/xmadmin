import { h, defineComponent } from 'vue';
import { Select } from 'tdesign-vue-next';
import TypeTag from '@/components/TypeTag.vue';

//值类型：0-文本，1-数值，3-图片id,  4-json
const _DictTypes = [
    {
        label: "文本",
        value: 0,
        color: "#9254de",
    },
    {
        label: "数值",
        value: 1,
        color: "#7cb305",
    },
    {
        label: "图片id",
        value: 3,
        color: "#13c2c2",
    },
    {
        label: "json",
        value: 4,
        color: "#108ee9",
    }
];

export const DictTypeSelector = defineComponent({
    name: 'DictTypeSelector',
    setup(props, { attrs }) {
        return () => h(Select, {
            options: _DictTypes,
            ...attrs
        });
    }
});

export const DictTypeTag = defineComponent({
    name: 'DictTypeTag',
    setup(props, { slots, attrs }) {
        return () => {
            const val = slots.default ? slots.default()[0].children : null;
            return h(TypeTag, {
                options: _DictTypes,
                value: val as any,
                ...attrs
            });
        };
    }
});
