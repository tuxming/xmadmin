<template>
  <div :style="wrapperStyle">
    <div style="position: relative; margin-bottom: 15px;">
      <component :is="`h${titleLevel}`" :style="titleStyle">
        {{ t('数据权限') }}
      </component>
      <t-tooltip :content="t('添加数据权限')">
        <t-button theme="primary" shape="circle" style="position: absolute; bottom: -5px; right: 30px;" @click="onAdd">
          <template #icon><t-icon name="add" /></template>
        </t-button>
      </t-tooltip>
    </div>
    
    <div style="margin-bottom: 20px;">
      <TableComponent
        :page-size="20"
        :query="query"
        :api-url="`${api.user.dataPermissions}?type=1&id=${userId}`"
        :width="465"
        :height="250"
        :columns="userCols"
        :refresh="userRefresh"
        :on-select="onSelect"
        class="need-buttom-border"
      />
    </div>
    
    <div>
      <TableComponent
        :page-size="20"
        :query="query"
        :api-url="`${api.user.dataPermissions}?type=2&id=${userId}`"
        :width="565"
        :height="250"
        :columns="deptCols"
        :refresh="deptRefresh"
        :on-select="onSelect"
        class="need-buttom-border"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { useLayer } from '@/hooks/useLayer';
import { api } from '@/utils/api';
import TableComponent from '@/components/TableComponent.vue';
import AddUserDataForm from './AddUserDataForm.vue';
import { Button } from 'tdesign-vue-next';
import { DeleteIcon } from 'tdesign-icons-vue-next';
import { AdminUser } from '@/utils/I18NNamespace';

const props = withDefaults(defineProps<{
  userId: number;
  titleLevel?: number;
  titleStyle?: any;
  wrapperStyle?: any;
}>(), {
  titleLevel: 5
});

const { t, f } = useTranslation(AdminUser);
const request = useRequest();
const { confirm, message, destroy } = useLayer();
const showResult = useShowResult(AdminUser);

const query = ref({});
const userRefresh = ref({ reset: false, tag: 1 });
const deptRefresh = ref({ reset: false, tag: 1 });

const imgUrl = api.document.img;

const onDelete = (record: any, type: number) => {
  confirm({
    title: t('删除用户数据权限'),
    content: type === 1 ? t('确定要删除改用的用户权限？') + record.fullname : t('确定要删除该用户的组织权限？') + record.name,
    onOk: async (onClose) => {
      const result = await request.get(`${api.user.userDataDelete}?id=${record.id}`);
      showResult.show(result);
      if (result.status) {
        if (type === 1) {
          userRefresh.value = { reset: true, tag: Date.now() };
        } else {
          deptRefresh.value = { reset: true, tag: Date.now() };
        }
        onClose();
      }
    }
  });
};

const userCols: any[] = [
  {
    title: t('ID'),
    key: 'userId',
    sort: true,
    filter: true,
    width: 100,
    render: (text: any, record: any) => {
      return h('div', { style: { position: 'relative' } }, [
        text,
        h(Button, {
          theme: 'danger',
          variant: 'text',
          shape: 'square',
          style: { position: 'absolute', right: 0, top: '-4px' },
          onClick: () => onDelete(record, 1)
        }, { icon: () => h(DeleteIcon) })
      ]);
    }
  },
  {
    title: t('照片'),
    key: 'photo',
    width: 60,
    render: (text: any, record: any) => {
      if (record.photo && record.photo !== 0) {
        return h('img', { src: `${imgUrl}?id=${text}`, style: { width: '36px', height: '36px', borderRadius: '4px' } });
      } else {
        return h('div', { 
          style: { 
            width: '32px', height: '32px', borderRadius: '50%', 
            background: '#eee', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto' 
          } 
        }, record.fullname ? record.fullname.substring(0, 1).toUpperCase() : '');
      }
    }
  },
  { title: t('账号'), key: 'username', sort: true, filter: true, ellipsis: true, width: 150 },
  { title: t('姓名'), key: 'fullname', sort: true, filter: true, ellipsis: true, width: 150 }
];

const deptCols : any[] = [
  {
    title: t('ID'),
    key: 'deptId',
    sort: true,
    filter: true,
    width: 100,
    render: (text: any, record: any) => {
      return h('div', { style: { position: 'relative' } }, [
        text,
        h(Button, {
          theme: 'danger',
          variant: 'text',
          shape: 'square',
          style: { position: 'absolute', right: 0, top: '-4px' },
          onClick: () => onDelete(record, 2)
        }, { icon: () => h(DeleteIcon) })
      ]);
    }
  },
  { title: t('组织名'), key: 'name', sort: true, filter: true, ellipsis: true, width: 100, align: 'left' },
  { title: t('路径'), key: 'path', sort: true, filter: true, ellipsis: true, width: 180, align: 'left' },
  { title: t('路径名'), key: 'pathName', sort: true, filter: true, ellipsis: true, width: 180, align: 'left' }
];

const onSelect = () => {};

const onAdd = () => {
  const key = confirm({
    title: t('添加数据权限'),
    width: 400,
    content: AddUserDataForm,
    contentProps: {
      onSubmit: async (values: any) => {
        const data = {
          type: values.type,
          userId: props.userId,
          refId: values.refId as any,
        };

        const result = await request.post(api.user.userDataAdd, data);
        showResult.show(result);

        if (result.status) {
          if (values.type === 1) {
            userRefresh.value = { reset: true, tag: Date.now() };
          } else {
            deptRefresh.value = { reset: true, tag: Date.now() };
          }
          destroy(key);
        }
      },
    },
    onOk: (onClose, contentRef) => {
      contentRef?.submitForm?.();
    }
  });
};
</script>
