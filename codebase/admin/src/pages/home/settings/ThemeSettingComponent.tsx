


import {Typography, Switch, Space, theme, ColorPicker, Slider, Row, Col, Radio, Button} from "antd"
import { 
    SunOutlined,
    MoonOutlined,
    CloseOutlined,
    CheckOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { themeConfigSlice } from '../../../redux/CommonSlice';
import { useTranslation, useSelector, useDispatch } from "../../../hooks";
import { AdminSkinSetting } from "../../../common/I18NNamespace";

/**
 * 主题设置
 */
export const ThemeSettingComponent : React.FC = () => {
    const { t } = useTranslation(AdminSkinSetting);
    const borderRadius = useSelector(state => state.themeConfig.borderRadius);
    const dispatch = useDispatch();
    const themeType = useSelector(state => state.themeConfig.theme);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const componentSize = useSelector(state => state.themeConfig.componentSize);

    const onChangeTheme = (checked: boolean, event) => {
        document.body.classList.remove(themeType);
        let newType = checked?'light':'dark';
        dispatch(themeConfigSlice.actions.changeTheme(newType));
        document.body.classList.add(newType);
    }

    const changePrimaryColor = (color) => {
        dispatch(themeConfigSlice.actions.changeColor(color))
    }

    const changeBorderRadius = (value) => {
        dispatch(themeConfigSlice.actions.changeBorderRadius(value));
    }

    const changeOnlyIcon = (value) => {
        dispatch(themeConfigSlice.actions.changeOnlyIcon(value));
    }

    const onComponeSizeChange = (event: any) => {
        // console.log(event.target.value);
        dispatch(themeConfigSlice.actions.changeComponentSize(event.target.value));
    }

    const {token} = theme.useToken();
    
    const colors = [
        token['red-5'],
        token.volcano5,
        token.orange5,
        token.gold5,
        token.yellow6,
        token.lime6,
        token.green6,
        token.cyan6,
        token.blue6,
        token.geekblue6,
        token.purple5,
        token['magenta-6'],
    ]

    const imgData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wgARCAAoACgDAREAAhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAABwgFCQECAwb/xAAbAQEAAgMBAQAAAAAAAAAAAAAHBQgEBgkCA//aAAwDAQACEAMQAAAAtDxz5W1UCFyvPjBIQ3DFlnlQSIjmYjFNq9UXBpsZ4z082a8AvOs5DAi8eCll17Fx33nreeBxljInF9fGdVbdb7EI+oXh8+aZq4cPoRWE8NMu9OXutT//xAAwEAABBAECAwcDAwUAAAAAAAABAgMEBREABgghMQcJEhMUIkFRYXEVUpGBweHx8v/aAAgBAQABPwDi84td0jcs3su7MbdyDGgrLNnZxTh514ZCm0K6oCTyKhhWQeYHXcz1hcFyZZz3n3lc1uyHCtRJ+SVEnW80+QF5T01a7ptdvThYUlrJiSWiFIfivKbWkjoQpJBB/rruzO9I30e0ur4cuIfdD1xXXb6Ye3r+evxSoks8m2HnOrqHFe0KVlYWtIJKelk7ItZ0iwmKK3ZDynHVk5JUo5Jz9zqTEICs9NdrjIq2HHDyH/P51vLc7YecAc6f4+2ou/JtBfRb+rlKalQJbchhxCiClxCgtJB+CCAdekJGPDr9Jcd9qU9dcbZ3PtXbEM0tJ6lEnzPUP+oSnyMKRj2nJVnOOXTVuL6Y+pctzw5+PCP7aVVKJytXPT9S9DluwpDZDjLim3AfhQOCP5GpTkasYL7vXXEbYK3Mw608vI/b/H4+mtx0CGH3EeXg/wCvvqt2jMv7uJQ1jBclTZTceM2gElTi1BKQAOpJI1xJcOF7HvJnaBsGqXLYlrLs2DHGXG3DzUtKRzWFHmQMkE631NnQluRJsV5hYOFIdQUKBGOoIBGu0F31SVk6vNq2txY+hpayRMfWQlLEZhS1qJwAAACSc/TXdi915v17tHq+IniE2u9UVlM+mXQUM5GJEuSnm286jq0hB9wSrCipKSQEjn//xAAlEQABBAEEAgIDAQAAAAAAAAABAAIDBAUGBxESITETIwhBUWH/2gAIAQIBAT8Ar365sDgrB3YpAAFh3d3BVqTLMBa4cgrcbbalWoOymNZ1LfLmj0R/QP0sdqf7eSVpLVcTpACVo2w27wQqzPiYrELbEJZKOQVDmbUb+wKx2tb9KXsF+Ou7ta+ZIckehbx1/wBUOrqU7eY/IQzrHD2pq89eUsKq13Sv44W30AxkgkHsrTeobIiHY+FWzj+PJW4W21uW669jm8tPsfxUMZLV+t7eCtPM+PhYS49o4Cfk52w9fRX/xAAkEQABBAICAgIDAQAAAAAAAAABAAIDBAURBiESMQcTCBRBUf/aAAgBAwEBPwDleVsgGCt6V1skFol6xXnN2sRDJIRpY+rZdB2Fk+OufETpcl4w9kRc0drBNlEv1riHGZrDA/SxXGCYfSODilGiFc4JXug9Li/42NyeVNqOTQHetLEfHEWFg+jw9JuHhg6a1Voopm7Co48OcuIV46ThsK9joJmecY7Ku1YqbC6Q6C4ZyyrHE2ncd469H+LENhmYJGHYKwsbmHtfuVqtIvlOgPZK+YflrFWaEmKxD/NzunPHoD/Af7tf/9k=';

    const reset = () => {
        dispatch(themeConfigSlice.actions.resetTheme(null));
    }

    return <>
        <Typography.Title level={5}>{t('主题')}</Typography.Title>
        <Space align="center">
            {t('暗色')}
            <Switch
                checkedChildren={<SunOutlined />}
                unCheckedChildren={<MoonOutlined />}
                defaultChecked={themeType == 'light'}
                onChange={onChangeTheme}
            />
            {t('亮色')}
        </Space>
        <div>
            <Typography.Text strong style={{display:'block',marginTop: 25, marginBottom: 10}}>{t('主颜色')}</Typography.Text>
            <Space align="center" wrap>
                {colors.map(color => <span className='color-block-wrap' key={color}>
                    <span onClick={() => changePrimaryColor(color)} className="color-block" style={{background: color}}></span>
                    </span>
                )}
                <span className='color-block-wrap' >
                    <ColorPicker defaultValue="#1677ff" onChange={(value, hex)=>{changePrimaryColor(hex)}}><img className='color-block' src={imgData}/></ColorPicker>
                </span>
            </Space>
        </div>
        <div>
            <Typography.Text strong style={{display:'block',marginTop: 25, marginBottom: 10}}>{t('组件圆角')}</Typography.Text>
            <Row align='middle'>
                <Col span={20}>
                    <Slider
                        min={1}
                        max={40}
                        onChange={changeBorderRadius}
                        value={borderRadius}
                    />
                </Col>
                <Col span={4}>
                    <Typography.Text>{borderRadius}</Typography.Text>
                </Col>
            </Row>
        </div>

        <Typography.Title level={5}>{t('只显示图标')}</Typography.Title>
        <Space align="center">
            <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                defaultChecked = {onlyIcon}
                onChange={changeOnlyIcon}
            />
        </Space>

        <Typography.Title level={5}>{t('组件尺寸')}</Typography.Title>
        <Space align="center">
        <Radio.Group onChange={onComponeSizeChange} value={componentSize}>
            <Radio value={'small'}>小</Radio>
            <Radio value={'middle'}>中</Radio>
            <Radio value={'large'}>大</Radio>
        </Radio.Group>
        </Space>

        <div style={{margin: "25px 0px", textAlign: "center"}}>
            <Button onClick={reset} block type="primary" icon={<ReloadOutlined />}>{t("重置")}</Button>
        </div>
    </>
}