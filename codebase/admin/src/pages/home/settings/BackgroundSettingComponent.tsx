
import {useState} from 'react'
import {Typography, Image, Button, Row, Col, Slider } from "antd";
import { WallpaperModal} from './index';
import { themeConfigSlice } from '../../../redux/CommonSlice';
import { AdminSkinSetting } from '../../../common/I18NNamespace';
import { useTranslation, useSelector, useDispatch } from '../../../hooks';

//壁纸设置
export const BackgroundSettingComponent : React.FC = () => {

    const { t } = useTranslation(AdminSkinSetting);
    const imgUrl = useSelector(state => state.themeConfig.wallpaperUrl);
    const [open, setOpen] = useState(false);

    //背景透明都
    const bgOpacity = useSelector(state => state.themeConfig.bgOpacity);
    //容器背景透明度
    const containerBgOpacity = useSelector(state => state.themeConfig.containerOpacity);
    //侧边菜单项透明度
    const sideItemOpacity = useSelector(state => state.themeConfig.sideItemOpacity);
    //侧边栏选中的透明
    const sideItemSelectOpacity = useSelector(state => state.themeConfig.sideItemSelectOpacity);
    //背景模糊度
    const bgBlur = useSelector(state => state.themeConfig.bgBlur);

    const dispatch = useDispatch();

    const changeBgOpacityRadius = (value) => {
        dispatch(themeConfigSlice.actions.changeBgOpacity(value));
    }

    const changeContainerBgOpacity = (value) => {
        dispatch(themeConfigSlice.actions.changeContainerOpacity(value));
    }

    const changeSideItemOpacity = (value) => {
        dispatch(themeConfigSlice.actions.changeSideItemOpacity(value));
    }
    
    const changeSideItemSelectOpacity = (value) => {
        dispatch(themeConfigSlice.actions.changeSideItemSelectOpacity(value));
    }

    const changeBgBlur = (value) => {
        dispatch(themeConfigSlice.actions.changeBgBlur(value));
    }

    return <>
        <Typography.Title level={5}>壁纸</Typography.Title>
        <div style={{marginTop: 25, position: 'relative'} }>
            <Image preview={false} onClick={() => setOpen(true)}
                width="100%"
                src={imgUrl}
                fallback="data:image/png;base64,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"
            />
            <Button onClick={() => {setOpen(true)}} 
                style={{
                    position: 'absolute',
                    bottom: 30,
                    zIndex: 10,
                    left: 70
                }}
            >更换壁纸</Button>
        </div>
        <Typography.Text strong style={{marginTop: 25, display: 'block'} }>{t('背景透明度')}</Typography.Text>
        <Row align='middle'>
            <Col span={20}>
                <Slider
                    min={0}
                    step={0.1}
                    max={1}
                    onChange={changeBgOpacityRadius}
                    value={bgOpacity}
                />
            </Col>
            <Col span={4}>
                <Typography.Text>{bgOpacity}</Typography.Text>
            </Col>
        </Row>
        <Typography.Text strong style={{marginTop: 20, display: 'block'} }>{t('容器背景透明度')}</Typography.Text>
        <Row align='middle'>
            <Col span={20}>
                <Slider
                    min={0}
                    step={0.1}
                    max={1}
                    onChange={changeContainerBgOpacity}
                    value={containerBgOpacity}
                />
            </Col>
            <Col span={4}>
                <Typography.Text>{containerBgOpacity}</Typography.Text>
            </Col>
        </Row>
        <Typography.Text strong style={{marginTop: 20, display: 'block'} }>{t('侧边菜单项透明度')}</Typography.Text>
        <Row align='middle'>
            <Col span={20}>
                <Slider
                    min={0}
                    step={0.1}
                    max={1}
                    onChange={changeSideItemOpacity}
                    value={sideItemOpacity}
                />
            </Col>
            <Col span={4}>
                <Typography.Text>{sideItemOpacity}</Typography.Text>
            </Col>
        </Row>
        <Typography.Text strong style={{marginTop: 20, display: 'block'} }>{t('侧边菜单选中项透明度')}</Typography.Text>
        <Row align='middle'>
            <Col span={20}>
                <Slider
                    min={0}
                    step={0.1}
                    max={1}
                    onChange={changeSideItemSelectOpacity}
                    value={sideItemSelectOpacity}
                />
            </Col>
            <Col span={4}>
                <Typography.Text>{sideItemSelectOpacity}</Typography.Text>
            </Col>
        </Row>
        <Typography.Text strong style={{marginTop: 20, display: 'block'} }>{t('背景模糊度')}</Typography.Text>
        <Row align='middle'>
            <Col span={20}>
                <Slider
                    min={0}
                    step={1}
                    max={100}
                    onChange={changeBgBlur}
                    value={bgBlur}
                />
            </Col>
            <Col span={4}>
                <Typography.Text>{bgBlur}</Typography.Text>
            </Col>
        </Row>
        <WallpaperModal open={open} close={() => setOpen(false)}/>
    </>
}