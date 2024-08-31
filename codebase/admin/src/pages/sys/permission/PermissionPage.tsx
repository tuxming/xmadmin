
import React, {useState} from 'react';
import { Button, Tooltip, Space, Divider, App } from "antd"
import { useSelector } from "../../../redux/hooks"
import { DeleteIcon, EditIcon, ScanIcon, AddIcon, } from '../../../components/icon/svg/Icons';
import { PermissionList, PermissionEdit, PermissionDelete } from './index'
import { QueryComponent, useTranslation } from '../../../components';
import { AdminPermission } from '../../../common/I18NNamespace';
import { PermissionScan } from './PermissionScan';


export const PermissionPage : React.FC = () => {

    const {t} = useTranslation(AdminPermission);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const size = useSelector(state => state.themeConfig.componentSize);
    const {message} = App.useApp();
    const [query, setQuery] = useState({});
    const [selectedRows, setSelectedRows] = useState<any>();

    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [isOpenScan, setIsOpenScan] = useState(false);
    const [permission, setPermission] = useState();
    const [deletes, setDeletes] = useState<any>([]);
    const [refresh, setRefresh] = useState({
        reset: false,
        tag: 1
    });
    const [title, setTitle] = useState("");

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
            message.error(t("请选择要编辑的权限"));
            return;
        }

        setPermission(selectedRows[0]);
        setIsOpenEdit(true);
        setTitle(t("编辑权限"));
    }

    const onCreate = () => {
        setIsOpenEdit(true);
        setPermission(null);
        setTitle(t("添加权限"));
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
            message.error(t("请选择要删除的权限"));
            return;
        }
        setDeletes([]);
        setTimeout(() => {
            setDeletes(selectedRows);
        }, 60);
    }
    
    const onScan = () => {
        setIsOpenScan(true);
    }

    const onScanClose = (needRefresh)=>{
        if(needRefresh){
            setRefresh({reset: false, tag: refresh.tag+1});
        }
        setIsOpenScan(false)
    }

    return <>
        <QueryComponent onQuery={onQuery} />
        <Divider />
        <Space wrap>
            <Tooltip title={t("新增权限")}>
                <Button type='primary' size={size} icon={<AddIcon type='primary'/>} onClick={onCreate}>{!onlyIcon && t('新增')}</Button>
            </Tooltip>
            <Tooltip title={t("编辑权限")}>
                <Button type='primary' size={size} icon={<EditIcon type='primary'/>} onClick={onEdit}>{!onlyIcon && t('编辑')}</Button>
            </Tooltip>
            <Tooltip title={t("扫描权限")}>
                <Button type='primary' size={size} icon={<ScanIcon type='primary'/>} onClick={onScan}>{!onlyIcon && t('扫描')}</Button>
            </Tooltip>
            <Tooltip title={t("删除权限")}>
                <Button type='primary' size={size} icon={<DeleteIcon type='primary' ghost danger/>} 
                    onClick={onDelete} ghost danger
                >
                    {!onlyIcon && t('删除')}
            </Button>
            </Tooltip>
        </Space>
        <Divider />
        <PermissionList onSelect={onTableSelectChange} query={query} refresh={refresh}/>
        {isOpenEdit && <PermissionEdit open={isOpenEdit} onClose={onAddClose} permission={permission} title={title}/>}
        <PermissionDelete permissions={deletes} successCall={onRefresh}/>
        {isOpenScan && <PermissionScan open={isOpenScan} onClose={onScanClose}></PermissionScan>}
    </>
}