<template>
    <div class="wallpaper-wrap" :style="{
        backgroundImage: themeStore.wallpaperUrl ? `url('${themeStore.wallpaperUrl}')` : 'none',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover'
    }">
        <t-layout class="layout-container" :class="{ 'xm-only-icon': themeStore.onlyIcon }"
            :data-size="themeStore.componentSize" :style="{ backdropFilter: `blur(${themeStore.bgBlur}px)` }">
            <t-aside :width="themeStore.collapsed ? '64px' : `${themeStore.sideWidth}px`" class="layout-sider" :style="{
                backgroundColor: themeStore.sideTheme === 'light'
                    ? `rgba(245,245,245, ${themeStore.sideOpacity})`
                    : `rgba(0,0,0, ${themeStore.sideOpacity})`
            }">
                <div class="logo">
                    <t-icon name="logo-codepen" size="32px" color="var(--td-brand-color)" />
                    <span v-show="!themeStore.collapsed" class="title"
                        :style="{ color: themeStore.sideTheme === 'dark' ? '#fff' : 'var(--td-brand-color)' }">Xm-Admin</span>
                </div>
                <t-menu :value="route.path" :collapsed="themeStore.collapsed" class="layout-menu"
                    :theme="themeStore.sideTheme" @change="handleMenuChange" style="width:100%; padding-right:5px;">
                    <!-- dynamic menus -->
                    <template v-for="menu in menuStore.treeMenu" :key="menu.id">
                        <!-- 这里使用自定义组件或者直接写以支持图标间距，不过 TDesign 默认通过插槽处理图标间距，前面样式中加了 gap: 8px -->
                        <t-submenu v-if="menu.children && menu.children.length > 0" :value="menu.path"
                            :title="menu.name">
                            <template #icon>
                                <icon-font v-if="menu.icon" :name="menu.icon" />
                            </template>
                            <t-menu-item v-for="child in menu.children" :key="child.id" :value="child.path">
                                <template #icon>
                                    <icon-font v-if="child.icon" :name="child.icon" />
                                </template>
                                {{ child.name }}
                            </t-menu-item>
                        </t-submenu>
                        <t-menu-item v-else :value="menu.path">
                            <template #icon>
                                <icon-font v-if="menu.icon" :name="menu.icon" />
                            </template>
                            {{ menu.name }}
                        </t-menu-item>
                    </template>
                </t-menu>
            </t-aside>

            <t-layout style="min-width: 0; overflow: hidden;">
                <t-header class="layout-header">
                    <div class="xm-header-wrap">
                        <div class="xm-top">
                            <div class="home-header-left">
                                <t-button variant="text" shape="square" @click="themeStore.toggleCollapsed()">
                                    <t-icon :name="themeStore.collapsed ? 'menu-unfold' : 'menu-fold'" />
                                </t-button>
                            </div>
                            <div class="home-header-right">
                                <t-space>
                                    <t-dropdown :options="langOptions" @click="handleLangChange">
                                        <t-button variant="text">
                                            <t-icon name="translate" />
                                            <span style="margin-left: 8px">{{ currentLang }}</span>
                                        </t-button>
                                    </t-dropdown>
                                    <t-button variant="text" shape="square" @click="showSetting = true">
                                        <t-icon name="setting" />
                                    </t-button>
                                    <t-dropdown @click="handleUserDropdownClick">
                                        <t-button variant="text">
                                            <t-avatar size="small"
                                                :image="userStore.userInfo?.photo ? (api.document.img + '?id=' + userStore.userInfo.photo) : undefined">
                                                <template #icon v-if="!userStore.userInfo?.photo"><t-icon
                                                        name="user" /></template>
                                            </t-avatar>
                                            <span style="margin-left: 8px">{{ userStore.userInfo?.fullname || 'Admin'
                                                }}</span>
                                        </t-button>
                                        <t-dropdown-menu>
                                            <t-dropdown-item value="profile">个人信息</t-dropdown-item>
                                            <t-dropdown-item value="logout">退出登录</t-dropdown-item>
                                        </t-dropdown-menu>
                                    </t-dropdown>
                                </t-space>
                            </div>
                        </div>

                        <div class="xm-tab layout-tabs">
                            <t-tabs v-model="activeTab" @change="handleTabChange" @remove="handleTabRemove">
                                <t-tab-panel v-for="tab in tabs" :key="tab.value" :value="tab.value"
                                    :removable="tab.value !== api.backendPage">
                                    <template #label>
                                        <span class="tab-label-wrap" @mouseenter="tab.hover = true"
                                            @mouseleave="tab.hover = false">
                                            <icon-font v-if="tab.icon || tab.hover"
                                                :name="(tab.hover && activeTab === tab.value) ? 'icon-maximize' : (tab.icon || 'dashboard')"
                                                class="tab-icon"
                                                @click.stop="(e: Event) => handleTabIconClick(e, tab)" />
                                            <span class="tab-text">{{ tab.label }}</span>
                                        </span>
                                    </template>
                                </t-tab-panel>
                            </t-tabs>
                        </div>
                    </div>
                </t-header>

                <t-content class="layout-content">
                    <router-view v-slot="{ Component }">
                        <keep-alive>
                            <component :is="Component" />
                        </keep-alive>
                    </router-view>
                </t-content>

                <t-footer class="layout-footer">
                    <t-icon name="logo-codepen" color="var(--td-brand-color)" />
                    <span style="margin-left: 8px">Xm-Admin 后台管理系统</span>
                </t-footer>
            </t-layout>

            <SkinSetting v-if="showSetting" v-model="showSetting" />
            <UserEdit v-if="openUserProfile" v-model:open="openUserProfile" :user="userProfile"
                @close="onUserEditClose" />

            <!-- Render Window modals -->
            <template v-for="win in windows" :key="win.id">
                <ModalManager type="window" :title="win.title" :icon="win.icon" :open="true" :show-mask="false"
                    width="80vw" height="60vh" @close="() => onWindowClose(win.id)">
                    <div style="height: 100%; display: flex; flex-direction: column;">
                        <div
                            style="padding: 4px 16px; margin-bottom:10px; border-bottom: 1px solid var(--td-component-border); display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 16px;">
                            <icon-font v-if="win.icon" :name="win.icon" />
                            <span>{{ win.title }}</span>
                        </div>
                        <div style="flex: 1; overflow: hidden;">
                            <component :is="win.component" v-bind="win.props" />
                        </div>
                    </div>
                </ModalManager>
            </template>
        </t-layout>
    </div>

</template>

<script setup lang="ts">
import { ref, watch, onMounted, provide, shallowRef, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DialogPlugin } from 'tdesign-vue-next';
import { useThemeStore, useUserStore, useMenuStore } from '@/store';
import IconFont from '@/components/IconFont.vue';
import { api, basePath } from '@/utils/api';
import { useRequest } from '@/hooks/useRequest';
import { useTranslation } from '@/hooks/useTranslation';

const SkinSetting = defineAsyncComponent(() => import('@/components/SkinSetting.vue'));
const UserEdit = defineAsyncComponent(() => import('@/pages/sys/user/UserEdit.vue'));
const ModalManager = defineAsyncComponent(() => import('@/components/Modal/index.vue'));

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();
const userStore = useUserStore();
const menuStore = useMenuStore();
const request = useRequest();
const { i18n } = useTranslation();

const showSetting = ref(false);

// Window manager logic
const windows = ref<any[]>([]);
const winIndex = ref(1);

const openWindow = (tab: any) => {
    // Use route matching to find component to render in window
    const matchedRoute = router.getRoutes().find(r => r.path === tab.value);
    if (matchedRoute && matchedRoute.components?.default) {
        windows.value.push({
            id: winIndex.value++,
            title: tab.label,
            icon: tab.icon,
            component: shallowRef(matchedRoute.components.default),
            props: {},
            path: tab.value
        });
    }
};

const onWindowClose = (winId: number) => {
    windows.value = windows.value.filter(w => w.id !== winId);
};

const currentLang = ref('简体中文');
const langOptions = ref<Array<{ content: string, value: string }>>([]);

const getLangs = async () => {
    try {
        const res = await request.get(api.lang.langs);
        if (res && res.data) {
            langOptions.value = res.data.map((lang: any) => ({
                content: lang.label,
                value: lang.code
            }));
            // 初始化当前语言
            const savedLang = localStorage.getItem('lng') || 'zh_CN';
            const item = langOptions.value.find(opt => opt.value === savedLang);
            if (item) {
                currentLang.value = item.content;
                i18n.changeLanguage(savedLang);
            } else if (langOptions.value.length > 0) {
                currentLang.value = langOptions.value[0].content;
                i18n.changeLanguage(langOptions.value[0].value);
            }
        }
    } catch (err) {
        console.error(err);
    }
};

const fetchUserInfo = async () => {
    try {
        const res = await request.get(api.user.userInfo);
        if (res && res.status && res.data) {
            userStore.setUserInfo(res.data);
        }
    } catch (err) {
        console.error('Failed to fetch user info', err);
    }
};

const handleLangChange = (data: any) => {
    const item = langOptions.value.find(opt => opt.value === data.value);
    if (item) {
        currentLang.value = item.content;
        localStorage.setItem('lng', data.value);
        i18n.changeLanguage(data.value);
    }
};

const openUserProfile = ref(false);
const userProfile = ref<any>(null);

const handleUserDropdownClick = (data: any) => {
    if (data.value === 'profile') {
        handleProfile();
    } else if (data.value === 'logout') {
        handleLogout();
    }
};

const handleProfile = async () => {
    if (!userStore.userInfo?.id) return;
    const res = await request.get(api.user.get + '?id=' + userStore.userInfo.id);
    if (res.status) {
        userProfile.value = res.data;
        openUserProfile.value = true;
    }
};

const onUserEditClose = () => {
    openUserProfile.value = false;
};

onMounted(() => {
    menuStore.fetchCurrMenus();
    getLangs();
    fetchUserInfo();
    themeStore.applyBackgroundVars();
});

// Helper function to find menu icon by path
const findMenuIcon = (path: string) => {
    if (path === api.backendPage) return 'dashboard';
    const findInMenu = (menus: any[]): string | null => {
        for (const menu of menus) {
            if (menu.path === path) return menu.icon;
            if (menu.children && menu.children.length > 0) {
                const childIcon = findInMenu(menu.children);
                if (childIcon) return childIcon;
            }
        }
        return null;
    };
    return findInMenu(menuStore.treeMenu) || 'file'; // fallback icon
};

const activeTab = ref(api.backendPage);
const tabs = ref<Array<{ value: string, label: string, icon?: string, hover?: boolean }>>([
    { value: api.backendPage, label: '首页', icon: 'dashboard', hover: false }
]);

watch(
    () => route.path,
    (newPath) => {
        activeTab.value = newPath;
        const exists = tabs.value.find(t => t.value === newPath);
        if (!exists && newPath !== '/login') {
            tabs.value.push({
                value: newPath,
                label: route.meta.title as string || '新标签页',
                icon: findMenuIcon(newPath),
                hover: false
            });
        }
    },
    { immediate: true }
);

const handleTabIconClick = (e: Event, tab: any) => {
    // 只有当前激活的 tab 才能点击图标弹窗化
    if (activeTab.value !== tab.value) return;

    openWindow(tab);

    // 从 tab 列表移除该页并切换路由
    handleTabRemove({ value: tab.value });
};

const handleTabChange = (val: string) => {
    router.push(val);
};

const handleTabRemove = ({ value }: any) => {
    const index = tabs.value.findIndex(t => t.value === value);
    tabs.value.splice(index, 1);
    if (activeTab.value === value) {
        const nextTab = tabs.value[index - 1] || tabs.value[0];
        if (nextTab) {
            router.push(nextTab.value);
        }
    }
};

const handleMenuChange = (val: string) => {
    router.push(val);
};

const handleLogout = () => {
    const dialog = DialogPlugin.confirm({
        header: '确定要退出登录吗？',
        body: '退出后将尝试切换回上一个账户（如果存在）。',
        onConfirm: () => {
            const users = JSON.parse(localStorage.getItem('userInfos') || '[]');
            if (Array.isArray(users) && users.length > 0) {
                const prev = users.shift();
                localStorage.setItem('userInfos', JSON.stringify(users));
                if (prev?.token) {
                    userStore.setUserInfo(prev.user || null);
                    userStore.setToken(prev.token);
                    document.cookie = `jwtToken=${prev.token}; path=/; max-age=${60 * 60 * 24}`;
                    dialog.hide();
                    setTimeout(() => {
                        window.location.reload();
                    }, 300);
                    return;
                }
            }

            userStore.logout();
            document.cookie = 'jwtToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            dialog.hide();
            router.push('/login');
        }
    });
};

</script>

<style lang="less" scoped>
.wallpaper-wrap {
    height: 100vh;
    width: 100vw;
}

.layout-container {
    height: 100%;
    overflow: hidden;

    &.xm-only-icon {
        :deep(.t-menu__item-text) {
            display: none !important;
        }

        :deep(.t-menu__item) {
            justify-content: center;
        }
    }

    .layout-sider {
        transition: width 0.2s;
        box-shadow: var(--td-shadow-1);
        z-index: 10;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        :deep(.t-menu) {
            width: 100% !important;
            background-color: transparent !important;
        }

        :deep(.t-default-menu) {
            background-color: transparent !important;
        }

        :deep(.t-menu__item) {
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            gap: 8px;
            /* 增加图标和文本的间距 */
            background-color: transparent !important;
        }

        :deep(.t-menu__item:hover:not(.t-is-active):not(.t-is-disabled)) {
            background-color: color-mix(in srgb, var(--td-brand-color) 40%, transparent) !important;
        }

        :deep(.t-menu__item-text) {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            min-width: 0;
        }

        :deep(.t-submenu__title) {
            gap: 8px;
        }

        :deep(.t-default-menu__inner .t-menu) {
            padding-left: 3px;
            padding-right: 0px;
        }



        :deep(.t-submenu__title > span) {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            min-width: 0;
        }

        :deep(.t-menu__item.t-is-active) {
            background-color: var(--xm-side-item-active-bg) !important;
        }

        .logo {
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;

            .title {
                margin-left: 8px;
                font-size: 20px;
                font-weight: bold;
                color: var(--td-brand-color);
            }
        }

        .layout-menu {
            height: calc(100% - 64px);
            width: 100%;
        }
    }

    .layout-header {
        height: 100px;
        padding: 0;
        background-color: transparent;
        z-index: 9;

        .xm-header-wrap {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;

            .xm-top {
                height: 64px;
                padding: 0 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background-color: var(--td-bg-color-container);
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
            }

            .xm-tab {
                flex: 1;
                background-color: var(--td-bg-color-container);
                padding: 0 16px;
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
                margin-top: 4px;

                :deep(.t-tabs__nav-item-wrapper) {
                    padding: 0 12px;
                }

                .tab-label-wrap {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .tab-icon {
                    font-size: 14px;
                    cursor: pointer;
                    transition: transform 0.2s;

                    &:hover {
                        transform: scale(1.1);
                        color: var(--td-brand-color);
                    }
                }
            }
        }
    }

    .layout-content {
        padding: 16px;
        overflow: hidden;
        background-color: var(--td-bg-color-page);
        flex: 1;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        min-height: 0;
        min-width: 0;

        > :first-child {
            flex: 1;
            min-height: 0;
            min-width: 0;
        }
    }

    .layout-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--td-text-color-placeholder);
        padding: 16px;
        height: 56px;
        box-sizing: border-box;
        flex-shrink: 0;
    }
}
</style>
