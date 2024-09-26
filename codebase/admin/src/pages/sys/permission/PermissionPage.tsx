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


import React, {useState} from 'react';
import { Button, Tooltip, Space, Divider } from "antd"
import { DeleteIcon, EditIcon, ScanIcon, AddIcon, } from '../../../components/icon/svg/Icons';
import { PermissionList, PermissionEdit, PermissionDelete } from './index'
import { useSelector, useTranslation } from '../../../hooks';
import { AuthButton, QueryComponent, useLayer} from '../../../components';
import { AdminPermission } from '../../../common/I18NNamespace';
import { PermissionScan } from './PermissionScan';
import { permission } from '../../../common/permission';


export const PermissionPage : React.FC = () => {

    const {t} = useTranslation(AdminPermission);
    const onlyIcon = useSelector(state => state.themeConfig.onlyIcon);
    const size = useSelector(state => state.themeConfig.componentSize);
    const {message} = useLayer();
    const [query, setQuery] = useState({});
    const [selectedRows, setSelectedRows] = useState<any>();

    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [isOpenScan, setIsOpenScan] = useState(false);
    const [currPermission, setCurrPermission] = useState();
    
    const [deletes, setDeletes] = useState<any>([]);
    const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);

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

    //打开编辑弹窗
    const onEdit = () => {
        if(!selectedRows || selectedRows.length == 0){
            message.error(t("请选择要编辑的权限"));
            return;
        }

        setCurrPermission(selectedRows[0]);
        setIsOpenEdit(true);
        setTitle(t("编辑权限"));
    }

    //打开创建弹窗
    const onCreate = () => {
        setIsOpenEdit(true);
        setCurrPermission(null);
        setTitle(t("添加权限"));
    }

    //编辑，新建的弹窗回调函数
    const onAddClose = (needRefresh) => {
        if(needRefresh){
            setRefresh({reset: false, tag: refresh.tag+1});
        }
        setIsOpenEdit(false)
    }
    
     /**
     * 执行删除
     */
     const onDelete = () => {
        if(!selectedRows || selectedRows.length==0){
            message.error(t("请选择要删除的权限"));
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
            <AuthButton type='primary' size={size} tip={t('新增用户' )}
                icon={<AddIcon type='primary'/>}
                requiredPermissions={permission.permission.create.expression}
                onClick={onCreate}
            >
                {!onlyIcon && t('新增')}
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t('编辑权限' )}
                icon={<EditIcon type='primary'/>}
                requiredPermissions={permission.permission.update.expression}
                onClick={onEdit}
            >
                {!onlyIcon && t('编辑')}
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t('扫描权限' )}
                icon={<ScanIcon type='primary'/>}
                requiredPermissions={permission.permission.scan.expression}
                onClick={onScan}
            >
                {!onlyIcon && t('扫描')}
            </AuthButton>
            <AuthButton type='primary' size={size} tip={t('删除权限' )}
                icon={<DeleteIcon type='primary' ghost danger/>}
                requiredPermissions={permission.permission.delete.expression}
                ghost danger
                onClick={onDelete}
            >
                {!onlyIcon && t('删除')}
            </AuthButton>
        </Space>
        <Divider />
        <PermissionList onSelect={onTableSelectChange} query={query} refresh={refresh}/>
        {isOpenEdit && <PermissionEdit onClose={onAddClose} permission={currPermission} title={title}/>}
        {isOpenDelete && <PermissionDelete permissions={deletes} successCall={onDeleteClose}/>}
        {isOpenScan && <PermissionScan onClose={onScanClose}></PermissionScan>}
    </>
}