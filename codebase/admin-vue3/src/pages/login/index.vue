<template>
  <div class="login-bg-img">
    <div class="login-bg-color">
      <div class="login-wrap">
        <div class="login-head">
          <t-icon name="logo-codepen" size="80px" class="login-logo-path" />
          <span class="login-title">XmAdmin后台管理</span>
        </div>
        
        <div class="login-container" v-if="pageType === 'login'">
          <div class="login-part-title">{{ t('登录') }}</div>
          
          <t-form
            ref="form"
            :data="formData"
            class="item-container"
            :rules="rules"
            @submit="onSubmit"
            label-width="80px"
            style="padding: 0 20px"
          >
            <!-- Login Type Tabs (Account / Email / Phone) -->
            <template v-if="loginType === 'account'">
              <t-form-item :label="t('用户名')" name="username">
                <t-input v-model="formData.username" size="large" :placeholder="t('请输入账号')" autocomplete="username">
                  <template #prefix-icon><t-icon name="user" /></template>
                </t-input>
              </t-form-item>

              <t-form-item :label="t('密码')" name="password">
                <t-input v-model="formData.password" size="large" type="password" clearable :placeholder="t('请输入密码')" autocomplete="current-password">
                  <template #prefix-icon><t-icon name="lock-on" /></template>
                </t-input>
              </t-form-item>
            </template>
            
            <template v-else-if="loginType === 'mail'">
              <t-form-item :label="t('邮件地址')" name="email">
                <t-input v-model="formData.email" size="large" :placeholder="t('请输入邮件地址')">
                  <template #prefix-icon><t-icon name="user" /></template>
                </t-input>
              </t-form-item>
              
              <t-form-item :label="t('邮件验证码')" name="mailCode">
                <t-input v-model="formData.mailCode" size="large" :placeholder="t('请输入邮件验证码')">
                  <template #suffix>
                    <t-button variant="text" size="small" :disabled="!canSendCode" @click="sendCode('mail')">
                      <template #icon v-if="canSendCode"><t-icon name="send" /></template>
                      {{ codeText }}
                    </t-button>
                  </template>
                </t-input>
              </t-form-item>
            </template>
            
            <template v-else-if="loginType === 'phone'">
              <t-form-item :label="t('手机号')" name="telephone">
                <t-input v-model="formData.telephone" size="large" :placeholder="t('请输入手机号')">
                  <template #prefix-icon><t-icon name="user" /></template>
                </t-input>
              </t-form-item>
              
              <t-form-item :label="t('短信验证码')" name="phoneCode">
                <t-input v-model="formData.phoneCode" size="large" :placeholder="t('请输入短信验证码')">
                  <template #suffix>
                    <t-button variant="text" size="small" :disabled="!canSendCode" @click="sendCode('phone')">
                      <template #icon v-if="canSendCode"><t-icon name="send" /></template>
                      {{ codeText }}
                    </t-button>
                  </template>
                </t-input>
              </t-form-item>
            </template>

            <!-- Common Captcha -->
            <t-form-item :label="t('验证码')" name="code" v-if="loginType === 'account' || loginType === 'mail' || loginType === 'phone'">
              <div style="display: flex; align-items: flex-start; width: 100%;">
                <t-input v-model="formData.code" size="large" :placeholder="t('请输入验证码')" style="border-top-right-radius: 0; border-bottom-right-radius: 0; flex: 1; width: 0;">
                </t-input>
                <img :src="codeUrl" style="height: 40px; width: 120px; cursor: pointer; border-radius: 0 4px 4px 0; object-fit: cover; flex-shrink: 0;" @click="refreshCaptcha" />
              </div>
            </t-form-item>

            <div style="padding: 5px 15px 15px 15px; text-align: center;">
              <t-button block size="large" type="submit" style="width: 100%" :loading="loading"> {{ t('登录') }} </t-button>
            </div>
          </t-form>

          <div class="login-hr"></div>
          
          <div class="other-login">
            <t-button variant="text" theme="default" @click="pageType = 'forget'">{{ t('忘记密码') }}</t-button>
            <t-tooltip :content="t('账号密码登录')">
              <t-button shape="circle" variant="text" theme="primary" style="margin-left: 15px;" @click="loginType = 'account'" :ghost="loginType !== 'account'">
                <icon-font name="user" />
              </t-button>
            </t-tooltip>
            <t-tooltip :content="t('邮件登录')">
              <t-button shape="circle" variant="text" theme="primary" style="margin-left: 15px; margin-right: 15px;" @click="loginType = 'mail'" :ghost="loginType !== 'mail'">
                <icon-font name="mail" />
              </t-button>
            </t-tooltip>
            <t-tooltip :content="t('电话登录')">
              <t-button shape="circle" variant="text" theme="primary" @click="loginType = 'phone'" :ghost="loginType !== 'phone'">
                <icon-font name="call" />
              </t-button>
            </t-tooltip>
          </div>
        </div>

        <!-- Forget Password Panel -->
        <div class="login-container" v-else>
          <div class="login-part-title">{{ t('找回密码') }}</div>
          <t-steps :current="forgetStep" style="padding: 0 15px 15px 15px">
            <t-step-item :title="t('验证')" />
            <t-step-item :title="t('重置')" />
            <t-step-item :title="t('结果')" />
          </t-steps>
          
          <div class="login-form-wrap" style="padding: 0 20px; min-height: 200px;">
            <!-- Step 1: Validate Info -->
            <t-form v-if="forgetStep === 0" ref="forgetFormRef" :data="forgetData" :rules="forgetRules" @submit="onForgetNext" label-width="80px">
              <t-form-item :label="t('邮件地址')" name="account">
                <t-input v-model="forgetData.account" size="large" :placeholder="t('请输入邮件地址')">
                  <template #prefix-icon><t-icon name="user" /></template>
                </t-input>
              </t-form-item>
              
              <t-form-item :label="t('验证码')" name="captcha">
                <div style="display: flex; align-items: flex-start; width: 100%;">
                  <t-input v-model="forgetData.captcha" size="large" :placeholder="t('请输入验证码')" style="border-top-right-radius: 0; border-bottom-right-radius: 0; flex: 1; width: 0;">
                  </t-input>
                  <img :src="codeUrl" style="height: 40px; width: 120px; cursor: pointer; border-radius: 0 4px 4px 0; object-fit: cover; flex-shrink: 0;" @click="refreshCaptcha" />
                </div>
              </t-form-item>

              <t-form-item :label="t('邮件验证码')" name="code">
                <t-input v-model="forgetData.code" size="large" :placeholder="t('请输入邮件验证码')">
                  <template #suffix>
                    <t-button variant="text" size="small" :disabled="!canSendCode" @click="sendForgetCode">
                      <template #icon v-if="canSendCode"><t-icon name="send" /></template>
                      {{ codeText }}
                    </t-button>
                  </template>
                </t-input>
              </t-form-item>
              
              <div style="padding: 5px 15px 15px 15px; text-align: center;">
                <t-button block size="large" type="submit" style="width: 100%"> {{ t('下一步') }} </t-button>
              </div>
            </t-form>

            <!-- Step 2: Reset Password -->
            <t-form v-else-if="forgetStep === 1" ref="resetFormRef" :data="resetData" :rules="resetRules" @submit="onResetSubmit" label-width="80px">
              <t-form-item :label="t('新密码')" name="password">
                <t-input v-model="resetData.password" size="large" type="password" clearable :placeholder="t('请输入密码')">
                  <template #prefix-icon><t-icon name="lock-on" /></template>
                </t-input>
              </t-form-item>
              <t-form-item :label="t('确认密码')" name="repassword">
                <t-input v-model="resetData.repassword" size="large" type="password" clearable :placeholder="t('请再次输入新密码')">
                  <template #prefix-icon><t-icon name="lock-on" /></template>
                </t-input>
              </t-form-item>
              
              <div style="display: flex; justify-content: space-around; margin-bottom: 15px; padding-top: 15px;">
                <t-button size="large" variant="outline" style="width: 120px" @click="forgetStep = 0">{{ t('上一步') }}</t-button>
                <t-button size="large" type="submit" style="width: 120px" :loading="loading">{{ t('提交') }}</t-button>
              </div>
            </t-form>

            <!-- Step 3: Result -->
            <div v-else style="text-align: center; padding-top: 20px;">
              <t-icon :name="resetResult.status === 'success' ? 'check-circle-filled' : 'close-circle-filled'" size="48px" :style="{ color: resetResult.status === 'success' ? 'var(--td-success-color)' : 'var(--td-error-color)' }" />
              <div style="margin-top: 16px; font-size: 16px;">{{ resetResult.status === 'success' ? t('重置成功') : t(resetResult.msg) }}</div>
              <div v-if="resetResult.status !== 'success'" style="margin-top: 20px;">
                <t-button variant="outline" @click="forgetStep = 0">{{ t('上一步') }}</t-button>
              </div>
            </div>
          </div>

          <div class="login-hr"></div>
          <div style="text-align: center; padding-bottom: 10px;">
            <t-button variant="text" theme="default" @click="pageType = 'login'">
              <template #icon><t-icon name="arrow-left" /></template>
              {{ t('去登录') }}
            </t-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useUserStore } from '@/store';
import { basePath, api } from '@/utils/api';
import IconFont from '@/components/IconFont.vue';
import { useRequest } from '@/hooks/useRequest';
import { useShowResult } from '@/hooks/useShowResult';
import { useTranslation } from '@/hooks/useTranslation';
import { AdminLogin } from '@/utils/I18NNamespace';

const router = useRouter();
const userStore = useUserStore();
const request = useRequest();
const showResult = useShowResult(AdminLogin);
const { t } = useTranslation(AdminLogin);

const pageType = ref('login');
const loginType = ref('account'); // 'account', 'mail', 'phone'
const forgetStep = ref(0);
const loading = ref(false);

const codeUrl = ref(api.auth.code);

const refreshCaptcha = () => {
  codeUrl.value = `${api.auth.code}?${new Date().getTime()}`;
};

onMounted(() => {
  refreshCaptcha();
});

const formData = reactive({
  username: '',
  password: '',
  email: '',
  telephone: '',
  code: '',
  mailCode: '',
  phoneCode: ''
});

// Mock countdown for codes
const countdown = ref(0);
const canSendCode = computed(() => countdown.value === 0);
const codeText = computed(() => countdown.value > 0 ? `${countdown.value}s后重发` : '发送验证码');

const forgetData = reactive({
  account: '', // using account as generic key for email/phone in original ValidateInfoForm
  captcha: '',
  code: '',
  type: 2 // always email
});

const resetData = reactive({
  password: '',
  repassword: ''
});

const resetResult = reactive({
  status: 'success',
  msg: ''
});

const forgetRules = {
  account: [{ required: true, message: '邮件地址不能为空', type: 'error' }],
  captcha: [{ required: true, message: '图形验证码不能为空', type: 'error' }],
  code: [{ required: true, message: '邮件验证码不能为空', type: 'error' }],
};

const resetRules = {
  password: [{ required: true, message: '密码不能为空', type: 'error' }],
  repassword: [
    { required: true, message: '确认密码不能为空', type: 'error' },
    { validator: (val: string) => val === resetData.password, message: '两次输入密码不一致', type: 'error' }
  ],
};

const sendForgetCode = async () => {
  if (!forgetData.account) {
    MessagePlugin.warning(t('请输入邮件地址'));
    return;
  }
  if (!forgetData.captcha) {
    MessagePlugin.warning(t('请先输入图形验证码'));
    return;
  }
  const url = `${api.auth.sendMailCode}?code=${forgetData.captcha}&email=${forgetData.account}`;
  const res = await request.get(url);
  showResult.show(res);
  if (res.status) {
    startCountdown();
  } else {
    refreshCaptcha();
  }
};

const onForgetNext = ({ validateResult }: any) => {
  if (validateResult === true) {
    forgetStep.value = 1;
  }
};

const onResetSubmit = async ({ validateResult }: any) => {
  if (validateResult === true) {
    loading.value = true;
    try {
      const merged = { ...forgetData, ...resetData };
      const res = await request.post(api.auth.resetPassword, merged);
      showResult.show(res);
      if (res.status) {
        resetResult.status = 'success';
        resetResult.msg = '重置成功';
      } else {
        resetResult.status = 'warning';
        resetResult.msg = res.msg || '重置失败';
      }
      forgetStep.value = 2;
    } finally {
      loading.value = false;
    }
  }
};

const sendCode = async (type: 'mail' | 'phone') => {
  if (type === 'mail') {
    if (!formData.email) {
      MessagePlugin.warning(t('请输入邮件地址'));
      return;
    }
    if (!formData.code) {
      MessagePlugin.warning(t('请先输入图形验证码'));
      return;
    }
    const url = `${api.auth.sendMailCode}?code=${formData.code}&email=${formData.email}`;
    const res = await request.get(url);
    showResult.show(res);
    if (res.status) {
      startCountdown();
    } else {
      refreshCaptcha();
    }
  } else if (type === 'phone') {
    if (!formData.telephone) {
      MessagePlugin.warning(t('请输入手机号'));
      return;
    }
    if (!formData.code) {
      MessagePlugin.warning(t('请先输入图形验证码'));
      return;
    }
    const url = `${api.auth.sendPhoneCode}?code=${formData.code}&phone=${formData.telephone}`;
    const res = await request.get(url);
    showResult.show(res);
    if (res.status) {
      startCountdown();
    } else {
      refreshCaptcha();
    }
  }
};

const startCountdown = () => {
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

const rules = {
  username: [{ required: true, message: t('账号必填'), type: 'error' }],
  password: [{ required: true, message: t('密码必填'), type: 'error' }],
  code: [{ required: true, message: t('验证码必填'), type: 'error' }],
  email: [{ required: true, message: t('邮箱必填'), type: 'error' }],
  telephone: [{ required: true, message: t('手机号必填'), type: 'error' }],
  mailCode: [{ required: true, message: t('验证码必填'), type: 'error' }],
  phoneCode: [{ required: true, message: t('验证码必填'), type: 'error' }],
};

const onSubmit = async ({ validateResult, firstError }: any) => {
  if (validateResult === true) {
    loading.value = true;
    try {
      let loginData: any = { type: 1 };
      
      if (loginType.value === 'account') {
        loginData = {
          username: formData.username,
          password: formData.password,
          code: formData.code,
          type: 1
        };
      } else if (loginType.value === 'mail') {
        loginData = {
          email: formData.email,
          code: formData.mailCode,
          captcha: formData.code,
          type: 2
        };
      } else if (loginType.value === 'phone') {
        loginData = {
          telephone: formData.telephone,
          code: formData.phoneCode,
          captcha: formData.code,
          type: 3
        };
      }

      const res = await request.post(api.auth.login, loginData);
      showResult.show(res);
      if (res.status) {
        userStore.setToken(res.data.jwtToken);
        userStore.setUserInfo(res.data.user);
        router.push(basePath);
      } else {
        refreshCaptcha();
      }
    } finally {
      loading.value = false;
    }
  } else {
    MessagePlugin.warning(firstError);
  }
};
</script>

<style lang="less" scoped>
.login-bg-img{
    background: url('@/assets/bg.jpg') no-repeat center center / cover;
    width: 100vw;
    height:100vh;
}

.login-bg-color{
    background: rgba(150,150,150,0.1);
    width:100%;
    height:100%; 
    backdrop-filter: blur(5px);
    display:flex;
    align-items: center;
    justify-content: center;
}

.login-head{
    display:flex;
    align-items: center;
    margin-bottom:20px;
    justify-content: center;
}

.login-logo-path{
    color: rgba(255,255,255,0.75);
}

.login-title{
    margin-left: 15px;
    font-size:30px; 
    color: rgba(255,255,255,0.75);
}

.login-container{
    background: rgba(255,255,255, 0.3);
    width:400px;
    padding-bottom:10px;
    box-shadow:
        0px 0px 3.6px rgba(0, 0, 0, 0.028),
        0px 0px 10px rgba(0, 0, 0, 0.04),
        0px 0px 24.1px rgba(0, 0, 0, 0.052),
        0px 0px 80px rgba(0, 0, 0, 0.08)
        ;
    border-radius: 4px;
}

.login-part-title{
    font-size:28px;
    padding: 20px 0px;
    color:#6b5353;
    text-align:center;
}

.login-hr{
    width:100%;
    border-top:1px solid white;
    height:10px;
    padding-bottom:10px;
}

.other-login{
    text-align:center;
    padding-bottom:10px;
}

@media screen and (max-width: 575px) {
    .login-container{
        box-sizing: border-box;
        padding-left:20px;
        padding-right:20px;
    }    
}
</style>