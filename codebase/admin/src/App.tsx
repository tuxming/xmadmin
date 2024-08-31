import './App.css';
import { ConfigProvider, Spin, theme, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {AdminRouter} from "./AdminRouter";
import { useSelector, useDispatch } from './redux/hooks';
import { useEffect } from 'react';
import { globalVarSlice } from './redux/CommonSlice';
import { getOpacityColor } from './common/kit';
import { useTranslation } from './components/useTranslation';

import 'dayjs/locale/zh-cn';

/**
 * 在开发环境中react的所有组件会被渲染两次
 * https://stackoverflow.com/questions/73624115/react-router-6-3-0-render-component-twice
 * 这个是正常现象，在生产模式下只会渲染一次
 * 经过测试，当打包完成以后再部署到生产环境确实只执行渲染一次
 **/

/**
 * 添加一个全局Antd Message，通过dispatch(message.error | message.warning | message.success | message.info)
 */

function App() {
    //初始全局变量
    const dispatch = useDispatch();
    const {t} = useTranslation();

    //主题配置
    const { darkAlgorithm, defaultAlgorithm } = theme;
    const themeType = useSelector(state => state.themeConfig.theme);
    const sideThemeType = useSelector(state => state.themeConfig.sideTheme);
    const primaryColor = useSelector(state => state.themeConfig.colorPrimary);
    const borderRadius = useSelector(state => state.themeConfig.borderRadius);
    const loading = useSelector(state => state.loading);

    const bgOpacity = useSelector(state => state.themeConfig.bgOpacity);                  //背景透明度
    const containerOpacity = useSelector(state => state.themeConfig.containerOpacity);           //容器的透明度
    const sideItemOpacity = useSelector(state => state.themeConfig.sideItemOpacity);           //侧边菜单项的透明都
    const sideItemSelectOpacity = useSelector(state => state.themeConfig.sideItemSelectOpacity);      //侧边菜单项选中的透明度
    const componentSize = useSelector(state => state.themeConfig.componentSize);        //组件尺寸

    // 当组件挂载完成后，添加resize事件监听器
    useEffect(() => {
        document.body.classList.add(themeType);

        const handleResize = () => {
            dispatch(globalVarSlice.actions.changeSize({width: document.body.clientWidth, height: document.body.clientHeight}));
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); 

    const getOpacity = (opacity) => {
        if(opacity === null || opacity == undefined){
            return 1;
        }
        return opacity;
    }

    const {token} = theme.useToken();

    // console.log(token.sizeLG, token.sizeMD, token.sizeMS);

    return (
        <ConfigProvider 
            locale={zhCN} theme={{
                algorithm: themeType == 'dark'? darkAlgorithm : defaultAlgorithm,
                cssVar: false,
                token: {
                    colorPrimary: primaryColor,
                    borderRadius: borderRadius,
                    // colorBgBase: '#99999900' 
                    colorBgContainer: themeType == 'light' ? `rgba(255,255,255,${getOpacity(containerOpacity)})` : `rgba(0,0,0,${getOpacity(containerOpacity)})`,
                    size: componentSize == 'small'? token.sizeMS : componentSize == 'large' ? token.sizeLG: token.sizeMD,
                    // fontSize: componentSize == 'small'? token.fontSizeSM : componentSize == 'large' ? token.fontSizeXL: token.fontSizeLG,
                },

                components: {
                    Layout: {
                        bodyBg: themeType == 'light' ? `rgba(245,245,245, ${getOpacity(bgOpacity)})` : `rgba(0,0,0,${getOpacity(bgOpacity)})`,
                        headerBg: themeType == 'light' ? `rgba(245,245,245,${getOpacity(bgOpacity)})` : `rgba(0,0,0,${getOpacity(bgOpacity)})`,
                        siderBg: sideThemeType == 'light' ? `rgba(245,245,245,${getOpacity(bgOpacity)})` : `rgba(0,0,0,${getOpacity(bgOpacity)})`,
                        footerBg: themeType == 'light' ? `rgba(245,245,245,${getOpacity(bgOpacity)})` : `rgba(0,0,0,${getOpacity(bgOpacity)})`,
                    },
                    Menu: {
                        itemBg: getOpacityColor("#ffffff", sideItemOpacity || 1),
                        subMenuItemBg: getOpacityColor("#ffffff", sideItemOpacity || 1),
                        darkItemBg: `rgba(245,245,245, ${sideItemOpacity || 0.1})`,
                        darkSubMenuItemBg: `rgba(245,245,245, ${sideItemOpacity || 0.1})`,
                        darkItemSelectedBg: getOpacityColor(primaryColor, sideItemSelectOpacity || 0.8),
                        itemSelectedBg:  getOpacityColor(primaryColor, sideItemSelectOpacity || 0.2),
                    }, 
                }
            }}
        >
            
            <AntdApp>
                <Spin spinning={loading.value} tip={t("加载中...")} size='large' fullscreen />
                <div className="App">
                    <AdminRouter />
                </div>
            </AntdApp>
        </ConfigProvider>
    );
}

export default App;
