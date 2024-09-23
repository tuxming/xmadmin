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

import { useContext, useEffect, useState } from "react";
import { useRequest, useTranslation, useSelector } from "../../../hooks"
import { AuthButton, DoubleColumnLayout, ModalContext, QueryComponent, useLayer } from "../../../components"
import { api } from "../../../common/api";
import { AdminLang } from "../../../common/I18NNamespace";
import {  Divider, Menu, Space } from "antd";
import { ResourceList, LangEdit, LangEditFormType, ResourceEdit } from "./index";
import { FileAddIcon, FileDeleteIcon, FileEditIcon, LangAddIcon, LangDeleteIcon, LangEditIcon } from "../../../components/icon/svg/Icons";
import { permission } from "../../../common/permission";
import { computePx } from "../../../common/kit";
import { useShowResult } from "../../../hooks/useShowResult";


/**
 * 语言资源管理页
 */
export const LangPage : React.FC = () => {

    const {t, f} = useTranslation(AdminLang);
    const {message, confirm} = useLayer();
    const [containerWidth, setContainerWidth] = useState<number>();
    const screenWidth = useSelector(state => state.globalVar.width);
    const screenHeight = useSelector(state => state.globalVar.height);
    const sidemenuCollapsed = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const sideWidth = useSelector(state => state.themeConfig.sideWidth);
    const size = useSelector(state => state.themeConfig.componentSize);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const request = useRequest();
    const showResult = useShowResult(AdminLang);

    const [groups, setGroups] = useState<any[]>([]);
    const [langs, setLangs] = useState<any[]>([]);
    const [query, setQuery] = useState({});
    const [leftWidth, setWidth] = useState(250);
    const [refresh, setRefresh] = useState({
        reset: false,
        tag: 1
    });

    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [selectedResRows, setSelectedResRows] = useState<any[]>([]);
    const [selectedLang, setSelectLang] = useState<any>();

    const [editLangObj, setEditLangObj] = useState<any>();
    const [isLangEditOpen, setIsLangEditOpen] = useState(false);
    const [isCreateLang, setIsCreateLang] = useState(false);
    const [title, setTitle] = useState<string>();

    const [isResEditOpen, setIsResEditOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<any>();

    //构建语言分组菜单
    const buildItmes = (langs) => {
        return groups.map(g => {
            return {
                key: g,
                label: g,
                children: langs.map(lang => {
                    return {key: lang.id+"$$"+g, label: lang.label+"("+lang.code+")", id: lang.id}
                })
            }
        })
    }
    const [items, setItems] = useState<any[]>();

    const getLangs = async () => {
        let result = await request.get(api.lang.langs);
        if(result.status){
            setLangs(result.data);
        }
    }

    const getGroups = async () => {
        let result = await request.get(api.lang.groups);
        if(result.status){
            setGroups(result.data);
        }
    }

    //初始化加载资源分组
    useEffect(()=>{
        getGroups();
        getLangs();
    }, []);
    useEffect(()=> {
        setItems(buildItmes(langs));
    }, [langs]);


    const onTableSelectChange =  (rows:any) => {
        setSelectedResRows(rows);
    };

    const onQuery = (values) => {
        // console.log(values);
        setQuery(values);
    }

    //展开/关闭菜单， 保证只展开一个菜单
    const onOpenMenu = (keys: string[]) => {
        if(keys.length < 2){
            setOpenKeys(keys);
        }else{
            setOpenKeys(prevKeys => keys.filter(k => prevKeys.indexOf(k) == -1))
        }
    }

    //菜单选中
    const onSelectMenu = ({item, key}) => {
        // console.log(item, key);
        let ids = key.split("$$");
        let langId =  ids[0]*1;

        setSelectLang(langs.find(s => s.id == langId));
        setQuery({...query , groupName: ids[1], langId: langId});
    }

    //监听屏幕宽度
    useEffect(() => {
        setContainerWidth(
            sidemenuCollapsed ? screenWidth - 50 -50 : screenWidth - sideWidth - 50
        );

    }, [screenWidth, sideWidth, sidemenuCollapsed]);

    //创建语言
    const onCreateLang = () => {
        setTitle(t("创建语言"));
        setEditLangObj({});
        setIsLangEditOpen(true);
        setIsCreateLang(true);
    }
    //编辑语言
    const onEditLang = () => {

        if(!selectedLang) {
            message.warning(t("请选中数据语言后，再编辑"));
            return;
        }

        setTitle(t("编辑语言"));
        setEditLangObj(selectedLang);
        setIsLangEditOpen(true);
        setIsCreateLang(false);
    }
    //编辑，创建语言后的回调
    const onLangEditClose = (lang: LangEditFormType) => {
        setIsLangEditOpen(false);
        if(isCreateLang){
            if(lang){
                setLangs([...langs, lang])
            }
        }else {
            if(lang){
                let index = langs.findIndex(s => s.id == lang.id);
                if(index>-1){
                    let ls = [...langs];
                    ls[index] = lang;
                    setLangs(ls);
                    // setItems(buildItmes(ls));
                }
            }
        }
    }
    //删除语言
    const onLangDelete = () => {
        if(!selectedLang) {
            message.warning(t("请选中数据语言后，删除"));
            return;
        }
        confirm({
            title: f("确定要删除语言：%s?", [selectedLang.label]),
            content: t("删除语言将会删除语言对应的所有资源"),
            onOk: () => {
                let doDelete = async () => {
                    let result = await request.get(api.lang.deleteLang+"?id="+selectedLang.id);
                    showResult.show(result);
                    if(result.status){
                        getLangs();
                    }
                }
                doDelete();
            }
        });
    }

    //添加资源
    const onResCreate = () => {
        setSelectedResource(null);
        setIsResEditOpen(true);
    }
    //编辑资源
    const onResEdit = () => {
        if(selectedResRows == null || selectedResRows.length == 0){
            message.warning(t("请选择一条数据"));
            return; 
        }
        setSelectedResource(selectedResRows[0]);
        setIsResEditOpen(true);
    }
    //关闭资源弹窗
    const onResClose = (refresh) => {
        setIsResEditOpen(false);
        if(refresh){
            setRefresh({
                reset: true,
                tag: (refresh.tag || 1)+1
            });
        }
    }
     //删除语言资源
     const onResDelete = () => {
        if(!selectedResRows) {
            message.warning(t("请选中数据语言后，再点击删除"));
            return;
        }
        confirm({
            content: f("确定要删除语言资源：%s?", [selectedResRows[0].resKey]),
            onOk: (onClose) => {
                confirm({ 
                    content: f("是否要删除: %s， 下面所有的翻译", [selectedResRows[0].resKey]),
                    onOk: (close) => {
                        doDeleteRes(true);
                        close();
                    },
                    onCancel: () => {
                        doDeleteRes(false);
                    }
                });
                onClose();
            }, 
        });
    }

    const doDeleteRes = (deleteAll) => {
        let doDelete = async () => {
            let result = await request.get(api.lang.deleteRes
                    +"?id="+selectedResRows[0].id
                    +"&a="+(deleteAll?"1":"0")
                );
            showResult.show(result);
            if(result.status){
                setRefresh({
                    reset: true,
                    tag: refresh.tag+1
                });
            }
        }
        doDelete();
    }

    const modalPos = useContext(ModalContext);
    const [pos, setPos] = useState({
        width: null, 
        height: null,
    });

    useEffect(()=> {
        if(modalPos && modalPos.width && modalPos.height){
            let npos = {
                width: computePx(modalPos.width),
                height: computePx(modalPos.height, true)
            };
            // console.log(modalPos, npos);
            setPos(npos)
        }

    }, [modalPos]);

    let groupsDom = <div style={{height: (pos.height?pos.height - 90: "100%")}}>
        <Space.Compact>
            <AuthButton type='primary' size={size} tip={t("新增语言")}
                icon={<LangAddIcon type='primary'/>} 
                onClick={onCreateLang}
                requiredPermissions={permission.lang.langAdd.expression}
            >
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t("编辑资源")}
                icon={<LangEditIcon type='primary'/>} 
                onClick={onEditLang}
                requiredPermissions={permission.lang.langEdit.expression}
            >
            </AuthButton>
            <AuthButton type='primary' size={size} ghost danger tip={t("删除资源")}
                icon={<LangDeleteIcon type='primary'  ghost/>} 
                onClick={onLangDelete}
                requiredPermissions={permission.lang.langDelete.expression}
            >
            </AuthButton>
        </Space.Compact>
        <Divider />
        <Menu style={{textAlign: 'left', height: 'calc(100% - 90px)', overflow: 'auto'}}
            mode="inline"
            items={items}
            openKeys={openKeys}
            onOpenChange={onOpenMenu}
            onSelect={onSelectMenu}
        />
    </div>

    let resDom = <div style={{paddingLeft: 15}}>
        <QueryComponent onQuery={onQuery} />
        <Divider />
        <Space wrap>
            <AuthButton type='primary' size={size} tip={t("新增语言")}
                icon={<FileAddIcon type='primary'/>} 
                onClick={onResCreate}
                requiredPermissions={permission.lang.resAdd.expression}
            >
                {!onlyIcon && t('新增')}
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t("编辑资源")}
                icon={<FileEditIcon type='primary' />} 
                onClick={onResEdit}
                requiredPermissions={permission.lang.resEdit.expression}
            >
                {!onlyIcon && t('编辑')}
            </AuthButton>
            <AuthButton type='primary' size={size} danger  ghost tip={t("删除资源")}
                icon={<FileDeleteIcon type='primary'  ghost/>} 
                onClick={onResDelete}
                requiredPermissions={permission.lang.resDelete.expression}
            >
                {!onlyIcon && t('删除')}
            </AuthButton>
        </Space>
        <Divider />
        <ResourceList onSelect={onTableSelectChange} query={query} refresh={refresh} 
            width={containerWidth - leftWidth - 50} usedWidth={leftWidth + 30}
            height={pos.height? (pos.height - 340) : (screenHeight - 450)}
        />
    </div>

    return <>
        <DoubleColumnLayout width={containerWidth} leftWidth={leftWidth}
            left={groupsDom} right={resDom}
        ></DoubleColumnLayout>
        {isLangEditOpen && <LangEdit lang={editLangObj} open={isLangEditOpen} title={title} onClose={onLangEditClose}/>}
        {isResEditOpen && <ResourceEdit langs={langs} open={isResEditOpen} groups={groups} resource={selectedResource} onClose={onResClose}/>}
    </>
}