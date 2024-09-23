/*
 * MIT License
 *
 * Copyright (c) 2024 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */



import { Button, Typography, Switch, Space, Row, Col, Slider} from "antd"
import { 
    SunOutlined,
    MoonOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useTranslation, useSelector, useDispatch } from "../../../hooks";
import { AdminSkinSetting } from "../../../common/I18NNamespace";
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