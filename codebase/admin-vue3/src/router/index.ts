import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layouts/index.vue';
import { useUserStore } from '@/store';
import { basePath, api } from '@/utils/api';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/pages/login/index.vue'),
        meta: { title: '登录' }
    },
    {
        path: basePath,
        name: 'Home',
        component: Layout,
        redirect: api.backendPage,
        children: [
            {
                path: '/sys/overview',
                name: 'Overview',
                component: () => import('@/pages/overview/index.vue'),
                meta: { title: '首页' }
            },
            {
                path: '/sys/dept',
                name: 'Dept',
                component: () => import('@/pages/sys/dept/index.vue'),
                meta: { title: '部门管理' }
            },
            {
                path: '/sys/user',
                name: 'User',
                component: () => import('@/pages/sys/user/index.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: '/sys/dict',
                name: 'Dict',
                component: () => import('@/pages/sys/dict/index.vue'),
                meta: { title: '字典管理' }
            },
            {
                path: '/sys/role',
                name: 'Role',
                component: () => import('@/pages/sys/role/index.vue'),
                meta: { title: '角色管理' }
            },
            {
                path: '/sys/menu',
                name: 'Menu',
                component: () => import('@/pages/sys/menu/index.vue'),
                meta: { title: '菜单管理' }
            },
            {
                path: '/sys/permission',
                name: 'Permission',
                component: () => import('@/pages/sys/permission/index.vue'),
                meta: { title: '权限管理' }
            },
            {
                path: '/sys/lang',
                name: 'Lang',
                component: () => import('@/pages/sys/lang/index.vue'),
                meta: { title: '语言资源' }
            },
            {
                path: '/sys/document',
                name: 'Document',
                component: () => import('@/pages/sys/document/index.vue'),
                meta: { title: '文件管理' }
            },
            {
                path: '/sys/history',
                name: 'History',
                component: () => import('@/pages/sys/history/index.vue'),
                meta: { title: '日志管理' }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: basePath
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const userStore = useUserStore();
    const token = userStore.token;

    if (to.path === '/login') {
        return true;
    } else {
        if (!token) {
            return { path: '/login', query: { redirect: to.fullPath } };
        }
        return true;
    }
});

export default router;
