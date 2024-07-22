
import { createSlice } from '@reduxjs/toolkit';
// import { TabItemType } from '../pages/home/HeadTab'

const defaultLoadingState  = {
    value: false
};

/**
 * 全屏加载
 */
export const LoadingSlice = createSlice({
    name: "loading",
    initialState: defaultLoadingState,
    reducers: {
        start: (state) => {
            state.value = true;
        },
        end: (state) => {
            state.value = false;
        },
    }
});

const defaultActiveTabKeyState  = {
    value: null
};

/**
 * 当前激活的tab
 */
export const ActiveTabSlice = createSlice({
    name: "activeKey",
    initialState: defaultActiveTabKeyState,
    reducers: {
        activeKey: (state, action) => {
            state.value = action.payload;
        }
    }
});

/**
 * tab列表
 */
const defaultTabItems  = {
    items: [{
        key: '/sys/overview',
        label: '主面板',
        icon: "icon-dashboard",
        path: "/sys/overview"
    }]
};

export const TabItemsSlice = createSlice({
    name: "tabItems",
    initialState: defaultTabItems,
    reducers: {
        setItems: (state, action) => {  //items
            state.items = action.payload;
        },
        addItem: (state, action) => { //item
            state.items.push(action.payload);
        }
    }
});


//主题配置
export type ThemeConfigType = {
    lng: string,                        //语言
    colorPrimary: string,               //主要颜色
    theme: 'light' | 'dark',            //主题色调
    borderRadius: number,               //基础控件圆角大小
    wallpaperUrl: string                //背景图片url
    bgOpacity: number,                  //背景透明度
    containerOpacity: number,           //容器的透明度
    bgBlur: number,                      //背景模糊度
    onlyIcon: boolean,                   //是否只显示图标，一般针对按钮
    sidemenuCollapsed:  boolean,        //侧边菜单是否展开
    sideTheme:  'light' | 'dark',       //侧边菜单主题色调
    sideItemOpacity: number,            //侧边菜单项的透明都
    sideItemSelectOpacity: number,       //侧边菜单项选中的透明度
    componentSize: 'small' | 'large' | 'middle',
} 

const defaultThemeConfig : ThemeConfigType= {
    lng: null,
    colorPrimary: '#00b96b',
    theme: 'light',   //'dark' , 'light',
    sidemenuCollapsed: false,
    sideTheme: 'dark',
    borderRadius: 6,
    wallpaperUrl: null,
    bgOpacity: 1,                  //背景透明度
    containerOpacity: 1,           //容器的透明度
    sideItemOpacity:0.1,            //侧边菜单项的透明都
    sideItemSelectOpacity: 0.75,    //侧边菜单项选中的透明度
    bgBlur: 0,                      //背景模糊度
    onlyIcon: false,                  //是否只显示图标，一般针对按钮
    componentSize: 'middle'            //设置按钮尺寸
}   

export const themeConfigSlice = createSlice({
    name: "themeConfig",
    initialState: defaultThemeConfig,
    reducers: {
        changeLng : (state, action) => {  //language
            state.lng = action.payload;
        },
        changeTheme: (state, action) => {  //theme
            state.theme = action.payload;
        },
        changeColor: (state, action) => {  //colorPrimary
            state.colorPrimary = action.payload;
        },
        changeSidemenuCollapsed: (state, action) => {  //collapsed
            state.sidemenuCollapsed = action.payload;
        },
        changeSideTheme: (state, action) => { //sideTheme
            state.sideTheme = action.payload;
            if(state.sideTheme == 'dark'){
                state.sideItemSelectOpacity = 1;
            }else{
                state.sideItemSelectOpacity = 0.2;
            }
        },
        changeBorderRadius: (state, action) => { //borderRadius
            state.borderRadius = action.payload;
        },
        changeWallpaperUrl: (state, action) => { //wallpaperUrl
            state.wallpaperUrl = action.payload;
        },
        
        changeBgOpacity: (state, action) => {  //bgOpacity 背景透明度
            state.bgOpacity = action.payload;
        },
        changeContainerOpacity: (state, action) => {  //containerOpacity 容器的透明度
            state.containerOpacity = action.payload;
        },
        changeSideItemOpacity: (state, action) => {  //sideItemOpacity 侧边菜单项的透明都
            state.sideItemOpacity = action.payload;
        },
        changeSideItemSelectOpacity: (state, action) => {  //sideItemSelectOpacity 侧边菜单项选中的透明度
            state.sideItemSelectOpacity = action.payload;
        },
        changeBgBlur: (state, action) => {  //bgBlur 侧边菜单项选中的透明度
            state.bgBlur = action.payload;
        },
        changeOnlyIcon: (state, action) => {  //onlyIcon 是否只显示图标，一般针对按钮
            state.onlyIcon = action.payload;
        },
        changeComponentSize: (state, action) => {  //componentSize 是设置按钮尺寸
            state.componentSize = action.payload;
        },
    }
});

export type GlobalVarType = {
    isMinScreen: boolean,
    width: number,
    height: number
}

const defaultGlobalVar: GlobalVarType = {
    isMinScreen: document.body.clientWidth<576,
    width: document.body.clientWidth,
    height: document.body.clientHeight,
}

//全局环境变量
export const globalVarSlice = createSlice({
    name: "globalVar",
    initialState: defaultGlobalVar,
    reducers: {
       changeSize: (state, action) => {  //width, height
            state.width = action.payload.width;
            state.height = action.payload.height;
            // console.log("changeSize", action.payload);
            state.isMinScreen = action.payload.width < 576;
       } 
    }
});

//全局消息定义
export type MessageType = {
    msg: "",
    type: "success" | "error" | "info" | "warning"
}

const defaultMessage: MessageType = {
    msg: "",
    type: "info"
}
