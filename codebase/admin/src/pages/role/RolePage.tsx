import React, {useState} from 'react';
import {Tooltip, Space, Divider, App } from "antd"
import { useSelector } from "../../redux/hooks"
import { UserAddIcon, DeleteIcon, EditIcon, } from '../../components/icon/svg/Icons';
import { RoleQueryComponent, RoleListComponent, RoleEdit, RoleDelete } from './index'
import { useTranslation } from '../../components';
import { AdminRole } from '../../common/I18NNamespace';
import { AuthButton } from '../../components/wrap/AuthButton';
import { permission } from '../../common/permission';

/**
 * 角色管理页面
 */
export const RolePage : React.FC = () => {

    const {t} = useTranslation(AdminRole);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const size = useSelector(state => state.themeConfig.componentSize);
    const {message} = App.useApp();
    const [query, setQuery] = useState({});
    const [selectedRows, setSelectedRows] = useState<any>();

    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [role, setRole] = useState();
    const [deletes, setDeletes] = useState<any>([]);
    const [refresh, setRefresh] = useState({
        reset: false,
        tag: 1
    });

    let onQuery = (values) => {
        // console.log(values);
        setQuery(values);
    }

    const onTableSelectChange =  (rows:any) => {
        // console.log(rows);
        setSelectedRows(rows);
    };

    const onEdit = () => {
        if(!selectedRows || selectedRows.length == 0){
            message.error(t("请选择要编辑的角色"));
            return;
        }

        setRole(selectedRows[0]);
        setIsOpenEdit(true);
    }

    const onCreate = () => {
        setIsOpenEdit(true);
        setRole(null);
    }

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
        setDeletes([]);
        setTimeout(() => {
            setDeletes(selectedRows);
        }, 60);
    }

    return <>
        <RoleQueryComponent onQuery={onQuery}/>
        <Divider />
        <Space wrap>
            <Tooltip title={t("新增角色")}>
                <AuthButton type='primary' size={size} 
                    icon={<UserAddIcon type='primary'/>} 
                    onClick={onCreate}
                    requiredPermissions={permission.role.create.expression}
                >
                    {!onlyIcon && t('新增')}
                </AuthButton>
            </Tooltip>
            <Tooltip title={t("编辑角色")}>
                <AuthButton type='primary' size={size} 
                    icon={<EditIcon type='primary'/>} 
                    onClick={onEdit}
                    requiredPermissions={permission.role.update.expression}
                >
                    {!onlyIcon && t('编辑')}
                </AuthButton>
            </Tooltip>
            <Tooltip title={t("删除角色")}>
                <AuthButton type='primary' size={size} danger  ghost
                    icon={<DeleteIcon type='ghostPrimary' />} 
                    onClick={onDelete}
                    requiredPermissions={permission.role.delete.expression}
                >
                    {!onlyIcon && t('删除')}
                </AuthButton>
            </Tooltip>
        </Space>
        <Divider />
        <RoleListComponent onSelect={onTableSelectChange} query={query} refresh={refresh}/>
        <RoleEdit open={isOpenEdit} onClose={onAddClose} role={role}/>
        <RoleDelete roles={deletes} successCall={onRefresh}/>
    </>
}
