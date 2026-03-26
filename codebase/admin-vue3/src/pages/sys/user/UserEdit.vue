<template>
  <Modal
    :open="visible"
    :title="title"
    :width="1100"
    :show-mask="false"
    @close="onModalClose(false)"
  >
    <div class="user-edit">
      <h4 class="user-edit__title">{{ title }}</h4>
      <div class="user-edit__body">
        <t-tabs v-model="activeTab" placement="left" class="user-edit__tabs">
          <t-tab-panel value="1" :label="t('基本信息')">
            <div class="user-edit__panel">
              <UserEditBasicInfo
                :user="editUser"
                :modal-pos="modalPos"
                vertical
                @handle-change="onHandleChange"
                @update-user="doUpdate"
              />
            </div>
          </t-tab-panel>
          <t-tab-panel value="2" :label="t('账户与安全')">
            <div class="user-edit__panel">
              <UserEditSecurity
                :user="editUser"
                :modal-pos="modalPos"
                vertical
                @handle-change="onHandleChange"
              />
            </div>
          </t-tab-panel>
          <t-tab-panel value="3" :label="t('数据权限')">
            <div class="user-edit__panel">
              <UserGrantDataPermission
                :user-id="user.id"
                :title-level="5"
                :title-style="{ marginTop: '5px', marginBottom: '20px' }"
                :wrapper-style="{ paddingRight: '20px' }"
              />
            </div>
          </t-tab-panel>
          <t-tab-panel value="4" :label="t('角色')">
            <div class="user-edit__panel">
              <UserGrantRole
                :user-id="user.id"
                :title-level="5"
                :title-style="{ marginTop: '5px', marginBottom: '20px' }"
                :wrapper-style="{ paddingRight: '20px' }"
              />
            </div>
          </t-tab-panel>
        </t-tabs>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, inject } from 'vue';
import Modal from '@/components/Modal/index.vue';
import { useTranslation } from '@/hooks/useTranslation';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { api } from '@/utils/api';
import UserEditBasicInfo from './UserEditBasicInfo.vue';
import UserEditSecurity from './UserEditSecurity.vue';
import UserGrantDataPermission from './UserGrantDataPermission.vue';
import UserGrantRole from './UserGrantRole.vue';
import { AdminUser } from '@/utils/I18NNamespace';
import { useUserStore } from '@/store/modules/user';

const props = defineProps<{
  user: any;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close', refresh: boolean): void;
  (e: 'update:open', val: boolean): void;
}>();

const { t } = useTranslation(AdminUser);
const request = useRequest();
const showResult = useShowResult(AdminUser);
const userStore = useUserStore();

const visible = ref(props.open);
const title = ref(`${t('编辑用户')}:${props.user.fullname}`);
const editUser = reactive({ ...props.user });
const activeTab = ref('1');

const modalPos = inject<any>('modalContext', null);

watch(() => props.open, (val) => {
  visible.value = val;
});

const onModalClose = (refresh: boolean) => {
  visible.value = false;
  emit('update:open', false);
  setTimeout(() => {
    emit('close', refresh);
  }, 300);
};

const doUpdate = async (updateUser: any, key: string) => {
  const result = await request.post(api.user.update, updateUser);
  showResult.show(result);
  if (result.status) {
    if (key === 'token') {
      editUser[key] = result.data;
    }
    if (userStore.userInfo && userStore.userInfo.id === editUser.id) {
      const info = await request.get(api.user.userInfo);
      if (info && info.status && info.data) {
        userStore.setUserInfo(info.data);
      }
    }
  }
};

const onHandleChange = (key: string, newValue: any) => {
  let updateUser: any = { id: props.user.id };
  
  if (key === 'token') {
    updateUser['refreshToken'] = true;
  } else if (key === 'deptId') {
    Object.assign(editUser, newValue);
    updateUser[key] = newValue.value;
  } else if (key === 'password') {
    updateUser['password'] = newValue.password;
    updateUser['newPassword'] = newValue.newPassword;
    updateUser['rePassword'] = newValue.rePassword;
  } else if (key === 'photo') {
    updateUser['photo'] = newValue;
  } else {
    updateUser[key] = newValue;
    editUser[key] = newValue;
  }

  doUpdate(updateUser, key);
};
</script>

<style scoped>
.user-edit {
  height: 100%;
  overflow: hidden;
}

.user-edit__title {
  margin: 16px 0 14px;
  text-align: center;
  box-sizing: content-box;
}

.user-edit__body {
  height: calc(100% - 60px);
  overflow: auto;
}

.user-edit__tabs {
  height: 100%;
}

.user-edit__panel {
  padding: 16px 18px;
  min-width: 0;
}

.user-edit__tabs :deep(.t-tabs) {
  height: 100%;
}

.user-edit__tabs :deep(.t-tabs__nav) {
  width: 129px;
}

.user-edit__tabs :deep(.t-tabs__content) {
  min-width: 0;
  overflow-x: hidden;
}

.user-edit__tabs :deep(.t-descriptions) {
  width: 100%;
}

.user-edit__tabs :deep(.t-descriptions__content) {
  min-width: 0;
}

.user-edit__tabs :deep(.t-descriptions__label) {
  width: 90px;
  white-space: nowrap;
}
</style>
