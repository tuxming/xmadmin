import { h, defineComponent } from 'vue';
import { Select } from 'tdesign-vue-next';
import { useDict } from '@/hooks/useDict';
import TypeTag from '@/components/TypeTag.vue';

export const DictTypeSelector = defineComponent({
  name: 'DictTypeSelector',
  setup(props, { attrs }) {
    const dictTypes = useDict('DictType');
    return () => h(Select, {
      options: dictTypes.value,
      ...attrs
    });
  }
});

export const DictTypeTag = defineComponent({
  name: 'DictTypeTag',
  props: ['value'],
  setup(props, { attrs }) {
    const dictTypes = useDict('DictType');
    return () => h(TypeTag, {
      options: dictTypes.value,
      value: props.value,
      ...attrs
    });
  }
});
