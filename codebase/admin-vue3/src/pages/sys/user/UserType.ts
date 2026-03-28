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
  setup(props, { slots, attrs }) {
    const userStatus = useDict('UserStatus');
    return () => {
      const val = slots.default ? slots.default()[0].children : null;
      return h(TypeTag, {
        options: userStatus.value,
        value: val as any,
        // variant: 'outline',
        // 如果想强制使用 primary theme，取消下面这行的注释
        // theme: 'primary',
        ...attrs 
      });
    };
  }
});
