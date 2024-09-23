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

import { useEffect, useState } from "react";
import { useRequest, useTranslation, useSelector } from "../../../hooks";
import { DoubleColumnLayout, IconFont, AuthButton, useLayer } from "../../../components";
import { MenuAddIcon, MenuDeleteIcon} from '../../../components/icon/svg/Icons';
import { Tree, Space, Form, Typography, Input, TreeSelect, 
    Radio, Select,theme,Divider, Button, InputNumber
} from 'antd';
import {SendOutlined} from '@ant-design/icons'
import type { TreeDataNode, TreeProps } from 'antd';
import { api } from "../../../common/api";
import { permission } from '../../../common/permission';
import { AdminMenu, DefaultNS } from "../../../common/I18NNamespace";
import iconfonts from "../../../components/icon/iconfont/iconfont.json"
import { useDict } from "../../../common/dict";
import { useShowResult } from "../../../hooks/useShowResult";

type MenuType = {
    id: number,
    parentId: number,
    name: string,
    sort: number,
    path: string,
    query?: string,
    type: number,
    status: number,
    icon: string
}

/**
 * 菜单管理
 * @returns 
 */
export const MenuPage : React.FC = () => {

    const { token } = theme.useToken();
    const screenWidth = useSelector(state => state.globalVar.width);
    const sidemenuCollapsed = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const sideWidth = useSelector(state => state.themeConfig.sideWidth);
    const size = useSelector(state => state.themeConfig.componentSize);
    const {t} = useTranslation(AdminMenu);
    const showResult = useShowResult(AdminMenu);

    const request = useRequest();
    const {message, confirm} = useLayer();

    const [containerWidth, setContainerWidth] = useState<number>();
    const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
    const [selectTreeData, setSelectTreeData] = useState<TreeDataNode[]>([]);
    const [form] = Form.useForm();
    const [treeExpandedKeys, setTreeExpandedKeys] = useState<any[]>([1]);

    const [title, setTitle] = useState("添加菜单");
    const [menu, setMenu] = useState<MenuType>();
    const [refreshTree, setRefreshTree] = useState(true);

    const menuTypes = useDict("MenuType");
    const menuStatus = useDict("MenuStatus");

    //获取菜单数据
    const getMenus = (key, setTreeData) => {
        let get = async () => {
            let result = await request.get(api.menu.list+"?id="+key);
            if(result.data && result.data.length > 0){
                let menus = result.data;
                menus.sort((m1, m2) => m1.sort - m2.sort);
                setTreeData((origin) =>
                    updateTreeData(origin, key, convertToTreeNode(menus)),
                );
                // result.data.forEach(i => menus.current.add(i));
            }else{
                message.warning(t("无数据", DefaultNS));
            }
        }
        get();
    }

    //加载子菜单的回调
    const onLoadData = ({ key, children }: any) =>{
        return new Promise<void>((resolve) => {
            if (children) {
                resolve();
                return;
            }
            getMenus(key, setTreeData);
            resolve();
        });
    }

    //下拉树加载子菜单的回调
    const onLoadSelectData = ({ key, children }: any) =>{
        return new Promise<void>((resolve) => {
            if (children) {
                resolve();
                return;
            }
            getMenus(key, setSelectTreeData);
            resolve();
        });
    }

    //将数据库的菜单对象转换成组件做需要的菜单数据
    const convertToTreeNode = (menus) => {
        return menus.map(menu => {

            return {
                title: menu.name+" ("+menu.sort+")",
                label: menu.name,
                key: menu.id,
                value: menu.id,
                isLeaf: menu.type === 1,
                icon: <IconFont fontClass={menu.icon} />,
                data:  menu,
            }
        });
    }

    //构建菜单的父子关系
    const updateTreeData = (list: TreeDataNode[], key: React.Key, children: TreeDataNode[]): TreeDataNode[] => {
        return  !list || list.length == 0 ? children : list.map((node) => {
            if (node.key === key) {
                return {
                    ...node,
                    children,
                };
            }
            if (node.children) {
                return {
                    ...node,
                    children: updateTreeData(node.children, key, children),
                };
            }
            return node;
        });
    }

    //初始调用
    useEffect(()=>{
        getMenus(0, (buildNode) => {
            let res = buildNode();
            setTreeData(res);
            setSelectTreeData(res);
        });
    }, [])

    //监听屏幕宽度
    useEffect(() => {
        setContainerWidth(
            sidemenuCollapsed ? screenWidth - 50 -50 : screenWidth - sideWidth - 50
        );

    }, [screenWidth, sideWidth, sidemenuCollapsed]);
    
    //左侧选中
    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        let m = info.node['data'];
        // console.log(m);
        if((m.icon as string).startsWith("icon-")){
            m.icon = m.icon.replace("icon-", "");
        }
        form.setFieldsValue(m);
        
        let tl = t('编辑菜单')+(":"+m.name)
        setTitle(tl);
        setMenu(m);
    };

    //准备添加菜单的初始数据
    const prepareAdd = () => {
        let newMenu = {
            id: 0,
            parentId: menu?.id || 0,
            name: "",
            sort: 0,
            path: "",
            query: "",
            type: 1,
            status: 0,
            icon: ""
        };
        setTitle(t("添加菜单"));
        setMenu(newMenu);
        form.setFieldsValue(newMenu);
    }

    const onLeftTreeExpand = (expandedKeysValue) => {
        // console.log(expandedKeysValue);
        setTreeExpandedKeys(expandedKeysValue as number[])
    }

    const doRefreshTree = () => {
        setRefreshTree(false);
        setTimeout(() => {
            getMenus(0, (buildNode) => {
                let res = buildNode();
                setTreeData(res);
                setSelectTreeData(res);
                setRefreshTree(true);
            });
        }, 60);
    }

    //提交表单
    const onFinish =  (values) => {
        if(values.icon){
            values.icon = "icon-"+values.icon;
        }

        values.id = menu?.id;

        let update = async () => {
            let result = await request.post(api.menu.saveOrUpdate, values, null, false);
            showResult.show(result);
            if(result.status){
                doRefreshTree();
            }
        }
        update();
    };

    let doDelete = () => {

        let deleteMenu = async () => {
            console.log("doDelete");
            try{
                let result = await request.get(api.menu.delete+"?id="+menu.id);
                showResult.show(result);
                if(result.status){
                    doRefreshTree();
                }
            }catch(e){
                let err = e as any;
                message.error(err.message);
           }

        }

        if(!menu || !menu.id) {
            message.warning(t("请选择要删除的菜单"));
            return;
        }

        confirm({
            content: t("确定要删除菜单：")+menu.name+"？",
            onOk: (onClose) => {
                if(menu.type === 0){
                    confirm({
                        content: t("该菜单为目录菜单, 确定要删除该菜单及其子菜单吗？"),
                        onOk: (close)=>{
                            deleteMenu();
                            close();
                        }
                    });
                }else{
                    deleteMenu();
                }
                onClose();
            }
        });

    }

    //左边的菜单列表dom
    const leftDom = <div style={{height: "100%", overflow: "auto"}}>
        <Space style={{justifyContent: 'end', padding: "10px", width: '100%'}}>
            <AuthButton type='primary' ghost size={size} tip={t('添加菜单')} shape="circle"
                icon={<MenuAddIcon type='primary' ghost/>}
                requiredPermissions={permission.menu.create.expression}
                onClick={prepareAdd}
            >
            </AuthButton>
            <AuthButton type='default' danger size={size} tip={t('删除菜单')} shape="circle"
                icon={<MenuDeleteIcon type="default" danger/>}
                requiredPermissions={permission.menu.delete.expression}
                onClick={doDelete}
            >
            </AuthButton>
        </Space>
        {refreshTree && <Tree loadData={onLoadData} treeData={treeData}  onSelect={onSelect}
            blockNode showLine showIcon 
            expandedKeys={[...treeExpandedKeys]}
            onExpand={onLeftTreeExpand}
            rootStyle={{height: "calc(100% - 60px)", padding: "15px 10px"}}
            style={{textAlign: 'left', height: '100%'}} 
        />
        }
        
    </div>

    //右边的菜单编辑界面
    const rightDom = <div style={{textAlign: "left"}}>
        <Typography.Title level={4} style={{marginTop: 12, marginBottom: 12, textAlign: "center"}}>{title}</Typography.Title>
        <div style={{ 
                    background: token.colorBgContainer, 
                    margin: "10px 0px 10px 10px", 
                    padding: "20px 20px",
                    borderRadius: token.borderRadius,
            }}
        >
            <Form style={{maxWidth: 650}}
                onFinish={onFinish}
                form={form}
                size={size}
                labelCol={{ flex: '90px' }}
            >
                <Form.Item<MenuType> label={t("菜单名")} name="name"
                    rules={[{ required: true, message: t('菜单名不能为空') }]}
                >
                    <Input allowClear></Input>
                </Form.Item>
                <Form.Item label={t("上级菜单")} name="parentId"
                     rules={[{ required: true, message: t('请选择上级菜单') }]}
                >
                    {refreshTree && <TreeSelect treeDefaultExpandedKeys={[1]}
                        style={{ width: '100%'}}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        placeholder={t('请选择')}
                        loadData={onLoadSelectData}
                        treeData={selectTreeData}
                    />
                    }
                </Form.Item>
                <Form.Item<MenuType> label={t("URL")} name="path"
                    rules={[{ required: true, message: t('URL不能为空') }]}
                >
                    <Input allowClear></Input>
                </Form.Item>
                <Form.Item<MenuType> label={t("类型")} name="type">
                    <Radio.Group>
                        {menuTypes && menuTypes.map(t => (
                            <Radio key={t.label} value={t.value}>{t.label}</Radio>
                        ))}
                    </Radio.Group>
                </Form.Item>
                <Form.Item<MenuType> label={t("图标")} name="icon"
                    rules={[{ required: true, message: t('图标不能为空') }]}
                >
                    <Select allowClear options={iconfonts.glyphs.map((item) => ({ label: item.font_class, value: item.font_class }))}
                        optionRender={(option , info: { index: number }) => {
                            return <div style={{display: 'flex', justifyContent: "space-between"}}>
                                <span>{option.label}</span>
                                <IconFont fontClass={'icon-'+option.value} />
                            </div>
                        }}
                        labelRender={(label) => {
                            return <div><IconFont fontClass={'icon-'+label.value} />
                                <span style={{display: 'inline-block', marginLeft: 6}}>{label.value}</span>
                            </div>
                        }}
                    ></Select>
                </Form.Item>
                <Form.Item<MenuType> label={t("状态")} name="status"
                    rules={[{ required: true, message: t('状态不能为空') }]}
                >
                    <Radio.Group>
                        {menuStatus && menuStatus.map(t => (
                            <Radio key={t.label} value={t.value}>{t.label}</Radio>
                        ))}
                    </Radio.Group>
                </Form.Item>
                <Form.Item<MenuType> label={t("排序")} name="sort"
                    rules={[{ required: true, message: t('排序不能为空') }]}
                >
                    <InputNumber min={0}></InputNumber >
                </Form.Item>
                <Form.Item<MenuType> label={t("参数")} name="query">
                    <Input allowClear></Input>
                </Form.Item>
                <Divider />
            </Form>
            <div style={{textAlign: 'center'}}>
                <Space>
                    <Button onClick={() => form.submit()} type="primary" icon={<SendOutlined />}>{t("确定", DefaultNS)}</Button>
                </Space>
            </div>
        </div>
    </div>

    return <DoubleColumnLayout width={containerWidth} leftWidth={300} left={leftDom} right={rightDom} />
}