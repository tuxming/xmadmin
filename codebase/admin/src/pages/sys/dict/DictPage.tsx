import { useContext, useEffect, useState } from "react";
import { AuthButton, DoubleColumnLayout, ModalContext, QueryComponent, useRequest, useTranslation } from "../../../components"
import { useSelector } from "../../../redux/hooks";
import { api } from "../../../common/api";
import { AdminDict, DefaultNS } from "../../../common/I18NNamespace";
import { App, Divider, Menu, Space } from "antd";
import { DictEdit, DictGroupEdit, DictList } from "./index";
import { FileAddIcon, FileDeleteIcon, FileEditIcon, DictAddIcon, DictDeleteIcon, DictEditIcon } from "../../../components/icon/svg/Icons";
import { permission } from "../../../common/permission";
import { computePx } from "../../../common/kit";


/**
 * 字典管理页
 */
export const DictPage : React.FC = () => {

    const {t, f} = useTranslation(AdminDict);
    const {message, modal} = App.useApp();
    const [containerWidth, setContainerWidth] = useState<number>();
    const screenWidth = useSelector(state => state.globalVar.width);
    const screenHeight = useSelector(state => state.globalVar.height);
    const sidemenuCollapsed = useSelector(state => state.themeConfig.sidemenuCollapsed);
    const sideWidth = useSelector(state => state.themeConfig.sideWidth);
    const size = useSelector(state => state.themeConfig.componentSize);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const request = useRequest();

    const [groups, setGroups] = useState<any[]>([]);
    const [query, setQuery] = useState({});
    const [leftWidth, setWidth] = useState(250);
    const [refresh, setRefresh] = useState({
        reset: false,
        tag: 1
    });

    const [selectedDictRows, setSelectedDictRows] = useState<any[]>([]);
    const [selectedGroup, setSelectGroup] = useState<any>();

    const [editGroupObj, setEditGroupObj] = useState<any>();
    const [isGroupEditOpen, setIsGroupEditOpen] = useState(false);
    const [isCreateDict, setIsCreateDict] = useState(false);
    const [title, setTitle] = useState<string>();
    const [dictTitle, setDictTitle] = useState<string>(t("添加字典"));

    const [isDictEditOpen, setIsDictEditOpen] = useState(false);
    const [selectedDict, setSelectedDict] = useState<any>();

    //构建语言分组菜单
    const buildItmes = (langs) => {
        return groups.map(g => {
            return {
                key: g.code,
                label: g.label+"-"+g.code,
            }
        })
    }
    const [items, setItems] = useState<any[]>();

    const getGroups = async () => {
        let result = await request.get(api.dict.groups);
        if(result.status){
            setGroups(result.data);
        }
    }

    //初始化加载资源分组
    useEffect(()=>{
        getGroups();
    }, []);

    useEffect(()=> {
        setItems(buildItmes(groups));
    }, [groups]);

    const onTableSelectChange =  (rows:any) => {
        setSelectedDictRows(rows);
    };

    const onQuery = (values) => {
        // console.log(values);
        setQuery(values);
    }

    //菜单选中
    const onSelectMenu = ({item, key}) => {
        // console.log(key, item); 
        // let ids = key.split("$$");
        // let langId =  ids[0]*1;

        setQuery({...query, groupName: key});
        setSelectGroup(groups.find(s => s.code === key));
        // setQuery({...query , groupName: ids[1], langId: langId});
    }

    //监听屏幕宽度
    useEffect(() => {
        setContainerWidth(
            sidemenuCollapsed ? screenWidth - 50 -50 : screenWidth - sideWidth - 50
        );

    }, [screenWidth, sideWidth, sidemenuCollapsed]);

    //创建字典分类
    const onCreateGroup  = () => {
        setEditGroupObj(null);
        setTitle(t("添加字典"))
        setIsCreateDict(true);
        setIsGroupEditOpen(true);
    }

    //编辑字典分类
    const onEditGroup = () => {
        if(!selectedGroup) {
            message.warning(t("请选中数据语言后，再编辑"));
            return;
        }

        setTitle(t("编辑字典"));
        setEditGroupObj(selectedGroup);
        setIsCreateDict(false);
        setIsGroupEditOpen(true);
    }

    //删除字典分类
    const onDeletGroup = () => {
        if(!selectedGroup) {
            message.warning(t("请选中字典后，删除"));
            return;
        }
        modal.confirm({
            title: f("确定要删除：%s?", [selectedGroup.label]),
            content: t("删除语言将会删除对应的所有数据"),
            onOk: () => {
                let doDelete = async () => {
                    let result = await request.get(api.dict.deleteGroup+"?code="+selectedGroup.code);
                    if(result.status){
                        message.success(t(result.msg, DefaultNS));
                        getGroups();
                    }else{
                        message.warning(t(result.msg));
                    }
                }
                doDelete();
            }
        });
    }

    //添加字典值
    const onCreateDict = () => {
        setSelectedDict(null);
        setDictTitle(t("添加字典数据"));
        setIsDictEditOpen(true);
        // setIsDictEditOpen(true);
    }

    //编辑字典值
    const onEditDict = () => {
        if(selectedDictRows == null || selectedDictRows.length == 0){
            message.warning(t("请选择一条数据"));
            return; 
        }
        setDictTitle(t("编辑字典数据"));
        setSelectedDict(selectedDictRows[0]);
        setIsDictEditOpen(true);
    }

    //删除字典值
    const onDeleteDict = () => {
        if(selectedDictRows == null || selectedDictRows.length == 0) {
            message.warning(t("请选中字典数据后，再点击删除"));
            return;
        }
        modal.confirm({
            title: f("确定要删除字典：%s?", [selectedDictRows[0].dictLabel]),
            onOk: () => {
                let doDelete = async () => {
                    let result = await request.get(api.dict.deleteDict
                            +"?id="+selectedDictRows[0].id
                        );
                    if(result.status){
                        message.success(t(result.msg, DefaultNS));
                        setRefresh({
                            reset: true,
                            tag: refresh.tag+1
                        });
                    }else{
                        message.warning(t(result.msg));
                    }
                }
                doDelete();
            }, 
        });
    }

    //关闭资源弹窗
    const onDictClose = (refresh) => {
        setIsDictEditOpen(false);
        if(refresh && query['groupName']){
            setRefresh({
                reset: true,
                tag: new Date().getTime()
            });
        }
    }

    const onGroupEditClose = (group) => {
        if(isCreateDict){
            if(group){
                setGroups([...groups, group]);
            }
        }else {
            getGroups();
        }
        setIsGroupEditOpen(false);
        setIsCreateDict(false);
    }

    //当组件使用窗口话的时候，获取窗口的位置信息，设置到表格
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

    let groupsDom = <div style={{height: (pos.height?pos.height - 85: "100%")}}>
        <Space.Compact>
            <AuthButton type='primary' size={size} tip={t("新增字典名")}
                icon={<DictAddIcon type='primary'/>} 
                onClick={onCreateGroup}
                requiredPermissions={permission.dict.groupAdd.expression}
            >
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t("编辑字典名")}
                icon={<DictEditIcon type='primary'/>} 
                onClick={onEditGroup}
                requiredPermissions={permission.dict.groupUpdate.expression}
            >
            </AuthButton>
            <AuthButton type='primary' size={size} ghost danger tip={t("删除字典名")}
                icon={<DictDeleteIcon type='primary' ghost/>} 
                onClick={onDeletGroup}
                requiredPermissions={permission.dict.groupDelete.expression}
            >
            </AuthButton>
        </Space.Compact>
        <Divider />
        <Menu style={{textAlign: 'left', height: 'calc(100% - 90px)', overflow: 'auto'}}
            mode="inline"
            items={items}
            onSelect={onSelectMenu}
        />
    </div>

    let resDom = <div style={{paddingLeft: 15}}>
        <QueryComponent onQuery={onQuery} />
        <Divider />
        <Space wrap>
            <AuthButton type='primary' size={size} tip={t("新增字典数据")}
                icon={<FileAddIcon type='primary'/>} 
                onClick={onCreateDict}
                requiredPermissions={permission.dict.add.expression}
            >
                {!onlyIcon && t('新增')}
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t("编辑字典数据")}
                icon={<FileEditIcon type='primary' />} 
                onClick={onEditDict}
                requiredPermissions={permission.dict.update.expression}
            >
                {!onlyIcon && t('编辑')}
            </AuthButton>
            <AuthButton type='primary' size={size} danger  ghost tip={t("删除字典数据")}
                icon={<FileDeleteIcon type='primary'  ghost/>} 
                onClick={onDeleteDict}
                requiredPermissions={permission.dict.delete.expression}
            >
                {!onlyIcon && t('删除')}
            </AuthButton>
        </Space>
        <Divider />
        <DictList onSelect={onTableSelectChange} query={query} refresh={refresh} 
            width={containerWidth - leftWidth - 50} usedWidth={leftWidth + 30}
            height={pos.height? (pos.height - 330) : (screenHeight - 450)}
        />
    </div>

    return <>
        <DoubleColumnLayout width={containerWidth} leftWidth={leftWidth}
            left={groupsDom} right={resDom}
        ></DoubleColumnLayout>
        {isGroupEditOpen && <DictGroupEdit group={editGroupObj} open={isGroupEditOpen} title={title} onClose={onGroupEditClose}/>}
        {isDictEditOpen && <DictEdit open={isDictEditOpen} groups={groups} dict={selectedDict} onClose={onDictClose} title={dictTitle} />}
    </>
}