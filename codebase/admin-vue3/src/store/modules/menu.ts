import { defineStore } from 'pinia';
import { api, basePath } from '@/utils/api';
import { useRequest } from '@/hooks/useRequest';

export const useMenuStore = defineStore('menu', {
    state: () => ({
        menus: [] as any[],
        treeMenu: [] as any[],
        activeKey: '',
        openKeys: [] as string[],
    }),
    actions: {
        setMenus(menus: any[]) {
            this.menus = menus;
        },
        setTreeMenu(treeMenu: any[]) {
            this.treeMenu = treeMenu;
        },
        setActiveKey(key: string) {
            this.activeKey = key;
        },
        setOpenKeys(keys: string[]) {
            this.openKeys = keys;
        },
        async fetchCurrMenus() {
            const request = useRequest();
            const res = await request.get(api.menu.curr, true);
            if (res.status && res.data) {
                let menus = res.data;

                menus.forEach((menu: any) => {
                    let basePath1 = basePath.endsWith("/") ? basePath.substring(0, basePath.length - 1) : basePath;
                    let isOverview = menu.path == basePath || basePath1 == menu.path;
                    if (isOverview) {
                        menu.path = api.backendPage;
                    }
                });

                this.setMenus(menus);

                //将menus转换成treeMenu;
                let mapMenu: any = {};
                menus.forEach((menu: any) => {
                    menu.children = [];
                    mapMenu[menu.id] = menu;
                });
                mapMenu[1] = { name: "root", label: "根菜单", id: 1, parentId: null, children: [] };

                menus.forEach((menu: any) => {
                    let parentId = menu.parentId;
                    if (parentId || parentId === 0) {
                        let parent = mapMenu[parentId];
                        if (parent) {
                            parent.children.push(menu);
                        }
                    }
                });

                const sortMenu = (menuList: any[]) => {
                    menuList.sort((m1, m2) => m1.sort - m2.sort);
                    menuList.forEach(menu => {
                        if (menu.children && menu.children.length > 0) {
                            sortMenu(menu.children);
                        }
                    });
                };

                let currMenus = mapMenu[1].children || [];
                sortMenu(currMenus);
                this.setTreeMenu(currMenus);
            }
        }
    },
    persist: true,
});