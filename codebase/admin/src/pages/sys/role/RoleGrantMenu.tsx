import { useEffect, useState } from "react"
import { IconFont, Modal } from "../../../components"
import { AdminRole } from "../../../common/I18NNamespace";
import { useRequest, useShowResult, useTranslation } from "../../../hooks";
import { Button, Divider, Typography,  TreeDataNode, TreeProps } from "antd";
import { Tree } from 'antd';
import { api } from "../../../common/api";

const sortMenu = (menus) => {
    menus.sort((m1, m2)=> m1.sort - m2.sort);
    menus.forEach(menu => {
        if(menu.children && menu.children.length>0){
            sortMenu(menu.children);
        }
    });
}

/**
 * 给角色分配菜单
 */
export const RoleGrantMenu : React.FC<{
    roleId: number,
    onClose: () => void,
}>= ({
    roleId, 
    onClose
}) => {

    const {t} = useTranslation(AdminRole);
    const request = useRequest();
    const [visible, setVisible] = useState<boolean>(true);
    const [treeData, setTreeData] = useState<TreeDataNode[]>();
    const showResult = useShowResult(AdminRole);

    const [checkedKeys, setCheckedKeys] = useState<any>({
        checked: [],
        halfChecked: []
    });
   

    //获取当前登录用户的所有菜单
    const getAll = async () => {
        let result = await request.get(api.menu.curr);
        if(result){
            let menus = result.data.map(p => ({
                title: p.name+" ("+p.sort+")",
                key: p.id,
                value: p.id,
                icon: <IconFont fontClass={p.icon} />,
                data:  p,
                ppid: p.parentId,
                sort: p.sort
            }));

            let mapMenu = {};
            menus.forEach(menu => mapMenu[menu.key] = menu);
            mapMenu[0] = {name: "root", label:"根菜单", key: 0, ppid: null, children: []};
            menus.forEach(menu => {
                let parentId = menu.ppid;
                if(parentId || parentId === 0){
                    let parent = mapMenu[parentId];
                    if(parent){
                        if(!parent.children){
                            parent['children'] = [];
                        }
                        parent.children.push(menu);
                    }
                }
            });
            // console.log(mapMenu);
            // console.log(mapMenu);
            let currMenus = mapMenu[1].children;
            sortMenu(currMenus);
            setTreeData(currMenus);
        }
    }

    //获取指定角色的菜单
    let getMenuByRole = async () => {
        let result = await request.get(api.menu.byRole+"?id="+roleId);
        if(result.status){
            let checkeds = [];
            let halfCheckeds = [];
            result.data.forEach(menu => {
                if(menu.checked == 2){
                    checkeds.push(menu.id);
                }else if(menu.checked==1){
                    halfCheckeds.push(menu.id);
                }
            });

            setCheckedKeys({
                checked: checkeds,
                halfChecked: halfCheckeds
            });
        }
    }

    useEffect(()=>{
        getAll();
        getMenuByRole();
    }, []);

    // const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
    const onCheck: TreeProps['onCheck'] = (checkedKeysValue, {halfCheckedKeys}) => {
        // console.log('onCheck', checkedKeysValue, halfCheckedKeys);
        // setCheckedKeys(checkedKeysValue as React.Key[]);
        setCheckedKeys({
            checked: checkedKeysValue,
            halfChecked: halfCheckedKeys
        });
    };

    const onSelect: TreeProps['onSelect'] = (selectedKeysValue, info) => {
        // console.log('onSelect', selectedKeysValue, info);
        // setSelectedKeys(selectedKeysValue);
        // [...checkedKeys, ...selectedKeysValue]
        if(info.selected){
            setCheckedKeys({
                checked: [...checkedKeys.checked, ...selectedKeysValue],
                halfChecked: [...checkedKeys.halfChecked]
            });
        }else{
            setCheckedKeys({
                checked: checkedKeys.checked.filter(k => k !== info.node.key),
                halfChecked: [...checkedKeys.halfChecked]
            });
        }
       
    };

    const onCloseModal = () => {
        setVisible(false);
        setTimeout(() => {
            onClose();
        }, 500);
    }

    //保存
    const onClickOk = async () => {
        
        let data = [];
        checkedKeys.checked.forEach(key => data.push({menuId: key, checked: 2}));
        checkedKeys.halfChecked.forEach(key => data.push({menuId: key, checked: 1}));

        let result = await request.post(api.role.grantMenus+"?id="+roleId, data);
        showResult.show(result);
        onCloseModal();
    }

    return (<Modal width={400} open={visible} onClose={onCloseModal} 
        title={t("分配菜单")}
    >
        <div style={{padding: "0px 20px 10px 40px", minHeight: 480, overflowY: 'auto'}}>
            <Typography.Title level={4} style={{marginTop: 20, marginBottom: 20, textAlign: "center"}}>{t('分配菜单')}</Typography.Title>
            {treeData && treeData.length>0 && 
                <Tree
                    checkable
                    defaultExpandAll={true}
                    autoExpandParent={true}
                    onCheck={onCheck}
                    checkedKeys={checkedKeys}
                    onSelect={onSelect}
                    treeData={treeData}
                />
            }
            <Divider />
            <div style={{
                textAlign: "center",
            }}>
                <Button onClick={onCloseModal}>{t('取消')}</Button>
                <Button onClick={onClickOk} type="primary" style={{
                    marginLeft: 20
                }}>{t('确定')}</Button>
            </div>
        </div>
    </Modal>)
}