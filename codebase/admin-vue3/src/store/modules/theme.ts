import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
    state: () => ({
        collapsed: false,
        theme: 'light' as 'light' | 'dark',
        primaryColor: '#1677ff',
        borderRadius: 3,
        componentSize: 'medium' as 'small' | 'medium' | 'large',
        onlyIcon: false,
        sideTheme: 'dark' as 'light' | 'dark',
        sideWidth: 232,
        modalOpacity: 1,
        modalWallpaperEnabled: false,
        wallpaperUrl: null as string | null,
        modalBgBlur: 0,
        bgBlur: 0,
        bgOpacity: 1,
        containerOpacity: 1,
        sideOpacity: 1,
        sideItemOpacity: 0.1,
        sideItemSelectOpacity: 0.75,
    }),
    actions: {
        applyBackgroundVars() {
            const getOpacity = (opacity: any) => {
                if (opacity === null || opacity === undefined) return 1;
                return Number(opacity);
            };
            const getOpacityColor = (color: string, opacity: number) => {
                if (opacity === null || opacity === undefined) return color;
                const o = Number(opacity);
                if (Number.isNaN(o)) return color;
                const c = String(color || '').toUpperCase();
                let r = 0;
                let g = 0;
                let b = 0;
                if (c.startsWith('#')) {
                    if (c.length === 4) {
                        r = parseInt(c.substring(1, 2), 16);
                        g = parseInt(c.substring(2, 3), 16);
                        b = parseInt(c.substring(3, 4), 16);
                    } else if (c.length >= 7) {
                        r = parseInt(c.substring(1, 3), 16);
                        g = parseInt(c.substring(3, 5), 16);
                        b = parseInt(c.substring(5, 7), 16);
                    } else {
                        return color;
                    }
                    return `rgba(${r}, ${g}, ${b}, ${o})`;
                }
                if (c.startsWith('RGB')) {
                    const s = c.replace('RGBA', '').replace('RGB', '').replace('(', '').replace(')', '');
                    const parts = s.split(',');
                    if (parts.length >= 3) {
                        r = parseInt(parts[0].trim());
                        g = parseInt(parts[1].trim());
                        b = parseInt(parts[2].trim());
                        return `rgba(${r}, ${g}, ${b}, ${o})`;
                    }
                }
                return color;
            };

            const bgOpacity = getOpacity(this.bgOpacity);
            const containerOpacity = getOpacity(this.containerOpacity);
            const mode = this.theme;
            const pageBg = mode === 'light'
                ? `rgba(245,245,245,${bgOpacity})`
                : `rgba(0,0,0,${bgOpacity})`;
            const containerBg = mode === 'light'
                ? `rgba(255,255,255,${containerOpacity})`
                : `rgba(0,0,0,${containerOpacity})`;
            const secondaryContainerBg = mode === 'light'
                ? `rgba(245,245,245,${containerOpacity})`
                : `rgba(16,16,16,${containerOpacity})`;

            document.documentElement.style.setProperty('--td-bg-color-page', pageBg);
            document.documentElement.style.setProperty('--td-bg-color-container', containerBg);
            document.documentElement.style.setProperty('--td-bg-color-secondarycontainer', secondaryContainerBg);

            const sideBase = this.sideTheme === 'light' ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)';
            document.documentElement.style.setProperty('--xm-side-item-bg', getOpacityColor(sideBase, getOpacity(this.sideItemOpacity)));
            document.documentElement.style.setProperty('--xm-side-item-active-bg', getOpacityColor(this.primaryColor, getOpacity(this.sideItemSelectOpacity)));
        },
        toggleCollapsed() {
            this.collapsed = !this.collapsed;
        },
        setWallpaperUrl(url: string | null) {
            this.wallpaperUrl = url;
        },
        setBgBlur(blur: number) {
            this.bgBlur = blur;
        },
        setBgOpacity(val: number) {
            this.bgOpacity = val;
            this.applyBackgroundVars();
        },
        setContainerOpacity(val: number) {
            this.containerOpacity = val;
            this.applyBackgroundVars();
        },
        setSideOpacity(val: number) {
            this.sideOpacity = val;
        },
        setSideItemOpacity(val: number) {
            this.sideItemOpacity = val;
            this.applyBackgroundVars();
        },
        setSideItemSelectOpacity(val: number) {
            this.sideItemSelectOpacity = val;
            this.applyBackgroundVars();
        },
        setTheme(theme: 'light' | 'dark') {
            this.theme = theme;
            if (theme === 'dark') {
                document.documentElement.setAttribute('theme-mode', 'dark');
            } else {
                document.documentElement.removeAttribute('theme-mode');
            }
            this.applyBackgroundVars();
        },
        setPrimaryColor(color: string) {
            this.primaryColor = color;
            document.documentElement.style.setProperty('--td-brand-color', color);
            this.applyBackgroundVars();
        },
        setBorderRadius(radius: number) {
            this.borderRadius = radius;
            document.documentElement.style.setProperty('--td-radius-default', `${radius}px`);
        },
        setComponentSize(size: 'small' | 'medium' | 'large') {
            this.componentSize = size;
            // You might need to map this to TDesign sizes or apply global classes
        },
        setOnlyIcon(val: boolean) {
            this.onlyIcon = val;
        },
        setSideTheme(theme: 'light' | 'dark') {
            this.sideTheme = theme;
            this.applyBackgroundVars();
        },
        setSideWidth(width: number) {
            this.sideWidth = width;
        },
        resetTheme() {
            this.theme = 'light';
            this.primaryColor = '#1677ff';
            this.borderRadius = 3;
            this.componentSize = 'medium';
            this.onlyIcon = false;
            this.setTheme('light');
            this.setPrimaryColor('#1677ff');
            this.setBorderRadius(3);
        },
        resetSidebar() {
            this.sideTheme = 'dark';
            this.sideWidth = 232;
            this.sideOpacity = 1;
        }
    },
    persist: true,
});
