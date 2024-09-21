import React, {useMemo, useState} from 'react';
import {Space, Divider, MenuProps, Dropdown } from "antd"
import { DeleteIcon, EditIcon, AddIcon, GrantMenuIcon, GrantPermissionIcon, } from '../../../components/icon/svg/Icons';
import { RoleQuery, RoleList, RoleEdit, RoleDelete, RoleGrantPermisison } from './index'
import { useLayer } from '../../../components';
import { useAuth, useSelector, useTranslation } from '../../../hooks';
import { AdminRole } from '../../../common/I18NNamespace';
import { AuthButton } from '../../../components/wrap/AuthButton';
import { permission } from '../../../common/permission';
import { DownOutlined } from '@ant-design/icons';
import { RoleGrantMenu } from './RoleGrantMenu';

/**
 * 角色管理页面
 */
export const RolePage : React.FC = () => {

    const {t} = useTranslation(AdminRole);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const size = useSelector(state => state.themeConfig.componentSize);
    const {message} = useLayer();
    const auth = useAuth();
    const [query, setQuery] = useState({});
    const [selectedRows, setSelectedRows] = useState<any>();

    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [role, setRole] = useState();
    const [deletes, setDeletes] = useState<any>([]);
    const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);
    const [refresh, setRefresh] = useState({
        reset: false,
        tag: 1
    });

    const [grantPermissionVisible, setGrantPermissionVisible] = useState(false);
    const [grantPermissionRoleId, setGrantPermissionRoleId] = useState<any>();

    const [grantMenuVisible, setGrantMenuVisible] = useState(false);
    const [grantMenuRoleId, setGrantMenuRoleId] = useState<any>();


    //执行查询
    let onQuery = (values) => {
        // console.log(values);
        setQuery(values);
    }

    //表格选中
    const onTableSelectChange =  (rows:any) => {
        // console.log(rows);
        setSelectedRows(rows);
    };

    //编辑
    const onEdit = () => {
        if(!selectedRows || selectedRows.length == 0){
            message.error(t("请选择要编辑的角色"));
            return;
        }

        setRole(selectedRows[0]);
        setIsOpenEdit(true);
    }

    //编辑
    const onCreate = () => {
        setIsOpenEdit(true);
        setRole(null);
    }

    //新增，编辑弹窗的关闭回调
    const onAddClose = (needRefresh) => {
        if(needRefresh){
            setRefresh({reset: false, tag: refresh.tag+1});
        }
        setIsOpenEdit(false)
    }
    
     /**
     * 刷新列表
     */
     const onRefresh = () => {
        setRefresh({reset: false, tag: refresh.tag+1});
    }

     /**
     * 执行删除
     */
     const onDelete = () => {
        if(!selectedRows || selectedRows.length==0){
            message.error(t("请选择要删除的角色"));
            return;
        }
        setDeletes(selectedRows);
        setIsOpenDelete(true);
    }
    //删除回调
    const onDeleteClose = (needRefresh) => {
        if(needRefresh){
            setRefresh({reset: false, tag: refresh.tag+1});
        }
        setDeletes([]);
        setIsOpenDelete(false);
    }

    //分配菜单
    const grantMenus = () => {
        setSelectedRows(prev => {

            if(!prev || prev.length==0){
                message.error(t("请选择角色"));
                return [];
            }

            setGrantMenuVisible(true);
            setGrantMenuRoleId(prev[0].id);

            return prev;
        });
    }

    //显示分配权限
    const grantPermissions = () => {
        setSelectedRows(prev => {

            if(!prev || prev.length==0){
                message.error(t("请选择角色"));
                return [];
            }

            setGrantPermissionVisible(true);
            setGrantPermissionRoleId(prev[0].id);

            return prev;
        });
        
    }

     //更多操作菜单
    const items: MenuProps['items'] = useMemo(()=> {
        let values: MenuProps['items'] = [];
        if(auth.has("sys:role:grant:menu")){
            values.push({
                label: t('分配菜单'),
                key: '1',
                icon: <GrantMenuIcon ghost type='primary' />,
                onClick: grantMenus
            });
        }

        if(auth.has("sys:role:grant:permission")){
            values.push({
                label: t('分配权限'),
                key: '2',
                icon: <GrantPermissionIcon ghost type='primary' />,
                onClick: grantPermissions
            });
        }
        return values;
    }, []);

    return <>
        <RoleQuery onQuery={onQuery}/>
        <Divider />
        <Space wrap>
            <AuthButton type='primary' size={size} tip={t("新增角色")}
                icon={<AddIcon type='primary'/>} 
                onClick={onCreate}
                requiredPermissions={permission.role.create.expression}
            >
                {!onlyIcon && t('新增')}
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t("编辑角色")}
                icon={<EditIcon type='primary'/>} 
                onClick={onEdit}
                requiredPermissions={permission.role.update.expression}
            >
                {!onlyIcon && t('编辑')}
            </AuthButton>
            <AuthButton type='primary' size={size} danger  ghost tip={t("删除角色")}
                icon={<DeleteIcon type='primary' danger ghost/>} 
                onClick={onDelete}
                requiredPermissions={permission.role.delete.expression}
            >
                {!onlyIcon && t('删除')}
            </AuthButton>
            <Dropdown.Button type="primary"
                menu={{ items }}
                icon={<DownOutlined />}
            >
                {t('更多操作')}
            </Dropdown.Button>
        </Space>
        <Divider />
        <RoleList onSelect={onTableSelectChange} query={query} refresh={refresh}/>
        {isOpenEdit && <RoleEdit onClose={onAddClose} role={role}/>}
        {isOpenDelete && <RoleDelete roles={deletes} successCall={onDeleteClose}/> }
        {grantPermissionVisible && <RoleGrantPermisison roleId={grantPermissionRoleId} onClose={() => setGrantPermissionVisible(false)}/>}
        {grantMenuVisible && <RoleGrantMenu roleId={grantMenuRoleId} onClose={() => setGrantMenuVisible(false)}/>}
    </>
}
