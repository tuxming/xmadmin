<template>
    <div style="padding: 20px;">
        <t-row :gutter="[16, 16]">
            <t-col :span="6" :xs="6">
                <t-card
                    :style="{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', minHeight: '260px', height: '100%' }">
                    <template #title>
                        <div style="display:inline-flex;align-items:center;gap:8px;">
                            <span
                                style="width:12px;height:12px;border-radius:12px;background:linear-gradient(135deg,#06b6d4,#f97316);"></span>
                            当前用户
                        </div>
                    </template>
                    <div style="display:flex;align-items:flex-start;gap:16px;">
                        <t-avatar size="64"
                            :image="userStore.userInfo?.photo ? (api.document.img + '?id=' + userStore.userInfo.photo) : undefined"
                            style="width:64px;height:64px;flex:0 0 64px;">
                            <template #icon v-if="!userStore.userInfo?.photo">
                                <t-icon name="user" />
                            </template>
                        </t-avatar>
                        <t-descriptions :column="1" size="small">
                            <t-descriptions-item label="ID">{{ userStore.userInfo?.id ?? '-' }}</t-descriptions-item>
                            <t-descriptions-item label="用户名">{{ userStore.userInfo?.username ?? '-'
                                }}</t-descriptions-item>
                            <t-descriptions-item label="姓名">{{ userStore.userInfo?.fullname ?? '-'
                                }}</t-descriptions-item>
                            <t-descriptions-item label="邮箱">{{ userStore.userInfo?.email ?? '-' }}</t-descriptions-item>
                            <t-descriptions-item label="手机号">{{ userStore.userInfo?.phone ?? '-'
                                }}</t-descriptions-item>
                        </t-descriptions>
                    </div>
                    <div style="margin-top:12px;">
                        <t-space :break-line="true" :size="[8, 8]">
                            <t-tag v-for="(r, idx) in (userStore.userInfo?.roles || [])" :key="idx" theme="primary"
                                variant="light">{{
                                    r?.name || r?.code || '角色' }}</t-tag>
                            <t-tag v-if="userStore.userInfo?.dept?.fullname" theme="success" variant="light">部门：{{
                                userStore.userInfo.dept.fullname }}</t-tag>
                            <t-tag v-if="userStore.userInfo?.company?.fullname" theme="warning" variant="light">公司：{{
                                userStore.userInfo.company.fullname }}</t-tag>
                            <t-tag v-if="userStore.userInfo?.group?.fullname" theme="primary" variant="light">组：{{
                                userStore.userInfo.group.fullname }}</t-tag>
                            <t-tag v-if="Array.isArray(userStore.userInfo?.permissions)" theme="default"
                                variant="light">权限：{{
                                    userStore.userInfo.permissions.length }}</t-tag>
                        </t-space>
                    </div>
                </t-card>
            </t-col>

            <t-col :span="6" :xs="6">
                <t-card
                    :style="{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', minHeight: '260px', height: '100%' }">
                    <template #title>
                        <div style="display:inline-flex;align-items:center;gap:8px;">
                            <span
                                style="width:12px;height:12px;border-radius:12px;background:linear-gradient(135deg,#06b6d4,#f97316);"></span>
                            联系作者
                        </div>
                    </template>
                    <t-space direction="vertical" :size="6">
                        <span>微信：angft2</span>
                        <span>Email：tuxming@gmail.com</span>
                        <span style="color:rgba(0,0,0,0.45)">工作日联系请备注来由</span>
                    </t-space>
                </t-card>
            </t-col>

            <t-col :span="6" :xs="6">
                <t-card
                    :style="{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', minHeight: '260px', height: '100%' }">
                    <template #title>
                        <div style="display:inline-flex;align-items:center;gap:8px;">
                            <span
                                style="width:12px;height:12px;border-radius:12px;background:linear-gradient(135deg,#06b6d4,#f97316);"></span>
                            版权说明
                        </div>
                    </template>
                    <div>MIT License © 2024 tuxming@sina.com / wechat: angft1</div>
                    <div style="color:rgba(0,0,0,0.45);margin-top:8px;">允许商用与修改，请保留版权声明。</div>
                </t-card>
            </t-col>

            <t-col :span="6" :xs="6">
                <t-card
                    :style="{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', minHeight: '260px', height: '100%' }">
                    <template #title>
                        <div style="display:inline-flex;align-items:center;gap:8px;">
                            <span
                                style="width:12px;height:12px;border-radius:12px;background:linear-gradient(135deg,#06b6d4,#f97316);"></span>
                            技术框架
                        </div>
                    </template>
                    <t-space direction="vertical" :size="6">
                        <span>前端：Vue 3、TDesign Vue Next</span>
                        <span>状态管理：Pinia</span>
                        <span>构建：Vite</span>
                        <span>后端：JFinal、Shiro、JWT</span>
                        <t-space :break-line="true" :size="[8, 8]" style="margin-top:8px;">
                            <t-tag theme="primary" variant="light">Axios</t-tag>
                            <t-tag theme="default" variant="light">i18n</t-tag>
                            <t-tag theme="success" variant="light">Persist</t-tag>
                        </t-space>
                    </t-space>
                </t-card>
            </t-col>
        </t-row>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store';
import { api } from '@/utils/api';
const userStore = useUserStore();
</script>
