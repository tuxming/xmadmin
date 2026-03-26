import { h, defineComponent } from 'vue';
import { useDict } from '@/hooks/useDict';
import TypeTag from '@/components/TypeTag.vue';

export interface UserProps {
  id?: number;
  username?: string;
  fullname?: string;
  password?: string;
  repassword?: string;
  gender?: number;
  email?: string;
  phone?: string;
  photo?: any;
  deptId?: number;
  status?: number;
  deptName?: string;
  [key: string]: any;
}

export const UserStatusTag = defineComponent({
  name: 'UserStatusTag',
  props: ['value'],
  setup(props, { attrs }) {
    const userStatus = useDict('UserStatus');
    return () => h(TypeTag, {
      options: userStatus.value,
      value: props.value,
      ...attrs
    });
  }
});
