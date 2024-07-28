

import { Button, Typography, Switch, Space, Row, Col, Slider} from "antd"
import { 
    SunOutlined,
    MoonOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useTranslation } from "../../../components";
import { AdminSkinSetting } from "../../../common/I18NNamespace";
import { useDispatch, useSelector } from "../../../redux/hooks";
import { themeConfigSlice } from "../../../redux/CommonSlice";


export const SidebarSettingComponent : React.FC = () => {

    const { t } = useTranslation(AdminSkinSetting);
    const dispatch = useDispatch();

    const sideThemeType = useSelector(state => state.themeConfig.sideTheme);
    const sideWidth = useSelector(state => state.themeConfig.sideWidth);
   
    const onChangeSideTheme = (checked: boolean, event) => {
        dispatch(themeConfigSlice.actions.changeSideTheme(checked?'light':'dark'))
    }

    const onSideWidthChange = (value) => {
        dispatch(themeConfigSlice.actions.changeSideWidth(value))
    }

    const reset = () => {
        dispatch(themeConfigSlice.actions.resetSidebar(null))
    }

    return <>
        <Typography.Title level={5}>{t('侧边栏')}</Typography.Title>
                <Space align="center">
                    {t('暗色')}
                    <Switch
                        checkedChildren={<SunOutlined />}
                        unCheckedChildren={<MoonOutlined />}
                        defaultChecked = {sideThemeType == 'light'}
                        onChange={onChangeSideTheme}
                    />
                    {t('亮色')}
                </Space>

                <Typography.Title level={5}>{t('侧边栏宽度')}</Typography.Title>
                <Row align='middle'>
                    <Col span={20}>
                        <Slider
                            min={150}
                            max={800}
                            step={10}
                            onChange={onSideWidthChange}
                            value={sideWidth}
                        />
                    </Col>
                    <Col span={4}>
                        <Typography.Text>{sideWidth}</Typography.Text>
                    </Col>
                </Row>

                <div style={{margin: "25px 0px", textAlign: "center"}}>
                    <Button onClick={reset} block type="primary" icon={<ReloadOutlined />}>{t("重置")}</Button>
                </div>
    </>
}