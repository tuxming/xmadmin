import React, {useState} from 'react';
import {Space, Divider } from "antd"
import { useSelector } from "../../../redux/hooks"
import { DeleteIcon, EditIcon, AddIcon, } from '../../../components/icon/svg/Icons';
import { RoleQuery, RoleList, RoleEdit, RoleDelete } from './index'
import { useLayer, useTranslation } from '../../../components';
import { AdminRole } from '../../../common/I18NNamespace';
import { AuthButton } from '../../../components/wrap/AuthButton';
import { permission } from '../../../common/permission';

/**
 * 角色管理页面
 */
export const RolePage : React.FC = () => {

    const {t} = useTranslation(AdminRole);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const size = useSelector(state => state.themeConfig.componentSize);
    const {message} = useLayer();
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
        </Space>
        <Divider />
        <RoleList onSelect={onTableSelectChange} query={query} refresh={refresh}/>
        <RoleEdit open={isOpenEdit} onClose={onAddClose} role={role}/>
        <RoleDelete roles={deletes} successCall={onRefresh}/>
    </>
}
